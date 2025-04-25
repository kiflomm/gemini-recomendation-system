'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface RecommendationsProps {
  type: 'videos' | 'pics';
  pdfFileName: string;
}

export default function Recommendations({ type, pdfFileName }: RecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [pageRange, setPageRange] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const pageCount = 10;

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Retrieve the PDF file from IndexedDB
      const dbRequest = indexedDB.open('pdfStorage', 1);
      
      dbRequest.onsuccess = async function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pdfs'], 'readonly');
        const store = transaction.objectStore('pdfs');
        const request = store.get(pdfFileName);
        
        request.onsuccess = async function() {
          if (!request.result) {
            setError('PDF file not found in storage');
            setIsLoading(false);
            return;
          }
          
          const file = request.result.data;
          
          // Create form data with the file and options
          const formData = new FormData();
          formData.append('file', file);
          formData.append('startPage', currentPage.toString());
          formData.append('pageCount', pageCount.toString());
          formData.append('type', type);
          
          // Send the request to process the PDF
          const response = await fetch('/api/process-pdf', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process PDF');
          }
          
          const data = await response.json();
          
          setRecommendations(data.recommendations);
          setTopics(data.topics);
          setPageRange(data.pageRange);
          
          // Update the current page for the next batch
          setCurrentPage(currentPage + pageCount);
        };
        
        request.onerror = function() {
          setError('Failed to retrieve PDF from storage');
          setIsLoading(false);
        };
      };
      
      dbRequest.onerror = function() {
        setError('Failed to open PDF storage');
        setIsLoading(false);
      };
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      setError(error.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextBatch = async () => {
    await fetchRecommendations();
  };

  // Use useEffect for initial load - only run once on mount
  useEffect(() => {
    // Only fetch on component mount
    if (recommendations.length === 0) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {type === 'videos' ? 'Video Recommendations' : 'Image Recommendations'}
      </h2>
      
      {pageRange && (
        <p className="text-sm text-gray-500 mb-4">
          Showing recommendations for pages {pageRange}
        </p>
      )}
      
      {topics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Key Topics:</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md my-4">
          {error}
        </div>
      ) : (
        <>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-lg">{recommendation}</p>
                  {type === 'videos' && (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Search on YouTube →
                    </a>
                  )}
                  {type === 'pics' && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(recommendation)}&tbm=isch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Search Images →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No recommendations found</p>
          )}
          
          {!isComplete && (
            <div className="mt-8 text-center">
              <Button
                onClick={loadNextBatch}
                size="lg"
              >
                Load Next {pageCount} Pages
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 