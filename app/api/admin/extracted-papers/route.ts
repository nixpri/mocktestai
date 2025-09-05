import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    const dataDir = path.join(process.cwd(), 'data', 'previous-year', 'jee');
    
    // If no file specified, list available files
    if (!fileName) {
      try {
        await fs.mkdir(dataDir, { recursive: true });
        const files = await fs.readdir(dataDir);
        const jsonFiles = files.filter(f => f.endsWith('_complete.json'));
        
        return NextResponse.json({
          success: true,
          files: jsonFiles
        });
      } catch (error) {
        return NextResponse.json({
          success: true,
          files: []
        });
      }
    }
    
    // Load specific file
    const filePath = path.join(dataDir, fileName);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({
        success: true,
        data
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching extracted papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extracted papers' },
      { status: 500 }
    );
  }
}