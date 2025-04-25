'use client';

import { useState } from 'react'; 
import PDFUploader from '../components/PDFUploader';
import Recommendations from '../components/Recommendations';
import { Button } from "@/components/ui/button";

export default function Home() {
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [recommendationType, setRecommendationType] = useState<'videos' | 'pics' | null>(null);

  const handleUploadSuccess = (fileName: string) => {
    setUploadedPdfName(fileName);
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">Upload Your PDF</h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Upload a PDF document and get intelligent Video and Image recommendations based on its content
        </p>
      </header>

      <main className="flex flex-col items-center space-y-10">
        {!uploadedPdfName ? (
          <div className="w-full max-w-lg">
            <PDFUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : !recommendationType ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">PDF Uploaded Successfully!</h2>
              <p className="text-gray-600">{uploadedPdfName}</p>
            </div>
            
            <p className="text-center mb-4">Choose what type of recommendations you want:</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setRecommendationType('videos')}
                className="w-full sm:w-auto"
                size="lg"
              >
                <svg 
                  className="w-5 h-5 mr-2"
                  fill="none" 
                  stroke="currentColor"
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Videos
              </Button>
              <Button
                onClick={() => setRecommendationType('pics')}
                className="w-full sm:w-auto"
                size="lg"
                variant="secondary"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Images
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <Button
                onClick={() => {
                  setUploadedPdfName(null);
                  setRecommendationType(null);
                }}
                variant="ghost"
                className="text-sm"
              >
                Upload a different PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">{uploadedPdfName}</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                <Button
                  onClick={() => setRecommendationType(null)}
                  variant="outline"
                  size="sm"
                >
                  Back to Options
                </Button>
                <Button
                  onClick={() => {
                    setUploadedPdfName(null);
                    setRecommendationType(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Upload New PDF
                </Button>
              </div>
            </div>
            
            <Recommendations 
              type={recommendationType} 
              pdfFileName={uploadedPdfName} 
            />
          </div>
        )}
      </main>
      
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Tugza innovation private limited @2025 - All rights reserved</p>
      </footer>
    </div>
  );
}
