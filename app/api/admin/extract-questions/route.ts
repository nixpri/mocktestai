import { NextRequest, NextResponse } from 'next/server';
import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Increase timeout for processing multiple pages

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const year = formData.get('year') as string || new Date().getFullYear().toString();
    const exam = formData.get('exam') as string || 'JEE Main';
    const subject = formData.get('subject') as string || 'Physics';
    const session = formData.get('session') as string || '1';
    const answerKey = formData.get('questionKey') as string || '';
    
    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize Gemini if API key is available
    let genAI = null;
    if (process.env.GOOGLE_AI_API_KEY) {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    } else {
      return NextResponse.json(
        { error: 'Google AI API key not configured. Please add GOOGLE_AI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Get Gemini model - using 2.5 Flash with thinking capabilities
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });

    // Extract questions using Gemini
    let allQuestions: any[] = [];
    const pageImages: { [key: number]: string } = {};
    
    // Convert PDF pages to images
    const tempDir = path.join(process.cwd(), 'temp_extraction');
    await fs.mkdir(tempDir, { recursive: true });
    
    const options = {
      density: 200,
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png',
      width: 2480,
      height: 3508
    };

    const converter = fromBuffer(buffer, options);
    
    // OPTIMIZATION 1: Parallel image conversion
    console.log('Converting PDF pages to images (parallel processing)...');
    const pageImagePaths: { pageNum: number; path: string; base64: string }[] = [];
    const maxPages = 30;
    const PARALLEL_CONVERSION_BATCH = 5; // Convert 5 pages at a time
    
    // Process pages in parallel batches
    for (let startPage = 1; startPage <= maxPages; startPage += PARALLEL_CONVERSION_BATCH) {
      const endPage = Math.min(startPage + PARALLEL_CONVERSION_BATCH - 1, maxPages);
      const pagePromises = [];
      
      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        pagePromises.push(
          converter(pageNum)
            .then(async (result) => {
              const imageBuffer = await fs.readFile(result.path);
              const base64Image = imageBuffer.toString('base64');
              
              // Save for display
              const resizedImage = await sharp(result.path)
                .resize(1240, 1754, { fit: 'inside' })
                .png()
                .toBuffer();
              pageImages[pageNum] = `data:image/png;base64,${resizedImage.toString('base64')}`;
              
              return {
                pageNum,
                path: result.path,
                base64: base64Image
              };
            })
            .catch(() => null) // Page doesn't exist
        );
      }
      
      const results = await Promise.all(pagePromises);
      const validResults = results.filter(r => r !== null);
      
      if (validResults.length === 0) break; // No more pages
      pageImagePaths.push(...validResults);
    }
    
    // Sort by page number
    pageImagePaths.sort((a, b) => a.pageNum - b.pageNum);
    const actualPages = pageImagePaths.length;
    console.log(`Found ${actualPages} pages in the PDF`);
    
    // OPTIMIZATION 2: Optimal batch size for accuracy and speed
    const BATCH_SIZE = 4; // 4 pages per batch for better accuracy
    const MAX_CONCURRENT_API_CALLS = 2; // Process 2 batches simultaneously to avoid rate limits
    const batches = [];
    
    for (let i = 0; i < pageImagePaths.length; i += BATCH_SIZE) {
      batches.push(pageImagePaths.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Processing ${batches.length} batches (${BATCH_SIZE} pages each) with up to ${MAX_CONCURRENT_API_CALLS} parallel API calls...`);
    console.log('Batch distribution:', batches.map((b, i) => `Batch ${i+1}: Pages ${b[0].pageNum}-${b[b.length-1].pageNum}`).join(', '));
    
    // Parse answer key if provided
    let parsedAnswerKey: string[] = [];
    if (answerKey) {
      // Handle both comma-separated and continuous string formats
      if (answerKey.includes(',')) {
        parsedAnswerKey = answerKey.split(',').map(a => a.trim().toUpperCase());
      } else {
        parsedAnswerKey = answerKey.toUpperCase().split('');
      }
    }
    
    // OPTIMIZATION 3: Parallel Claude API calls with controlled concurrency
    const processBatch = async (batch: typeof batches[0], batchIndex: number) => {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} (pages ${batch[0].pageNum}-${batch[batch.length - 1].pageNum})`);
      
      try {
        // Create image parts for Gemini
        const imageParts = batch.map(page => ({
          inlineData: {
            mimeType: 'image/png',
            data: page.base64
          }
        }));
        
        // Create the prompt for extraction
        const prompt = `CRITICAL TASK: Extract ALL PHYSICS questions from JEE ${year} exam pages.

⚠️ IMPORTANT CLARIFICATION:
- Extract ALL Physics questions regardless of question number
- Include questions WITH diagrams AND questions WITHOUT diagrams
- The has_diagram field is for marking which questions have diagrams, NOT for filtering
- DO NOT only return questions with diagrams - return ALL Physics questions!
- DO NOT make assumptions based on question numbers - use CONTENT to identify Physics

You are viewing pages ${batch[0].pageNum}-${batch[batch.length - 1].pageNum} of a JEE paper.
Physics questions are typically grouped together but can appear at ANY question numbers.
IDENTIFY PHYSICS BY CONTENT, NOT BY QUESTION NUMBER!

⚠️ STRICT SUBJECT FILTERING - READ CAREFULLY:

FUNDAMENTAL RULE: Identify subjects by CONTENT, not by question numbers!
Physics questions can appear at ANY position (Q1, Q12, Q21, Q35, Q45, etc.)
Extract EVERY Physics question regardless of its number!

═══ PHYSICS INDICATORS (EXTRACT THESE) ═══
Look for these keywords/concepts to identify Physics questions:

**Mechanics Keywords:**
force, mass, acceleration, velocity, speed, momentum, impulse, collision, friction, tension, normal force, 
weight, gravity, gravitational, orbit, satellite, planetary, kepler, escape velocity, potential energy, 
kinetic energy, work, power, torque, moment of inertia, angular momentum, rotational, rolling, 
center of mass, equilibrium, simple harmonic motion, oscillation, spring, pendulum

**Waves & Sound Keywords:**
wave, wavelength, frequency, amplitude, period, resonance, standing wave, node, antinode, 
sound, echo, doppler effect, sonic, ultrasonic, intensity, loudness, pitch, beats, interference, 
superposition, harmonics, overtones, fundamental frequency, resonance tube, tuning fork

**Optics Keywords:**
light, ray, reflection, refraction, mirror, lens, focal length, magnification, image, object distance,
prism, dispersion, total internal reflection, critical angle, optical fiber, interference, diffraction,
Young's double slit, fringe, polarization, Brewster angle, photometry, luminous intensity

**Electricity & Magnetism Keywords:**
charge, electric field, electric potential, voltage, current, resistance, ohm's law, kirchhoff,
capacitor, capacitance, dielectric, inductor, inductance, transformer, AC, DC, RMS, impedance,
magnetic field, magnetic flux, electromagnetic induction, Faraday's law, Lenz's law, solenoid,
galvanometer, ammeter, voltmeter, Wheatstone bridge, potentiometer, electromagnetic waves

**Modern Physics Keywords:**
photon, photoelectric effect, work function, threshold frequency, de Broglie, matter waves,
Bohr model, energy levels, quantum, uncertainty principle, radioactivity, half-life, decay constant,
alpha, beta, gamma, nuclear fission, fusion, binding energy, mass defect

**Units (Strong Physics Indicators):**
m/s, m/s², kg, N (Newton), J (Joule), W (Watt), Pa (Pascal), Hz (Hertz), T (Tesla), 
V (Volt), A (Ampere), Ω (ohm), C (Coulomb), F (Farad), H (Henry), Wb (Weber), eV, nm, μm

═══ CHEMISTRY INDICATORS (SKIP THESE) ═══
IMMEDIATELY SKIP if you see:

**GAS LAWS & CHEMICAL PROPERTIES (Common Chemistry indicators - SKIP THESE):**
- Ideal gas, real gas, van der Waals equation
- Boyle's law, Charles's law (in chemistry context)
- Gas properties, compressibility, diffusion rates
- Critical temperature, critical pressure
- Gas mixtures, partial pressures (chemistry context)

**Chemical Formulas & Reactions:**
- ANY chemical formula: H₂O, CO₂, NaCl, H₂SO₄, CH₄, C₆H₆, NH₃, O₂, N₂, Cl₂
- Reaction arrows: →, ⇌, ↔
- Chemical equations with reactants and products
- Oxidation states, oxidation numbers (like Fe²⁺, Cr₂O₇²⁻)

**Chemistry-Specific Terms:**
mol, molar, molarity, molality, mole fraction, normality, equivalent weight,
pH, pOH, acid, base, salt, buffer, titration, indicator, endpoint, equivalence point,
oxidation, reduction, redox, electrode potential, electrochemical cell, Nernst equation,
organic, inorganic, alkane, alkene, alkyne, benzene, phenol, alcohol, aldehyde, ketone,
carboxylic acid, ester, amine, amino acid, protein, polymer, isomer, hybridization,
VSEPR, crystal field, ligand, complex, coordination number, chelate,
enthalpy of formation, Gibbs free energy, entropy of reaction, Hess's law,
Le Chatelier's principle, equilibrium constant, Ksp, Ka, Kb, rate constant

**Chemistry Units:**
mol/L, kJ/mol (for reaction enthalpy), g/mol, M (molarity)

═══ MATHEMATICS INDICATORS (SKIP THESE) ═══
IMMEDIATELY SKIP if the question is purely mathematical without physical context:

**Pure Math Terms:**
integral (∫) without physical quantity, derivative (d/dx) without physical meaning,
limit, continuity, differentiability (in abstract sense),
matrix, determinant, eigenvalue (without physics application),
permutation, combination, probability (without physical context),
binomial theorem, sequence, series, arithmetic progression, geometric progression,
complex numbers (without physics application), argument, modulus,
conic sections (ellipse, parabola, hyperbola) without physical motion,
pure geometry, trigonometric identities, mathematical induction

═══ EDGE CASES & DISAMBIGUATION ═══

**Semiconductors & Materials:**
- PHYSICS if: band gap, energy bands, p-n junction, diodes, transistors, conductivity, Hall effect
- CHEMISTRY if: crystal structure, lattice parameters, metallurgy, alloys, coordination compounds
- If it mentions germanium/silicon WITH band gap or electronic properties → PHYSICS
- If it mentions germanium/silicon WITH chemical properties or reactions → CHEMISTRY

**Thermodynamics:**
- PHYSICS if: heat engines, Carnot cycle, efficiency, ideal gas, PV diagrams, isothermal, adiabatic
- CHEMISTRY if: enthalpy of formation, Gibbs energy, chemical equilibrium, Hess's law

**Nuclear Topics:**
- PHYSICS if: radioactive decay (alpha, beta, gamma), half-life calculations, binding energy per nucleon, mass-energy equivalence, nuclear fission/fusion for energy
- CHEMISTRY if: nuclear reactions with chemical equations, isotope chemistry, radioisotopes in medicine, tracer techniques, radioactive dating
- Be VERY CAREFUL: If the question focuses on nuclear equations and isotope transformations WITHOUT physics concepts like energy/mass defect, it's likely Chemistry

**Math in Physics:**
- EXTRACT if: calculus/matrices used to solve physics problems
- SKIP if: pure mathematical problem without physical context

═══ QUESTION TYPE IDENTIFICATION ═══
1. **Regular MCQ**: Standard question with options A, B, C, D
2. **Statement Type**: Contains "STATEMENT-1" and "STATEMENT-2" with relationship analysis
3. **Matrix Matching**: "Column I" matched with "Column II" (NOT a diagram - it's an answer format!)
4. **Linked Comprehension**: Multiple questions based on a common passage/scenario

═══ DIAGRAM DETECTION (VERY IMPORTANT) ═══
Mark has_diagram=true for ANY of these:
- Circuit diagrams (resistors, capacitors, batteries, switches)
- Free body diagrams (forces, masses, pulleys, inclines)
- Ray diagrams (lenses, mirrors, light paths)
- Graphs (x-y plots, waveforms, field lines)
- Mechanical setups (springs, pendulums, rotating objects)
- Wave diagrams (interference patterns, standing waves)
- Particle trajectories (projectile motion, charged particle paths)
- Any geometric figure showing physical setup

SPECIFICALLY CHECK:
- Any question mentioning "figure", "shown", "diagram", "circuit"
- Questions with mechanical systems often have diagrams
- Circuit problems frequently include circuit diagrams
- Optics questions may have ray diagrams

DO NOT mark has_diagram=true for:
- Matrix matching answer grids
- Tables of numerical data only
- Chemical structure diagrams

${parsedAnswerKey.length > 0 ? `Answer Key: Q${batchIndex * 10 + 1}-Q${Math.min((batchIndex + 1) * 10, parsedAnswerKey.length)}: ${parsedAnswerKey.slice(batchIndex * 10, (batchIndex + 1) * 10).join(', ')}\n` : ''}

Return this JSON structure:
{
  "questions": [
    {
      "number": <exact question number>,
      "text": "<complete question text>",
      "question_type": "<regular_mcq|statement|matrix_matching|linked_comprehension>",
      "options": [
        {"label": "A", "text": "<option/statement A>"},
        {"label": "B", "text": "<option/statement B>"},
        {"label": "C", "text": "<option/statement C>"},
        {"label": "D", "text": "<option/statement D>"}
      ],
      "column_ii_options": [  // Only for matrix_matching type
        {"label": "p", "text": "<option p>"},
        {"label": "q", "text": "<option q>"},
        {"label": "r", "text": "<option r>"},
        {"label": "s", "text": "<option s>"}
      ],
      "correct_answer": "<answer or matrix pattern>",
      "explanation": null,
      "has_diagram": <true ONLY for actual figures/circuits/graphs>,
      "diagram_description": "<description ONLY if actual diagram>",
      "subject": "Physics",
      "topic": "<specific topic>",
      "page_number": ${batch[0].pageNum <= 4 ? batch[0].pageNum : batch.map(p => p.pageNum).join(' or ')},
      "difficulty": "medium",
      "marks": 4,
      "negative_marks": 1,
      "year": "${year}",
      "exam": "${exam}",
      "session": "${session}"
    }
  ]
}

═══ EXTRACTION PROCESS ═══
1. SCAN ALL questions on these pages - regardless of question number
2. For EACH question, perform CONTENT-BASED subject identification:
   a) Look for Chemistry keywords/formulas → If found, SKIP
   b) Look for pure Mathematics concepts → If found, SKIP  
   c) Look for Physics concepts/units/keywords → If found, EXTRACT THE QUESTION
   d) If ambiguous, look for physical units (N, J, W, m/s, etc.) to confirm Physics
3. Extract ALL PHYSICS QUESTIONS - both those WITH diagrams and those WITHOUT diagrams
4. For EACH extracted Physics question, set has_diagram to true or false accordingly
5. Extract question numbers EXACTLY AS THEY APPEAR (Q1, Q12, Q21, Q45, etc.)
6. DO NOT make assumptions about which numbers "should" be Physics
7. DO NOT skip questions based on their number - only based on CONTENT
8. Continue scanning EVERY question until all questions on the pages are checked

⚠️ CRITICAL: Ignore question numbers! Physics questions can be Q12-20, Q21-30, or ANY other range!
Extract based on CONTENT ONLY! The has_diagram field is just an attribute, NOT a filter!

═══ CRITICAL REMINDERS ═══
- IGNORE question numbers - Physics can be at ANY position
- Physics questions are usually grouped together in a continuous block
- Use CONTENT analysis to identify subject, NOT question numbers
- If a question mentions chemical formulas, molecules, reactions - it's Chemistry, SKIP IT
- If a question mentions pure mathematical concepts without physics - it's Math, SKIP IT
- Gas laws in chemistry context (van der Waals, ideal gas properties) are Chemistry - SKIP

FINAL EXTRACTION REMINDER: 
⚠️ Extract ALL Physics questions from these pages!
- Include questions WITHOUT diagrams (has_diagram: false)
- Include questions WITH diagrams (has_diagram: true)
- You should typically find 5-10 Physics questions per batch
- If you're only finding 1-2 questions, you're filtering too aggressively!
- Extract based on PHYSICS CONTENT, not question numbers
- Physics questions can be numbered ANYWHERE (Q1, Q15, Q21, Q45, etc.)
- Check EVERY question on the page for Physics content

IMPORTANT SCANNING NOTE:
Physics questions USUALLY appear in continuous blocks (e.g., Q1-22 OR Q1-30)
HOWEVER, be VERY SUSPICIOUS of isolated questions outside the main Physics block!
- If you find Physics Q1-22, and then Q29, Q35 appear isolated → Double-check if they're really Physics
- Isolated questions in the 30s, 40s, 50s are MORE LIKELY to be Chemistry/Math
- Use STRICTER content verification for questions outside the main Physics block
- Nuclear/semiconductor questions at high numbers (30+) need EXTRA scrutiny

RESPONSE FORMAT: Start directly with the JSON object. No explanatory text before the JSON.`;

        // Call Gemini API with images and prompt
        const result = await model.generateContent([
          prompt,
          ...imageParts
        ]);

        // Parse the response
        const response = await result.response;
        const responseText = response.text();
        
        // Try multiple JSON extraction strategies
        let data = null;
        
        // Strategy 1: Try to parse the entire response as JSON
        try {
          data = JSON.parse(responseText);
        } catch (e1) {
          // Strategy 2: Extract JSON from markdown code block
          const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            try {
              data = JSON.parse(codeBlockMatch[1]);
            } catch (e2) {
              console.log('Code block parse failed:', e2.message);
            }
          }
          
          // Strategy 3: Find JSON object with better regex
          if (!data) {
            // Try multiple patterns to find the JSON object
            const patterns = [
              /\{\s*"questions"\s*:\s*\[[\s\S]*?\]\s*\}/,
              /\{\s*['"]questions['"]\s*:\s*\[[\s\S]*?\]\s*\}/,
              /\{[\s\S]*?"questions"[\s\S]*?\[[\s\S]*?\][\s\S]*?\}/
            ];
            
            for (const pattern of patterns) {
              const match = responseText.match(pattern);
              if (match) {
                try {
                  // Extract just the JSON part
                  let jsonStr = match[0];
                  // Clean up any common issues
                  jsonStr = jsonStr.replace(/,\s*}/, '}');  // Remove trailing commas
                  jsonStr = jsonStr.replace(/,\s*\]/, ']');  // Remove trailing commas in arrays
                  data = JSON.parse(jsonStr);
                  if (data && data.questions) break;
                } catch {}
              }
            }
            
            // If still no match, try to find JSON by looking for the structure
            if (!data) {
              const startMatch = responseText.indexOf('{"questions"');
              const altStartMatch = responseText.indexOf('{\n  "questions"');
              const actualStart = startMatch >= 0 ? startMatch : altStartMatch;
              
              if (actualStart >= 0) {
                let jsonString = responseText.substring(actualStart);
                let braceCount = 0;
                let bracketCount = 0;
                let inString = false;
                let escapeNext = false;
                let endIndex = -1;
                
                for (let i = 0; i < jsonString.length; i++) {
                  const char = jsonString[i];
                  
                  if (escapeNext) {
                    escapeNext = false;
                    continue;
                  }
                  
                  if (char === '\\' && inString) {
                    escapeNext = true;
                    continue;
                  }
                  
                  if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                  }
                  
                  if (!inString) {
                    if (char === '{') braceCount++;
                    else if (char === '[') bracketCount++;
                    else if (char === '}') {
                      braceCount--;
                      if (braceCount === 0 && bracketCount === 0) {
                        endIndex = i;
                        break;
                      }
                    }
                    else if (char === ']') bracketCount--;
                  }
                }
                
                if (endIndex > 0) {
                  jsonString = jsonString.substring(0, endIndex + 1);
                  try {
                    data = JSON.parse(jsonString);
                  } catch (e3) {
                    console.error(`JSON parse error in batch ${batchIndex + 1}:`, e3.message);
                    // Try to fix common JSON issues
                    try {
                      jsonString = jsonString.replace(/,\s*}/, '}');
                      jsonString = jsonString.replace(/,\s*\]/, ']');
                      jsonString = jsonString.replace(/([^"\\])'([^"\\])/g, '$1"$2'); // Replace single quotes
                      data = JSON.parse(jsonString);
                    } catch (e4) {
                      console.log('JSON repair also failed');
                    }
                  }
                } else {
                  console.log(`No valid JSON end found in batch ${batchIndex + 1}`);
                }
              }
            }
          }
        }
        
        if (data && data.questions) {
          const batchQuestions = data.questions || [];
            
            // Add answer key if available and not already extracted
            batchQuestions.forEach((q: any, index: number) => {
              // Ensure page number is set correctly
              // If Claude didn't provide it or it's outside batch range, estimate based on question distribution
              if (!q.page_number || q.page_number < batch[0].pageNum || q.page_number > batch[batch.length - 1].pageNum) {
                // Estimate page number based on position in batch
                const questionsPerPage = Math.ceil(batchQuestions.length / batch.length);
                const pageOffset = Math.floor(index / questionsPerPage);
                q.page_number = batch[Math.min(pageOffset, batch.length - 1)].pageNum;
                console.log(`Estimated page ${q.page_number} for question ${q.number}`);
              }
              
              // Add answer from key if available and not already set
              if (!q.correct_answer && parsedAnswerKey.length > 0) {
                const questionIndex = q.number - 1; // Assuming question numbers start at 1
                if (questionIndex >= 0 && questionIndex < parsedAnswerKey.length) {
                  q.correct_answer = parsedAnswerKey[questionIndex];
                }
              }
              
              // Ensure all metadata is set
              q.year = year;
              q.exam = exam;
              q.subject = subject;
              q.session = session;
              
              // Set defaults if not extracted
              if (!q.marks) q.marks = 4;
              if (!q.negative_marks) q.negative_marks = 1;
              if (!q.difficulty) q.difficulty = 'medium';
            });
            
            console.log(`Found ${batchQuestions.length} questions in batch ${batchIndex + 1}:`);
            batchQuestions.forEach((q: any) => {
              const type = q.question_type || 'regular_mcq';
              const diagramNote = q.has_diagram && type !== 'matrix_matching' ? ' (has diagram)' : '';
              const typeNote = type === 'matrix_matching' ? ' [MATRIX]' : '';
              console.log(`  Q${q.number} on page ${q.page_number}${typeNote}${diagramNote}`);
            });
            return batchQuestions;
          } else {
            console.warn(`No valid JSON found in batch ${batchIndex + 1}`);
            console.log('Response preview:', responseText.substring(0, 500));
            return [];
          }
      } catch (error: any) {
        // Handle rate limiting with exponential backoff
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          console.warn(`Rate limit hit for batch ${batchIndex + 1}`);
          
          // Try up to 3 retries with exponential backoff
          for (let retry = 1; retry <= 3; retry++) {
            const waitTime = retry * 5000; // 5s, 10s, 15s
            console.log(`Retry ${retry}/3 for batch ${batchIndex + 1} after ${waitTime/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            try {
              const retryResult = await model.generateContent([
                prompt,
                ...imageParts
              ]);
              
              const retryResponse = await retryResult.response;
              const retryText = retryResponse.text();
              const retryData = JSON.parse(retryText);
              if (retryData && retryData.questions) {
                console.log(`Retry ${retry} successful for batch ${batchIndex + 1}, found ${retryData.questions.length} questions`);
                return retryData.questions || [];
              }
            } catch (retryError: any) {
              if (retry === 3) {
                console.error(`All retries failed for batch ${batchIndex + 1}`);
              }
            }
          }
        } else {
          console.error(`Error processing batch ${batchIndex + 1}:`, error.message || error);
        }
        return [];
      }
    };
    
    // Process batches with controlled concurrency
    const processInParallel = async () => {
      // Pre-allocate results array to maintain order
      const results: any[][] = new Array(batches.length);
      
      // Process batches in groups with controlled concurrency
      for (let i = 0; i < batches.length; i += MAX_CONCURRENT_API_CALLS) {
        const concurrentBatches = batches.slice(i, i + MAX_CONCURRENT_API_CALLS);
        const promises = concurrentBatches.map((batch, idx) => 
          processBatch(batch, i + idx)
        );
        
        const batchResults = await Promise.allSettled(promises);
        
        // Store results at their correct index to maintain order
        batchResults.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            results[i + idx] = result.value; // Store at correct position
          } else {
            results[i + idx] = []; // Empty array for failed batches
          }
        });
        
        // Add delay between groups to avoid rate limiting
        if (i + MAX_CONCURRENT_API_CALLS < batches.length) {
          console.log('Waiting 2 seconds before next batch group...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
      
      // Filter out undefined/null and flatten
      return results.filter(r => r).flat();
    };
    
    // Execute parallel processing
    const startTime = Date.now();
    allQuestions = await processInParallel();
    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`Completed extraction in ${processingTime.toFixed(1)} seconds`);
    
    // Clean up temp files
    for (const page of pageImagePaths) {
      await fs.unlink(page.path).catch(() => {});
    }
    
    // Clean up temp dir
    await fs.rmdir(tempDir, { recursive: true }).catch(() => {});

    // Sort questions by their number to ensure proper ordering
    allQuestions.sort((a, b) => {
      const numA = typeof a.number === 'number' ? a.number : parseInt(a.number) || 0;
      const numB = typeof b.number === 'number' ? b.number : parseInt(b.number) || 0;
      return numA - numB;
    });

    // Remove duplicates (in case questions were split across batches)
    const uniqueQuestions = allQuestions.reduce((acc, current) => {
      const exists = acc.find((item: any) => item.number === current.number);
      if (!exists) {
        acc.push(current);
      } else {
        // If duplicate, prefer the one with more complete data
        const index = acc.findIndex((item: any) => item.number === current.number);
        const existingQ = acc[index];
        
        // Merge the best of both questions
        acc[index] = {
          ...existingQ,
          ...current,
          text: current.text?.length > existingQ.text?.length ? current.text : existingQ.text,
          correct_answer: existingQ.correct_answer || current.correct_answer,
          explanation: existingQ.explanation || current.explanation,
          options: current.options?.length === 4 ? current.options : existingQ.options,
          column_ii_options: current.column_ii_options || existingQ.column_ii_options,
          question_type: current.question_type || existingQ.question_type || 'regular_mcq',
          diagram_description: existingQ.diagram_description || current.diagram_description,
          has_diagram: existingQ.has_diagram || current.has_diagram
        };
      }
      return acc;
    }, []);

    console.log(`Total extracted: ${uniqueQuestions.length} unique questions from ${Object.keys(pageImages).length} pages`);

    // Check if extraction failed completely
    if (uniqueQuestions.length === 0) {
      return NextResponse.json({
        questions: [],
        pageImages,
        fileName: pdfFile.name,
        metadata: {
          year,
          exam,
          subject,
          session,
          totalPages: Object.keys(pageImages).length,
          totalQuestions: 0,
          hasAnswerKey: parsedAnswerKey.length > 0
        },
        error: 'No questions were extracted. This might be due to API quota limits or processing errors. Please check your Google AI API key at https://aistudio.google.com/apikey'
      });
    }

    return NextResponse.json({
      questions: uniqueQuestions,
      pageImages,
      fileName: pdfFile.name,
      metadata: {
        year,
        exam,
        subject,
        session,
        totalPages: Object.keys(pageImages).length,
        totalQuestions: uniqueQuestions.length,
        hasAnswerKey: parsedAnswerKey.length > 0
      }
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF and extract questions' },
      { status: 500 }
    );
  }
}