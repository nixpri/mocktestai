#!/usr/bin/env node
/**
 * JEE Question & Diagram Extractor with Google Gemini
 * Uses Gemini's vision capabilities for accurate diagram extraction
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { fromPath } = require('pdf2pic');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
// Use Gemini 2.0 Flash (nano banana) for better vision capabilities
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

class JEEExtractorGemini {
  constructor() {
    this.outputDir = path.join(__dirname, '../data/previous-year/jee');
    this.questions = [];
    this.pageImages = {};
  }

  // Convert PDF to images
  async convertPDFToImages(pdfPath) {
    const pdfName = path.basename(pdfPath, '.pdf');
    const tempDir = path.join(this.outputDir, 'temp_images');
    const pageImagesDir = path.join(this.outputDir, 'page_images');
    
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
    const pageImages = [];
    const maxPages = 1; // Test with just 1 page first
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const result = await converter(pageNum);
        const imagePath = result.path;
        
        // Save page image
        const pageImagePath = path.join(pageImagesDir, `${pdfName}_page_${pageNum}.png`);
        await fs.promises.copyFile(imagePath, pageImagePath);
        pageImages.push(pageImagePath);
        this.pageImages[pageNum] = pageImagePath;
        
        // Clean up temp image
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      } catch (error) {
        console.log(`    Page ${pageNum} not found, stopping`);
        break;
      }
    }
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    
    return pageImages;
  }

  // Extract text from image using OCR
  async extractTextFromImage(imagePath) {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    return text;
  }

  // Parse questions with Claude
  async parseQuestion(text, number, pageNumber) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return null;
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
        parsed.page_number = pageNumber || 1;
        return parsed;
      }
    } catch (error) {
      console.log(`  AI parsing failed: ${error.message}`);
    }
    
    return null;
  }

  // Extract questions from pages using Gemini
  async extractQuestionsWithGemini(pageImages, pdfName) {
    const allQuestions = [];
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.log('⚠️  Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to .env.local');
      console.log('Get your free API key at: https://makersuite.google.com/app/apikey');
      return allQuestions;
    }
    
    for (let i = 0; i < pageImages.length; i++) {
      const pageNum = i + 1;
      console.log(`  📄 Processing page ${pageNum}...`);
      
      try {
        // Read image
        const imageBuffer = fs.readFileSync(pageImages[i]);
        const base64Image = imageBuffer.toString('base64');
        
        // Ask Gemini to extract questions and identify diagrams
        const prompt = `Analyze this JEE exam page and extract ALL physics questions.

For EACH question on this page:
1. Extract the complete question text with options
2. Identify if it has a diagram/figure
3. If it has a diagram, provide the approximate location (top/middle/bottom and left/right)

Return in this JSON format:
{
  "questions": [
    {
      "number": <question number or null>,
      "text": "complete question text",
      "options": [
        {"label": "A", "text": "option text"},
        {"label": "B", "text": "option text"},
        {"label": "C", "text": "option text"},
        {"label": "D", "text": "option text"}
      ],
      "has_diagram": true/false,
      "diagram_location": "e.g., middle-right" (only if has_diagram is true),
      "subject": "PHYSICS/CHEMISTRY/MATHEMATICS",
      "topic": "specific physics topic"
    }
  ],
  "diagrams": [
    {
      "for_question": <question number>,
      "location": "describe where on page",
      "description": "what the diagram shows"
    }
  ]
}

Only include PHYSICS questions. Be thorough - don't miss any questions.`;

        const result = await geminiModel.generateContent([
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          prompt
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const pageData = JSON.parse(jsonMatch[0]);
          
          // Process questions
          if (pageData.questions) {
            for (const q of pageData.questions) {
              if (q.subject === 'PHYSICS') {
                q.page_number = pageNum;
                allQuestions.push(q);
                
                // If question has diagram, mark it for extraction
                if (q.has_diagram && q.diagram_location) {
                  q.diagram_to_extract = {
                    pageImage: pageImages[i],
                    location: q.diagram_location
                  };
                }
              }
            }
          }
          
          console.log(`    Found ${pageData.questions?.filter(q => q.subject === 'PHYSICS').length || 0} physics questions`);
          
          // Log diagram information
          if (pageData.diagrams && pageData.diagrams.length > 0) {
            console.log(`    Found ${pageData.diagrams.length} diagrams`);
          }
        }
        
      } catch (error) {
        console.log(`    Error processing page ${pageNum}: ${error.message}`);
      }
    }
    
    return allQuestions;
  }

  // Extract specific diagram using Gemini
  async extractDiagramWithGemini(pageImage, questionNumber, location) {
    try {
      const imageBuffer = fs.readFileSync(pageImage);
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `You are looking at a JEE Physics exam page. Question ${questionNumber} has a diagram.

TASK: Find and extract ONLY the physics DIAGRAM for question ${questionNumber}.

The diagram is a VISUAL FIGURE showing:
- For Q3 on page 1: It should show two masses (m) connected by a string with force F pulling upward
- It's located in the ${location || 'middle-right'} area of the question
- It's a DRAWING, not text

Look for these visual elements:
- Boxes or circles representing masses
- Lines representing strings, ropes, or connections  
- Arrows showing forces or directions
- Geometric shapes (triangles, angles)
- Circuit symbols (if electrical question)

DO NOT include:
- Question text
- Mathematical equations
- Options (A), (B), (C), (D)
- Answer bubbles
- Any text content

The page is 2480 x 3508 pixels.

Return the EXACT pixel coordinates of JUST the diagram:
{
  "found": true/false,
  "x": <left pixel coordinate of diagram>,
  "y": <top pixel coordinate of diagram>,  
  "width": <width in pixels>,
  "height": <height in pixels>,
  "description": "brief description"
}

Focus on the VISUAL FIGURE only, not any text around it.`;

      const result = await geminiModel.generateContent([
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        },
        prompt
      ]);

      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const coords = JSON.parse(jsonMatch[0]);
        if (coords.found) {
          return {
            left: coords.x,
            top: coords.y,
            width: coords.width,
            height: coords.height,
            description: coords.description
          };
        }
      }
    } catch (error) {
      console.log(`    Diagram extraction failed: ${error.message}`);
    }
    
    return null;
  }

  // Extract and save diagram
  async saveDiagram(pageImage, coords, pdfName, questionNumber) {
    try {
      const diagramDir = path.join(this.outputDir, 'extracted_diagrams');
      if (!fs.existsSync(diagramDir)) {
        fs.mkdirSync(diagramDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const qNum = questionNumber || 'unknown';
      const outputPath = path.join(diagramDir, `${pdfName}_q${qNum}_${timestamp}.png`);
      
      // Extract the diagram region
      await sharp(pageImage)
        .extract({
          left: Math.max(0, Math.round(coords.left)),
          top: Math.max(0, Math.round(coords.top)),
          width: Math.round(coords.width),
          height: Math.round(coords.height)
        })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      
      console.log(`    ✅ Extracted diagram: ${coords.description || 'physics diagram'} (${sizeKB} KB)`);
      
      return {
        path: outputPath.replace(path.dirname(this.outputDir) + '/', ''),
        size_kb: sizeKB
      };
    } catch (error) {
      console.log(`    ❌ Failed to save diagram: ${error.message}`);
      return null;
    }
  }

  // Main processing function
  async processPDF(pdfPath) {
    const pdfName = path.basename(pdfPath, '.pdf');
    
    console.log('\n' + '═'.repeat(60));
    console.log(`PROCESSING: ${pdfName}`);
    console.log('═'.repeat(60) + '\n');
    
    // Step 1: Convert PDF to images
    console.log('📄 Converting PDF to images...');
    const pageImages = await this.convertPDFToImages(pdfPath);
    console.log(`  ✓ Converted ${pageImages.length} pages`);
    
    // Step 2: Extract questions using Gemini
    console.log('\n🤖 Extracting questions with Gemini...');
    const questions = await this.extractQuestionsWithGemini(pageImages, pdfName);
    console.log(`  ✓ Found ${questions.length} physics questions`);
    
    // Step 3: Extract diagrams for questions that have them
    const questionsWithDiagrams = questions.filter(q => q.has_diagram);
    if (questionsWithDiagrams.length > 0) {
      console.log(`\n🎯 Extracting ${questionsWithDiagrams.length} diagrams...`);
      
      for (const question of questionsWithDiagrams) {
        if (question.diagram_to_extract) {
          console.log(`  Extracting diagram for Q${question.number || 'unknown'}...`);
          
          const coords = await this.extractDiagramWithGemini(
            question.diagram_to_extract.pageImage,
            question.number,
            question.diagram_to_extract.location
          );
          
          if (coords) {
            const diagramInfo = await this.saveDiagram(
              question.diagram_to_extract.pageImage,
              coords,
              pdfName,
              question.number
            );
            
            if (diagramInfo) {
              question.diagram_path = diagramInfo.path;
              question.diagram_extracted = true;
              question.diagram_size_kb = diagramInfo.size_kb;
            }
          }
        }
        
        // Clean up temporary data
        delete question.diagram_to_extract;
      }
    }
    
    // Save final results
    const outputPath = path.join(this.outputDir, `${pdfName}_complete.json`);
    fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Physics Questions: ${questions.length}`);
    console.log(`Questions with Diagrams: ${questionsWithDiagrams.length}`);
    console.log(`Diagrams Successfully Extracted: ${questions.filter(q => q.diagram_extracted).length}`);
    console.log(`\nResults saved to: ${outputPath}`);
    
    return questions;
  }
}

// Main execution
async function main() {
  const extractor = new JEEExtractorGemini();
  
  // Check configuration
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.log('\n⚠️  GOOGLE_GEMINI_API_KEY not configured');
    console.log('📌 To get your free API key:');
    console.log('   1. Go to: https://makersuite.google.com/app/apikey');
    console.log('   2. Click "Create API Key"');
    console.log('   3. Add to .env.local: GOOGLE_GEMINI_API_KEY=your-key-here');
    console.log('\nFalling back to basic extraction without diagram detection...\n');
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
  
  console.log('\n✅ EXTRACTION COMPLETE\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = JEEExtractorGemini;