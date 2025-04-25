'use client';

import { useState } from 'react';
import Image from 'next/image';
import PDFUploader from '../components/PDFUploader';
import Recommendations from '../components/Recommendations';

export default function Home() {
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [recommendationType, setRecommendationType] = useState<'videos' | 'pics' | null>(null);

  const handleUploadSuccess = (fileName: string) => {
    setUploadedPdfName(fileName);
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">PDF Insight Engine</h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Upload a PDF document and get intelligent recommendations based on its content
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
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setRecommendationType('videos')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg 
                  className="w-5 h-5"
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
              </button>
              <button
                onClick={() => setRecommendationType('pics')}
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setUploadedPdfName(null);
                  setRecommendationType(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Upload a different PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{uploadedPdfName}</h2>
              <div className="space-x-4">
                <button
                  onClick={() => setRecommendationType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Back to Options
                </button>
                <button
                  onClick={() => {
                    setUploadedPdfName(null);
                    setRecommendationType(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Upload New PDF
                </button>
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
        <p>PDF Insight Engine - Powered by Gemini AI and Pinecone</p>
      </footer>
    </div>
  );
}
