'use client';

import { useState } from 'react'; 
import PDFUploader from '@/components/PDFUploader';
import Recommendations from '@/components/Recommendations';
import { Button } from "@/components/ui/button";
import { Play, Image, Sticker } from "lucide-react";

export default function Home() {
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [recommendationType, setRecommendationType] = useState<'videos' | 'pics' | 'gifs' | null>(null);

  const handleUploadSuccess = (fileName: string) => {
    setUploadedPdfName(fileName);
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">Upload Your PDF</h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Upload a PDF document and get intelligent Video, Image, and GIF recommendations based on its content
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
                <Play className="w-5 h-5 mr-2" />
                Videos
              </Button>
              <Button
                onClick={() => setRecommendationType('pics')}
                className="w-full sm:w-auto"
                size="lg"
                variant="secondary"
              >
                <Image className="w-5 h-5 mr-2" />
                Images
              </Button>
              <Button
                onClick={() => setRecommendationType('gifs')}
                className="w-full sm:w-auto"
                size="lg"
                variant="outline"
              >
                <Sticker className="w-5 h-5 mr-2" />
                GIFs
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
