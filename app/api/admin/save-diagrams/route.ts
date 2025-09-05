import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { fileName, diagrams } = await request.json();
    
    if (!diagrams || diagrams.length === 0) {
      return NextResponse.json({ error: 'No diagrams provided' }, { status: 400 });
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'data', 'previous-year', 'jee', 'extracted_diagrams');
    await fs.mkdir(outputDir, { recursive: true });

    // Save each diagram as a separate image file
    const savedDiagrams = [];
    
    for (const diagram of diagrams) {
      const { questionNumber, pageNumber, imageData, description } = diagram;
      
      // Remove data URL prefix
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const imageFileName = `${fileName?.replace('.pdf', '')}_q${questionNumber}_p${pageNumber}_${timestamp}.png`;
      const imagePath = path.join(outputDir, imageFileName);
      
      // Save image file
      await fs.writeFile(imagePath, buffer);
      
      savedDiagrams.push({
        questionNumber,
        pageNumber,
        description,
        fileName: imageFileName,
        path: `extracted_diagrams/${imageFileName}`,
        size: (buffer.length / 1024).toFixed(1) + ' KB'
      });
    }

    // Save metadata JSON
    const metadataFileName = `${fileName?.replace('.pdf', '')}_diagrams_metadata.json`;
    const metadataPath = path.join(outputDir, '..', metadataFileName);
    await fs.writeFile(metadataPath, JSON.stringify(savedDiagrams, null, 2));

    return NextResponse.json({
      success: true,
      count: savedDiagrams.length,
      diagrams: savedDiagrams,
      metadataFile: metadataFileName
    });

  } catch (error) {
    console.error('Error saving diagrams:', error);
    return NextResponse.json(
      { error: 'Failed to save diagrams' },
      { status: 500 }
    );
  }
}