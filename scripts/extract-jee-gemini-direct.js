#!/usr/bin/env node
/**
 * JEE Question & Diagram Extractor with Google Gemini
 * Direct diagram extraction - Gemini extracts the diagram directly
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { fromPath } = require('pdf2pic');
const Tesseract = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize services
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

class JEEExtractorGeminiDirect {
  constructor() {
    this.outputDir = path.join(__dirname, '../data/previous-year/jee');
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
    const maxPages = 1; // Test with just 1 page
    
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

  // Extract questions and identify diagrams using Gemini
  async extractQuestionsAndDiagrams(pageImage, pageNum) {
    console.log(`  📄 Processing page ${pageNum}...`);
    
    try {
      // Read image
      const imageBuffer = fs.readFileSync(pageImage);
      const base64Image = imageBuffer.toString('base64');
      
      // First prompt: Extract questions and identify which have diagrams
      const questionsPrompt = `Analyze this JEE exam page and extract ALL physics questions.

For EACH physics question on this page:
1. Extract the complete question text with all options
2. Identify if it has a diagram/figure
3. Identify the question number

Return in this JSON format:
{
  "questions": [
    {
      "number": <question number>,
      "text": "complete question text",
      "options": [
        {"label": "A", "text": "option text"},
        {"label": "B", "text": "option text"},
        {"label": "C", "text": "option text"},
        {"label": "D", "text": "option text"}
      ],
      "has_diagram": true/false,
      "subject": "PHYSICS",
      "topic": "specific physics topic"
    }
  ]
}

Only include PHYSICS questions.`;

      const questionsResult = await geminiModel.generateContent([
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        },
        questionsPrompt
      ]);

      const questionsResponse = await questionsResult.response;
      const questionsText = questionsResponse.text();
      
      // Extract JSON from response
      const jsonMatch = questionsText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log("    Failed to extract questions");
        return [];
      }
      
      const pageData = JSON.parse(jsonMatch[0]);
      const questions = pageData.questions || [];
      
      console.log(`    Found ${questions.length} physics questions`);
      
      // For each question with a diagram, extract it
      for (const question of questions) {
        question.page_number = pageNum;
        
        if (question.has_diagram && question.number) {
          console.log(`    📐 Extracting diagram for Q${question.number}...`);
          
          // Your exact prompt for diagram extraction
          const diagramPrompt = `extract the diagram as a seperate image and also tell me what question was it for`;
          
          try {
            const diagramResult = await geminiModel.generateContent([
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Image
                }
              },
              diagramPrompt
            ]);
            
            const diagramResponse = await diagramResult.response;
            const diagramText = diagramResponse.text();
            
            console.log(`      Response: ${diagramText.substring(0, 100)}...`);
            
            // Since Gemini can't directly return an image, we need a different approach
            // Let's ask it to describe exactly where the diagram is
            const locationPrompt = `For question ${question.number} on this JEE physics page, describe EXACTLY where the diagram is located. Give me:
1. What the diagram shows (e.g., "two masses connected by a string")
2. Where it's positioned relative to the question text (e.g., "to the right of question 3")
3. Any labels or symbols in the diagram

Be very specific.`;

            const locationResult = await geminiModel.generateContent([
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Image
                }
              },
              locationPrompt
            ]);
            
            const locationResponse = await locationResult.response;
            const locationText = locationResponse.text();
            
            question.diagram_description = locationText;
            console.log(`      Diagram info: ${locationText.substring(0, 100)}...`);
            
            // Mark that we identified the diagram but couldn't extract it directly
            question.diagram_identified = true;
            question.extraction_note = "Gemini cannot directly extract images. Manual extraction needed.";
          } catch (error) {
            console.log(`      Failed to process diagram: ${error.message}`);
          }
        }
      }
      
      return questions;
      
    } catch (error) {
      console.log(`    Error processing page: ${error.message}`);
      return [];
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
    
    // Step 2: Extract questions and identify diagrams
    console.log('\n🤖 Extracting questions with Gemini...');
    const allQuestions = [];
    
    for (let i = 0; i < pageImages.length; i++) {
      const pageQuestions = await this.extractQuestionsAndDiagrams(pageImages[i], i + 1);
      allQuestions.push(...pageQuestions);
    }
    
    console.log(`  ✓ Total physics questions found: ${allQuestions.length}`);
    
    // Save results
    const outputPath = path.join(this.outputDir, `${pdfName}_complete.json`);
    fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
    
    // Summary
    const questionsWithDiagrams = allQuestions.filter(q => q.has_diagram);
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Physics Questions: ${allQuestions.length}`);
    console.log(`Questions with Diagrams: ${questionsWithDiagrams.length}`);
    
    if (questionsWithDiagrams.length > 0) {
      console.log('\n📌 Note: Gemini identified diagrams but cannot extract them as separate images.');
      console.log('For actual diagram extraction, consider:');
      console.log('  1. Using Google Document AI or Azure Computer Vision');
      console.log('  2. Manual extraction with image editing tools');
      console.log('  3. Using specialized OCR tools with region detection');
      
      console.log('\nDiagrams identified:');
      questionsWithDiagrams.forEach(q => {
        console.log(`  Q${q.number}: ${q.diagram_description?.substring(0, 100) || 'No description'}...`);
      });
    }
    
    console.log(`\nResults saved to: ${outputPath}`);
    
    return allQuestions;
  }
}

// Main execution
async function main() {
  const extractor = new JEEExtractorGeminiDirect();
  
  // Check configuration
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.log('\n⚠️  GOOGLE_GEMINI_API_KEY not configured');
    console.log('📌 To get your free API key:');
    console.log('   1. Go to: https://makersuite.google.com/app/apikey');
    console.log('   2. Click "Create API Key"');
    console.log('   3. Add to .env.local: GOOGLE_GEMINI_API_KEY=your-key-here');
    return;
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
  console.log('\n💡 Important: Gemini API cannot directly extract image regions.');
  console.log('The diagrams have been identified but need manual or specialized tool extraction.\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = JEEExtractorGeminiDirect;