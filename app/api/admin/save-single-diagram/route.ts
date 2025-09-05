import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { fileName, questionNumber, pageNumber, imageData, description, year, exam, subject, session } = await request.json();
    
    // Create output directory
    const outputDir = path.join(process.cwd(), 'data', 'previous-year', 'jee', 'extracted_diagrams');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Remove data URL prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename with metadata including session
    const cleanExam = exam?.replace(' ', '_') || 'JEE_Main';
    const cleanSession = session?.replace(/[^A-Z0-9]/g, '') || '1';
    const imageFileName = `${year}_${cleanExam}_${cleanSession}_${subject}_q${questionNumber}_p${pageNumber}.png`;
    const imagePath = path.join(outputDir, imageFileName);
    
    // Save image file
    await fs.writeFile(imagePath, buffer);
    
    return NextResponse.json({
      success: true,
      questionNumber,
      pageNumber,
      fileName: imageFileName,
      path: `extracted_diagrams/${imageFileName}`,
      size: (buffer.length / 1024).toFixed(1) + ' KB',
      description
    });

  } catch (error) {
    console.error('Error saving diagram:', error);
    return NextResponse.json(
      { error: 'Failed to save diagram' },
      { status: 500 }
    );
  }
}