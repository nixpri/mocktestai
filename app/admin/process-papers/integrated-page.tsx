'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Question {
  number: number;
  text: string;
  page_number: number;
  has_diagram: boolean;
  diagram_extracted?: boolean;
  diagram_path?: string;
  diagram_description?: string;
  options: { label: string; text: string }[];
  column_ii_options?: { label: string; text: string }[];
  question_type?: string; // regular_mcq, statement, matrix_matching, linked_comprehension
  correct_answer?: string;
  year?: string;
  exam?: string;
  subject?: string;
  topic?: string;
}

interface DiagramTask {
  questionNumber: number;
  pageNumber: number;
  questionText: string;
  status: 'pending' | 'completed' | 'skipped';
  diagramPath?: string;
  description?: string;
}

export default function ProcessPreviousYearPapersPage() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pageImages, setPageImages] = useState<{ [key: number]: string }>({});
  const [diagramTasks, setDiagramTasks] = useState<DiagramTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Metadata fields
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [exam, setExam] = useState('JEE Main');
  const [subject, setSubject] = useState('Physics');
  const [session, setSession] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    questions: 0,
    diagrams: 0,
    status: 'Preparing upload...'
  });

  // Process PDF and extract questions
  const processPDF = async (file: File) => {
    setIsProcessing(true);
    setPdfFile(file);
    
    try {
      // Step 1: Run extraction pipeline to get questions
      const extractFormData = new FormData();
      extractFormData.append('pdf', file);
      extractFormData.append('year', year);
      extractFormData.append('exam', exam);
      extractFormData.append('subject', subject);
      extractFormData.append('session', session);
      
      const extractResponse = await fetch('/api/admin/extract-questions', {
        method: 'POST',
        body: extractFormData,
      });
      
      if (!extractResponse.ok) throw new Error('Failed to extract questions');
      
      const { questions: extractedQuestions, pageImages: images, metadata, error } = await extractResponse.json();
      
      // Check for API errors or empty extraction
      if (error || !extractedQuestions || extractedQuestions.length === 0) {
        alert(error || 'No questions were extracted. This might be due to API credit issues or processing errors. Please check the console for details.');
        setIsProcessing(false);
        return;
      }
      
      setQuestions(extractedQuestions);
      setPageImages(images);
      
      console.log(`Extracted ${extractedQuestions.length} questions from ${metadata?.totalPages || 0} pages`);
      
      // Log question types for debugging
      const questionTypes = extractedQuestions.reduce((acc: Record<string, number>, q: Question) => {
        const type = q.question_type || 'regular_mcq';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      console.log('Question types:', questionTypes);
      
      // Step 2: Create diagram tasks for questions that have diagrams
      // First, ensure we have unique questions based on question number
      const questionMap = new Map<number, Question>();
      extractedQuestions.forEach((q: Question) => {
        if (!questionMap.has(q.number) || 
            (questionMap.get(q.number)?.text?.length || 0) < q.text.length) {
          questionMap.set(q.number, q);
        }
      });
      
      // Convert map back to array and filter for questions with actual diagrams
      // Exclude matrix_matching questions as they don't have real diagrams
      const tasks: DiagramTask[] = Array.from(questionMap.values())
        .filter((q: Question) => {
          // Only include if it has a diagram AND it's not a matrix matching question
          return q.has_diagram && 
                 !q.diagram_extracted && 
                 q.question_type !== 'matrix_matching';
        })
        .map((q: Question) => ({
          questionNumber: q.number,
          pageNumber: q.page_number || 1,
          questionText: q.text ? q.text.substring(0, 150) + '...' : '',
          status: 'pending' as const,
          description: q.diagram_description || ''
        }))
        .sort((a, b) => {
          // Sort by question number primarily
          return a.questionNumber - b.questionNumber;
        });
      
      // Log for debugging
      console.log('Diagram tasks created:', tasks.map(t => ({ 
        q: t.questionNumber, 
        p: t.pageNumber,
        desc: t.description?.substring(0, 30)
      })));
      
      setDiagramTasks(tasks);
      setCurrentTaskIndex(0);
      
      // Set initial description if available
      if (tasks.length > 0 && tasks[0].description) {
        setDescription(tasks[0].description);
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  // Get current task
  const currentTask = diagramTasks[currentTaskIndex];
  const currentPageImage = currentTask ? pageImages[currentTask.pageNumber] : null;

  // Generate cropped image
  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !canvasRef.current || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return canvas.toDataURL('image/png');
  }, [completedCrop]);

  // Save current diagram and move to next
  const saveAndNext = async () => {
    if (!currentTask || !completedCrop || isSaving) return;
    
    setIsSaving(true);
    
    const croppedImage = getCroppedImg();
    if (!croppedImage) {
      setIsSaving(false);
      return;
    }

    // Update task status
    const updatedTasks = [...diagramTasks];
    updatedTasks[currentTaskIndex] = {
      ...currentTask,
      status: 'completed',
      diagramPath: croppedImage,
      description: description
    };
    setDiagramTasks(updatedTasks);

    // Auto-save if enabled
    if (autoSave) {
      await saveDiagram(currentTask.questionNumber, currentTask.pageNumber, croppedImage, description);
    }

    // Move to next task
    moveToNextTask();
  };

  // Skip current task
  const skipTask = () => {
    if (!currentTask) return;

    const updatedTasks = [...diagramTasks];
    updatedTasks[currentTaskIndex] = {
      ...currentTask,
      status: 'skipped'
    };
    setDiagramTasks(updatedTasks);

    moveToNextTask();
  };

  // Move to next pending task
  const moveToNextTask = () => {
    // Find next pending task
    let nextIndex = currentTaskIndex + 1;
    while (nextIndex < diagramTasks.length && diagramTasks[nextIndex].status !== 'pending') {
      nextIndex++;
    }

    if (nextIndex < diagramTasks.length) {
      setCurrentTaskIndex(nextIndex);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setDescription(diagramTasks[nextIndex].description || '');
    } else {
      // All tasks completed - auto-save and redirect
      exportAllResults();
    }
    
    setIsSaving(false);
  };

  // Save individual diagram
  const saveDiagram = async (questionNumber: number, pageNumber: number, imageData: string, desc: string) => {
    try {
      const response = await fetch('/api/admin/save-single-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: pdfFile?.name,
          questionNumber,
          pageNumber,
          imageData,
          description: desc,
          year,
          exam,
          subject,
          session
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save diagram');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  // Export all results and upload to Supabase
  const exportAllResults = async () => {
    if (isSaving) return; // Prevent multiple calls
    
    const completedTasks = diagramTasks.filter(t => t.status === 'completed');
    
    setIsSaving(true);
    setShowUploadStatus(true);
    setUploadProgress({
      questions: 0,
      diagrams: 0,
      status: 'Preparing upload...'
    });
    setStatus('Uploading to database...');
    
    try {
      const response = await fetch('/api/admin/update-questions-with-diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: pdfFile?.name,
          questions: questions,
          diagrams: completedTasks,
          year,
          exam,
          subject,
          session
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update progress
        if (result.supabaseUpload) {
          setUploadProgress({
            questions: result.supabaseUpload.uploaded || 0,
            diagrams: result.supabaseUpload.diagramsUploaded || 0,
            status: 'Upload complete!'
          });
        }
        
        // Check if Supabase upload was successful
        if (result.supabaseUpload?.success) {
          setStatus('✅ Successfully uploaded to Supabase! Files cleaned up.');
          
          // Wait a moment to show success
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Redirect to success page with stats including Supabase info
          const params = new URLSearchParams({
            file: pdfFile?.name || '',
            questions: result.questionsCount.toString(),
            diagrams: (result.diagramsExtracted || completedTasks.length).toString(),
            path: result.outputFileName || 'complete.json',
            uploaded: result.supabaseUpload.uploaded.toString(),
            diagramsUploaded: result.supabaseUpload.diagramsUploaded.toString(),
            testId: result.supabaseUpload.testId || ''
          });
          
          router.push(`/admin/extraction-success?${params.toString()}`);
        } else {
          // Saved locally but Supabase upload failed
          setStatus('⚠️ Saved locally but failed to upload to Supabase');
          alert(`Questions saved locally but Supabase upload failed: ${result.supabaseUpload?.error || 'Unknown error'}`);
          
          // Still redirect but without Supabase info
          const params = new URLSearchParams({
            file: pdfFile?.name || '',
            questions: result.questionsCount.toString(),
            diagrams: completedTasks.length.toString(),
            path: result.outputFileName || 'complete.json'
          });
          
          router.push(`/admin/extraction-success?${params.toString()}`);
        }
      }
    } catch (error) {
      console.error('Error exporting results:', error);
      setStatus('❌ Failed to save results');
      alert('Failed to save results to server');
    } finally {
      setIsSaving(false);
      setShowUploadStatus(false);
    }
  };

  // Calculate progress
  const totalTasks = diagramTasks.length;
  const completedTasks = diagramTasks.filter(t => t.status === 'completed').length;
  const skippedTasks = diagramTasks.filter(t => t.status === 'skipped').length;
  const pendingTasks = diagramTasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Process Previous Year Papers</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back to Admin
          </button>
        </div>
        
        {/* File Upload with Metadata */}
        {(!questions.length || !pdfFile) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Previous Year Paper</h2>
            
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam *
                </label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled
                >
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced" disabled>JEE Advanced (Coming Soon)</option>
                  <option value="NEET" disabled>NEET (Coming Soon)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry" disabled>Chemistry (Coming Soon)</option>
                  <option value="Mathematics" disabled>Mathematics (Coming Soon)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session/Paper Key *
                </label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value.toUpperCase())}
                  placeholder="e.g., 1, 2A, Session1, Morning, Shift1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Identifies different papers in the same year (e.g., JEE Main has multiple sessions)
                </p>
              </div>
            </div>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                id="pdf-upload"
                className="hidden"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload PDF or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF files only (max 50MB)</p>
              </label>
            </div>
            
            {pdfFile && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-700">{pdfFile.name}</span>
                <button
                  onClick={() => processPDF(pdfFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Start Processing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-medium">{status}</p>
          </div>
        )}

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Processing Progress</h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✓ Completed: {completedTasks}</span>
                <span className="text-yellow-600">⊘ Skipped: {skippedTasks}</span>
                <span className="text-blue-600">⧖ Pending: {pendingTasks}</span>
                <span>Total: {totalTasks}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                   style={{ width: `${(completedTasks / totalTasks) * 100}%` }}></div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentTask && currentPageImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Current Task Info and Image */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Question {currentTask.questionNumber} - Page {currentTask.pageNumber}
                  </h2>
                  <div className="flex items-center gap-2">
                    {diagramTasks.filter(t => t.pageNumber === currentTask.pageNumber).length > 1 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        Multiple diagrams on this page
                      </span>
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Task {currentTaskIndex + 1} of {totalTasks}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  <strong>Question {currentTask.questionNumber}:</strong> {currentTask.questionText}
                </p>
                {currentTask.description && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900">AI Detection:</p>
                    <p className="text-sm text-blue-700">{currentTask.description}</p>
                  </div>
                )}
              </div>

              {/* Cropping Area */}
              <div className="border-2 border-blue-400 rounded-lg overflow-auto max-h-[600px] bg-gray-100">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                >
                  <img
                    ref={imgRef}
                    alt={`Page ${currentTask.pageNumber}`}
                    src={currentPageImage}
                    style={{ maxWidth: '100%' }}
                  />
                </ReactCrop>
              </div>

              {/* Hidden canvas */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Controls */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Diagram Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Circuit diagram with capacitors and resistors"
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={saveAndNext}
                    disabled={!completedCrop || isSaving}
                    className="py-3 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700 transition font-semibold flex items-center justify-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      currentTaskIndex === diagramTasks.length - 1 ? '✓ Save and Submit' : '✓ Save & Next'
                    )}
                  </button>
                  <button
                    onClick={skipTask}
                    className="py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition font-semibold"
                  >
                    ⊘ Skip This One
                  </button>
                </div>

                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="autosave"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autosave" className="text-sm">
                    Auto-save diagrams after cropping
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Task Queue */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Diagram Queue</h2>
              
              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {diagramTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      index === currentTaskIndex
                        ? 'border-blue-500 bg-blue-50'
                        : task.status === 'completed'
                        ? 'border-green-500 bg-green-50'
                        : task.status === 'skipped'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300'
                    }`}
                    onClick={() => {
                      if (task.status === 'pending') {
                        setCurrentTaskIndex(index);
                        setCrop(undefined);
                        setCompletedCrop(undefined);
                        setDescription(task.description || '');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Q{task.questionNumber}</span>
                        <span className="text-sm text-gray-600">Page {task.pageNumber}</span>
                      </div>
                      <span className={`text-lg ${
                        task.status === 'completed' ? 'text-green-600' :
                        task.status === 'skipped' ? 'text-yellow-600' :
                        '⏳'
                      }`}>
                        {task.status === 'completed' ? '✓' :
                         task.status === 'skipped' ? '⊘' :
                         '⧖'}
                      </span>
                    </div>
                    {index === currentTaskIndex && (
                      <div className="mt-1 text-xs text-blue-600">Currently editing...</div>
                    )}
                  </div>
                ))}
              </div>

              {totalTasks > 0 && completedTasks + skippedTasks === totalTasks && (
                <button
                  onClick={exportAllResults}
                  disabled={isSaving}
                  className="mt-4 w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading to Supabase...
                    </>
                  ) : (
                    '📥 Save & Complete'
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* No Diagrams Message */}
        {questions.length > 0 && diagramTasks.length === 0 && !isProcessing && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Extraction Complete!</h3>
            <p className="text-gray-600 mb-2">
              Successfully extracted {questions.length} questions from the paper.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {questions.filter(q => q.question_type === 'matrix_matching').length > 0 
                ? `Note: ${questions.filter(q => q.question_type === 'matrix_matching').length} matrix-matching questions detected (these don't require diagram extraction).`
                : 'No diagrams were detected that need manual cropping.'
              }
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>Question Types:</p>
              <div className="flex justify-center gap-4">
                <span>Regular MCQ: {questions.filter(q => !q.question_type || q.question_type === 'regular_mcq').length}</span>
                <span>Matrix: {questions.filter(q => q.question_type === 'matrix_matching').length}</span>
                <span>Statement: {questions.filter(q => q.question_type === 'statement').length}</span>
              </div>
            </div>
            <button
              onClick={() => exportAllResults()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Save Results
            </button>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 font-semibold">Processing Previous Year Paper</p>
              <p className="text-sm text-gray-500 mt-2">Extracting questions from all pages...</p>
              <p className="text-xs text-gray-400 mt-1">This may take 1-2 minutes for multi-page PDFs</p>
            </div>
          </div>
        )}

        {/* Upload Status Modal */}
        {showUploadStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center max-w-md w-full">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              </div>
              
              <h3 className="text-xl font-bold mb-4">Uploading to Database</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questions</span>
                    <span className="font-semibold">{uploadProgress.questions} uploaded</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(uploadProgress.questions / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Diagrams</span>
                    <span className="font-semibold">{uploadProgress.diagrams} uploaded</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(uploadProgress.diagrams / diagramTasks.filter(t => t.status === 'completed').length) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <p className="mt-6 text-sm text-gray-600">{uploadProgress.status}</p>
              <p className="mt-2 text-xs text-gray-500">Please wait while we save your data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}