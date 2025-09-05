import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { fileName, questions, diagrams, year, exam, subject, session } = await request.json();
    
    // Get list of actual saved diagram files
    const diagramsDir = path.join(process.cwd(), 'data', 'previous-year', 'jee', 'extracted_diagrams');
    const diagramFiles = await fs.readdir(diagramsDir).catch(() => []);
    
    // Update questions with actual diagram file paths
    const updatedQuestions = await Promise.all(questions.map(async (question: any) => {
      const diagram = diagrams.find((d: any) => d.questionNumber === question.number);
      
      if (diagram && diagram.status === 'completed') {
        // Find the actual saved file for this question
        const cleanExam = exam?.replace(' ', '_') || 'JEE_Main';
        const cleanSession = session?.replace(/[^A-Z0-9]/g, '') || '1';
        const expectedFileName = `${year}_${cleanExam}_${cleanSession}_${subject}_q${question.number}_p${diagram.pageNumber}.png`;
        
        // Check if file exists
        const fileExists = diagramFiles.includes(expectedFileName);
        
        if (fileExists) {
          const filePath = path.join(diagramsDir, expectedFileName);
          const stats = await fs.stat(filePath);
          
          return {
            ...question,
            diagram_extracted: true,
            diagram_path: `/data/previous-year/jee/extracted_diagrams/${expectedFileName}`,
            diagram_description: diagram.description,
            diagram_size_kb: (stats.size / 1024).toFixed(1)
          };
        }
      }
      
      return question;
    }));

    // Save the updated questions to the complete JSON file
    const cleanExam = exam?.replace(' ', '_') || 'JEE_Main';
    const cleanSession = session?.replace(/[^A-Z0-9]/g, '') || '1';
    // Ensure extracted_questions directory exists
    const outputDir = path.join(
      process.cwd(),
      'data',
      'previous-year',
      'jee',
      'extracted_questions'
    );
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(
      outputDir,
      `${year}_${cleanExam}_${cleanSession}_${subject}_complete.json`
    );
    
    // Create the output object with metadata and questions
    const outputData = {
      metadata: {
        year,
        exam,
        subject,
        session,
        fileName: fileName || `${year}_${cleanExam}_${cleanSession}_${subject}.pdf`,
        totalQuestions: updatedQuestions.length,
        questionsWithDiagrams: updatedQuestions.filter((q: any) => q.diagram_extracted).length,
        extractedDate: new Date().toISOString()
      },
      questions: updatedQuestions
    };
    
    await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));

    // Note: We're NOT creating a separate diagrams_metadata.json file anymore
    // All information is contained in the main complete.json file

    return NextResponse.json({
      success: true,
      questionsCount: updatedQuestions.length,
      diagramsCount: diagrams.filter((d: any) => d.status === 'completed').length,
      questions: updatedQuestions,
      outputFile: outputPath,
      outputFileName: `${year}_${cleanExam}_${cleanSession}_${subject}_complete.json`
    });

  } catch (error) {
    console.error('Error updating questions:', error);
    return NextResponse.json(
      { error: 'Failed to update questions with diagrams' },
      { status: 500 }
    );
  }
}