'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";

interface PDFUploaderProps {
  onUploadSuccess: (fileName: string) => void;
}

export default function PDFUploader({ onUploadSuccess }: PDFUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload PDF');
      }

      const data = await response.json();
      
      // Store the file in session storage for later use
      sessionStorage.setItem('pdfFile', JSON.stringify({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      }));
      
      // Store the actual file in IndexedDB for later retrieval
      const dbRequest = indexedDB.open('pdfStorage', 1);
      
      dbRequest.onupgradeneeded = function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs', { keyPath: 'name' });
        }
      };
      
      dbRequest.onsuccess = function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pdfs'], 'readwrite');
        const store = transaction.objectStore('pdfs');
        
        store.put({
          name: file.name,
          data: file,
          timestamp: new Date().getTime(),
        });
      };
      
      onUploadSuccess(file.name);
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      setUploadError(error.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    noClick: true, // Disable click to open file dialog
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <>
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {isDragActive
                ? 'Drop the PDF here'
                : 'Drag & drop a PDF file here'}
            </p>
            <p className="mt-1 text-xs text-gray-500 mb-4">
              PDF files only (max 50MB)
            </p>
            <Button 
              onClick={open} 
              className="w-full sm:w-auto"
              variant="outline"
            >
              Select PDF File
            </Button>
          </>
        )}
      </div>
      
      {uploadError && (
        <div className="mt-2 text-sm text-red-600">{uploadError}</div>
      )}
    </div>
  );
} 