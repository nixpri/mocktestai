#!/usr/bin/env node
/**
 * JEE Question & Diagram Extractor with Azure Form Recognizer
 * Complete pipeline: OCR → Question Extraction → Diagram Detection
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { fromPath } = require('pdf2pic');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const FormData = require('form-data');

// Initialize services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

class JEEExtractorAzure {
  constructor() {
    this.azureEndpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
    this.azureKey = process.env.AZURE_FORM_RECOGNIZER_KEY;
    this.questions = [];
    this.pageImages = {};
  }

  // STEP 1: Convert PDF to images and extract text with OCR
  async extractTextFromPDF(pdfPath) {
    console.log('📄 Extracting text from PDF...');
    const tempDir = path.join(path.dirname(pdfPath), 'temp_images');
    const pageImagesDir = path.join(path.dirname(pdfPath), 'page_images');
    
    // Create directories
    [tempDir, pageImagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const options = {
      density: 300,
      saveFilename: path.basename(pdfPath, '.pdf'),
      savePath: tempDir,
      format: "png",
      width: 2480,
      height: 3508
    };

    const converter = fromPath(pdfPath, options);
    let allText = '';
    
    // Process pages
    const maxPages = 10; // Process 10 pages
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`  Processing page ${pageNum}...`);
        const result = await converter(pageNum);
        const imagePath = result.path;
        
        // OCR the page
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
        allText += `\n--- Page ${pageNum} ---\n${text}`;
        
        // Save page image
        const pageImagePath = path.join(pageImagesDir, `${path.basename(pdfPath, '.pdf')}_page_${pageNum}.png`);
        await fs.promises.copyFile(imagePath, pageImagePath);
        this.pageImages[pageNum] = pageImagePath;
        
        // Clean up
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      } catch (error) {
        console.log(`  Page ${pageNum} failed: ${error.message}`);
        break;
      }
    }
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    
    return allText;
  }

  // STEP 2: Extract questions using Claude AI
  async extractQuestions(text) {
    console.log('🤖 Extracting physics questions...');
    const pages = text.split(/--- Page \d+ ---/);
    const questions = [];
    
    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      const pageText = pages[pageIdx].trim();
      if (!pageText || pageText.length < 50) continue;
      
      const pageNumber = pageIdx; // Page numbering starts from 1 in pageImages
      
      // Find question patterns
      const questionMatches = pageText.matchAll(/(\d+)\.\s+(.+?)(?=\n\d+\.|$)/gs);
      
      for (const match of questionMatches) {
        const questionNumber = parseInt(match[1]);
        const questionText = match[2];
        
        // Use AI to parse the question
        const parsed = await this.parseQuestion(questionText, questionNumber, pageNumber);
        if (parsed && parsed.subject === 'PHYSICS') {
          questions.push(parsed);
        }
      }
    }
    
    return questions;
  }

  // Parse individual question with AI
  async parseQuestion(text, number, pageNumber) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return this.parseManually(text, number, pageNumber);
    }

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1000,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Extract this JEE physics question. Return JSON only:
Question: ${text}

{
  "number": ${number},
  "text": "question with LaTeX",
  "page_number": ${pageNumber || 1},
  "has_diagram": boolean,
  "options": [{"label": "A", "text": ""}, ...],
  "subject": "PHYSICS or CHEMISTRY or MATHEMATICS",
  "topic": "specific topic"
}`
        }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure page_number is set
        if (parsed.page_number === null || parsed.page_number === undefined) {
          parsed.page_number = pageNumber || 1;
        }
        return parsed;
      }
    } catch (error) {
      console.log(`  AI parsing failed for Q${number}`);
    }
    
    return this.parseManually(text, number, pageNumber);
  }

  // Manual parsing fallback
  parseManually(text, number, pageNumber) {
    const hasPhysicsKeywords = /force|mass|velocity|energy|circuit|resistance|mirror|wave/i.test(text);
    const hasChemKeywords = /bond|compound|organic|element|reaction/i.test(text);
    
    return {
      number: number,
      text: text.substring(0, 200),
      page_number: pageNumber || 1,
      has_diagram: /figure|diagram|shown|circuit/i.test(text),
      options: [
        { label: "A", text: "Option A" },
        { label: "B", text: "Option B" },
        { label: "C", text: "Option C" },
        { label: "D", text: "Option D" }
      ],
      subject: hasChemKeywords ? 'CHEMISTRY' : 'PHYSICS',
      topic: 'General Physics'
    };
  }

  // STEP 3: Extract diagrams using Azure Form Recognizer
  async extractDiagramsWithAzure(questions, pdfName) {
    console.log('🎯 Extracting diagrams with Azure Form Recognizer...');
    
    if (!this.azureEndpoint || !this.azureKey) {
      console.log('  ❌ Azure credentials not configured');
      return questions;
    }

    const diagramsDir = path.join(path.dirname(Object.values(this.pageImages)[0]), '..', 'extracted_diagrams');
    if (!fs.existsSync(diagramsDir)) {
      fs.mkdirSync(diagramsDir, { recursive: true });
    }

    const questionsWithDiagrams = questions.filter(q => q.has_diagram);
    let extractedCount = 0;

    for (const question of questionsWithDiagrams) {
      const pageImagePath = this.pageImages[question.page_number];
      console.log(`  Looking for page ${question.page_number} image: ${pageImagePath}`);
      if (!pageImagePath || !fs.existsSync(pageImagePath)) {
        console.log(`    ❌ Page image not found`);
        continue;
      }

      console.log(`  Analyzing Q${question.number} on page ${question.page_number}...`);
      
      try {
        // Analyze page with Azure
        const diagrams = await this.analyzePageWithAzure(pageImagePath);
        console.log(`    Found ${diagrams.length} diagram regions`);
        
        // If Azure doesn't find diagrams, use Claude vision
        if (diagrams.length === 0 && process.env.ANTHROPIC_API_KEY) {
          console.log(`    No diagrams from Azure, trying Claude vision...`);
          const claudeDiagram = await this.detectWithClaude(pageImagePath, question);
          if (claudeDiagram) {
            diagrams.push(claudeDiagram);
          }
        }
        
        if (diagrams.length > 0) {
          // Find the most likely diagram for this question
          const bestDiagram = this.selectBestDiagram(diagrams, question);
          
          if (bestDiagram) {
            const diagramPath = path.join(diagramsDir, `${pdfName}_q${question.number}_diagram.png`);
            
            // Extract the diagram region
            await sharp(pageImagePath)
              .extract({
                left: Math.round(bestDiagram.left),
                top: Math.round(bestDiagram.top),
                width: Math.round(bestDiagram.width),
                height: Math.round(bestDiagram.height)
              })
              .toFile(diagramPath);
            
            const stats = fs.statSync(diagramPath);
            question.diagram_path = `extracted_diagrams/${path.basename(diagramPath)}`;
            question.diagram_extracted = true;
            question.diagram_size_kb = (stats.size / 1024).toFixed(1);
            extractedCount++;
            
            console.log(`    ✅ Extracted diagram (${question.diagram_size_kb} KB)`);
          }
        }
      } catch (error) {
        console.log(`    ❌ Failed: ${error.message}`);
      }
    }

    console.log(`  Extracted ${extractedCount}/${questionsWithDiagrams.length} diagrams`);
    return questions;
  }

  // Analyze page with Azure Form Recognizer
  async analyzePageWithAzure(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const formData = new FormData();
    formData.append('file', imageBuffer, 'image.png');
    
    try {
      // Start analysis
      const response = await axios.post(
        `${this.azureEndpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Ocp-Apim-Subscription-Key': this.azureKey,
          }
        }
      );
      
      const operationLocation = response.headers['operation-location'];
      
      // Poll for results
      let result;
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const resultResponse = await axios.get(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.azureKey,
          }
        });
        
        if (resultResponse.data.status === 'succeeded') {
          result = resultResponse.data.analyzeResult;
          break;
        }
      }
      
      // Extract figure regions
      const diagrams = [];
      
      console.log(`    Azure detected ${result?.figures?.length || 0} figures`);
      console.log(`    Azure detected ${result?.tables?.length || 0} tables`);
      console.log(`    Azure detected ${result?.paragraphs?.length || 0} paragraphs`);
      
      // Also check for tables which might contain diagrams
      if (result && result.tables) {
        result.tables.forEach(table => {
          const bounds = table.boundingRegions[0];
          if (bounds && bounds.polygon) {
            const points = [];
            for (let i = 0; i < bounds.polygon.length; i += 2) {
              points.push({ x: bounds.polygon[i], y: bounds.polygon[i + 1] });
            }
            
            diagrams.push({
              left: Math.min(...points.map(p => p.x)),
              top: Math.min(...points.map(p => p.y)),
              right: Math.max(...points.map(p => p.x)),
              bottom: Math.max(...points.map(p => p.y)),
              width: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
              height: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)),
              confidence: 0.7,
              type: 'table'
            });
          }
        });
      }
      
      if (result && result.figures) {
        result.figures.forEach(figure => {
          const bounds = figure.boundingRegions[0];
          if (bounds && bounds.polygon) {
            const points = [];
            for (let i = 0; i < bounds.polygon.length; i += 2) {
              points.push({ x: bounds.polygon[i], y: bounds.polygon[i + 1] });
            }
            
            diagrams.push({
              left: Math.min(...points.map(p => p.x)),
              top: Math.min(...points.map(p => p.y)),
              right: Math.max(...points.map(p => p.x)),
              bottom: Math.max(...points.map(p => p.y)),
              width: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
              height: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)),
              confidence: figure.confidence || 0.5
            });
          }
        });
      }
      
      return diagrams;
    } catch (error) {
      console.log(`    Azure error: ${error.message}`);
      return [];
    }
  }

  // Detect diagram with Claude vision
  async detectWithClaude(imagePath, question) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const metadata = await sharp(imagePath).metadata();
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 300,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `Find the physics diagram/figure for Question ${question.number || '(number missing)'}.
Question text: "${(question.text || '').substring(0, 150)}..."

Look for visual elements like:
- Circuit diagrams with components
- Geometric figures (triangles, circles, angles)
- Physical systems (masses, springs, pulleys, strings)
- Graphs or coordinate systems
- Ray diagrams (mirrors, lenses)

The diagram is typically on the RIGHT side of the page.
Measure ONLY the diagram itself, excluding surrounding text.

Return pixel coordinates of the TIGHTEST box around the diagram:
{"left": <x coordinate>, "top": <y coordinate>, "width": <width>, "height": <height>}

Page dimensions: ${metadata.width}x${metadata.height}px`
            }
          ]
        }]
      });
      
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const bounds = JSON.parse(jsonMatch[0]);
        console.log(`    Claude found diagram at: ${bounds.left},${bounds.top} ${bounds.width}x${bounds.height}`);
        return {
          left: bounds.left,
          top: bounds.top,
          right: bounds.left + bounds.width,
          bottom: bounds.top + bounds.height,
          width: bounds.width,
          height: bounds.height,
          confidence: 0.9,
          type: 'claude'
        };
      }
    } catch (error) {
      console.log(`    Claude detection failed: ${error.message}`);
    }
    return null;
  }
  
  // Select best diagram for a question
  selectBestDiagram(diagrams, question) {
    // For JEE papers, diagrams are typically on the right side
    // and near the question number position
    
    // Filter diagrams on the right side of the page
    const rightSideDiagrams = diagrams.filter(d => d.left > 1000);
    
    if (rightSideDiagrams.length === 0) return null;
    
    // Sort by confidence and size
    rightSideDiagrams.sort((a, b) => {
      const aScore = a.confidence * (a.width * a.height);
      const bScore = b.confidence * (b.width * b.height);
      return bScore - aScore;
    });
    
    return rightSideDiagrams[0];
  }

  // Main processing function with batch processing
  async processPDF(pdfPath) {
    const pdfName = path.basename(pdfPath, '.pdf');
    const outputDir = path.dirname(pdfPath);
    
    console.log('\n' + '═'.repeat(60));
    console.log(`PROCESSING: ${pdfName}`);
    console.log('═'.repeat(60) + '\n');
    
    const tempDir = path.join(outputDir, 'temp_images');
    const pageImagesDir = path.join(outputDir, 'page_images');
    
    // Create directories
    [tempDir, pageImagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const options = {
      density: 300,
      saveFilename: pdfName,
      savePath: tempDir,
      format: "png",
      width: 2480,
      height: 3508
    };

    const converter = fromPath(pdfPath, options);
    const allQuestions = [];
    const maxPages = 10;
    const batchSize = 2; // Process 2 pages at a time
    
    console.log(`📄 Processing ${maxPages} pages in batches of ${batchSize}...`);
    
    for (let batchStart = 1; batchStart <= maxPages; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize - 1, maxPages);
      console.log(`\n📋 Batch: Pages ${batchStart}-${batchEnd}`);
      
      let batchText = '';
      const batchPageImages = {};
      
      // Step 1: Extract text from batch
      for (let pageNum = batchStart; pageNum <= batchEnd; pageNum++) {
        try {
          console.log(`  • Extracting page ${pageNum}...`);
          const result = await converter(pageNum);
          const imagePath = result.path;
          
          // OCR the page
          const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
          batchText += `\n--- Page ${pageNum} ---\n${text}`;
          
          // Save page image
          const pageImagePath = path.join(pageImagesDir, `${pdfName}_page_${pageNum}.png`);
          await fs.promises.copyFile(imagePath, pageImagePath);
          batchPageImages[pageNum] = pageImagePath;
          this.pageImages[pageNum] = pageImagePath;
          
          // Clean up temp image
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        } catch (error) {
          console.log(`    ⚠️ Page ${pageNum} failed: ${error.message}`);
          break;
        }
      }
      
      // Step 2: Extract questions from batch
      console.log(`  • Parsing questions...`);
      const batchQuestions = await this.extractQuestions(batchText);
      const physicsQuestions = batchQuestions.filter(q => q.subject === 'PHYSICS');
      console.log(`    Found ${physicsQuestions.length} physics questions`);
      
      // Step 3: Extract diagrams for batch questions
      if (physicsQuestions.length > 0) {
        console.log(`  • Extracting diagrams...`);
        const questionsWithDiagrams = await this.extractDiagramsWithAzure(physicsQuestions, pdfName);
        allQuestions.push(...questionsWithDiagrams);
      }
      
      // Save intermediate results
      const outputPath = path.join(outputDir, `${pdfName}_complete.json`);
      fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
      console.log(`  ✓ Batch complete. Total questions: ${allQuestions.length}`);
      
      // Small delay between batches
      if (batchEnd < maxPages) {
        console.log(`  ⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    
    // Final summary
    console.log('\n📊 SUMMARY');
    console.log('─'.repeat(40));
    console.log(`Physics Questions: ${allQuestions.length}`);
    console.log(`Questions with Diagrams: ${allQuestions.filter(q => q.has_diagram).length}`);
    console.log(`Diagrams Extracted: ${allQuestions.filter(q => q.diagram_extracted).length}`);
    
    const outputPath = path.join(outputDir, `${pdfName}_complete.json`);
    console.log(`\n✅ Results saved to: ${outputPath}`);
    
    return allQuestions;
  }
}

// Main execution
async function main() {
  const extractor = new JEEExtractorAzure();
  
  // Check configuration
  if (!process.env.AZURE_FORM_RECOGNIZER_ENDPOINT || !process.env.AZURE_FORM_RECOGNIZER_KEY) {
    console.log('⚠️  Azure Form Recognizer not configured');
    console.log('  Add AZURE_FORM_RECOGNIZER_ENDPOINT and AZURE_FORM_RECOGNIZER_KEY to .env.local');
  }
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️  Claude AI not configured (using basic extraction)');
  }
  
  // Process PDFs
  const dataDir = path.join(__dirname, '../data/previous-year/jee');
  const pdfFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    console.error('No PDF files found');
    return;
  }
  
  // Process first PDF
  const pdfPath = path.join(dataDir, pdfFiles[0]);
  await extractor.processPDF(pdfPath);
  
  console.log('\n✅ EXTRACTION COMPLETE');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = JEEExtractorAzure;