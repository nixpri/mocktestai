import { NextRequest, NextResponse } from 'next/server';
import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    
    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configure pdf2pic options
    const options = {
      density: 200,    // Lower density for faster web display
      saveFilename: 'page',
      savePath: './temp',
      format: 'png',
      width: 1240,     // Half of original for web display
      height: 1754
    };

    // Convert PDF pages to images
    const converter = fromBuffer(buffer, options);
    const images: string[] = [];
    const maxPages = 20; // Limit to prevent memory issues

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const result = await converter(pageNum);
        
        // Read the image and convert to base64
        const imageBuffer = await sharp(result.path)
          .resize(1240, 1754, { fit: 'inside' })
          .png()
          .toBuffer();
          
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        images.push(base64Image);
        
        // Clean up temp file
        const fs = require('fs');
        if (fs.existsSync(result.path)) {
          fs.unlinkSync(result.path);
        }
      } catch (error) {
        // No more pages
        break;
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'Failed to extract pages from PDF' }, { status: 500 });
    }

    return NextResponse.json({ 
      images,
      pageCount: images.length 
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}