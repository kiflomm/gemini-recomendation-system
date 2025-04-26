'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface GiphyGif {
  id: string;
  title: string;
  url: string;
  preview: string;
}

interface RecommendationsProps {
  type: 'videos' | 'pics' | 'gifs';
  pdfFileName: string;
}

export default function Recommendations({ type, pdfFileName }: RecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [videoData, setVideoData] = useState<YouTubeVideo[][]>([]);
  const [gifData, setGifData] = useState<GiphyGif[][]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [pageRange, setPageRange] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const pageCount = 1;

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

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
          
          try {
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
            
            if (data.recommendations && data.recommendations.length > 0) {
              setRecommendations(data.recommendations);
            }
            
            if (type === 'videos' && data.videoData && data.videoData.length > 0) {
              setVideoData(data.videoData);
            }
            
            if (type === 'gifs' && data.gifData && data.gifData.length > 0) {
              setGifData(data.gifData);
            }
            
            if (data.topics && data.topics.length > 0) {
              setTopics(data.topics);
            }
            
            if (data.pageRange) {
              setPageRange(data.pageRange);
            }
            
            // If we've processed all pages or didn't get useful results, mark as complete
            if (!data.recommendations || data.recommendations.length === 0) {
              setIsComplete(true);
            } else {
              // Update the current page for the next batch
              setCurrentPage(currentPage + pageCount);
            }
          } catch (error: any) {
            console.error('Error processing PDF:', error);
            setError(error.message || 'Failed to process PDF');
          } finally {
            setIsLoading(false);
          }
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

  // Render a YouTube video embed
  const renderYouTubeVideo = (video: YouTubeVideo) => (
    <div className="mb-4">
      <iframe
        width="100%"
        height="400"
        src={`https://www.youtube.com/embed/${video.id}`}
        title={video.title}
        // frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <h3 className="text-md font-medium mt-2">{video.title}</h3>
      <p className="text-sm text-gray-500">{video.channelTitle}</p>
    </div>
  );

  // Render a GIF image
  const renderGif = (gif: GiphyGif) => (
    <div className="mb-4">
      <img 
        src={gif.preview} 
        alt={gif.title}
        className="w-full rounded-md shadow-sm hover:shadow-md transition-shadow"
      />
      {gif.title && (
        <p className="text-sm text-gray-600 mt-1 truncate">{gif.title}</p>
      )}
    </div>
  );

  // Get image search URL
  const getImageSearchUrl = (query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  };

  // Get GIF search URL
  const getGifSearchUrl = (query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=itp:animated`;
  };

  const getRecommendationTitle = () => {
    if (type === 'videos') return 'Video Recommendations';
    if (type === 'pics') return 'Image Recommendations';
    return 'GIF Recommendations';
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {getRecommendationTitle()}
      </h2>
      
      {pageRange && (
        <p className="text-sm text-gray-500 mb-4">
          Showing recommendations for page {pageRange}
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
          {type === 'videos' && videoData.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {videoData.map((videoSet, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">Based on: {recommendations[idx]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {videoSet.map((video, videoIdx) => (
                      <div key={video.id || videoIdx}>
                        {renderYouTubeVideo(video)}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : type === 'pics' && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="text-lg">{recommendation}</p>
                  </CardContent>
                  <CardFooter>
                    <a
                      href={getImageSearchUrl(recommendation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Search Images →
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : type === 'gifs' && gifData.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {gifData.map((gifSet, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">Based on: {recommendations[idx]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {gifSet.map((gif, gifIdx) => (
                        <div key={gif.id || gifIdx}>
                          {renderGif(gif)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <a
                      href={`https://giphy.com/search/${encodeURIComponent(recommendations[idx])}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      More on GIPHY →
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : type === 'gifs' && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="text-lg">{recommendation}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <a
                      href={getGifSearchUrl(recommendation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Search GIFs on Google →
                    </a>
                    <a
                      href={`https://giphy.com/search/${encodeURIComponent(recommendation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Search on GIPHY →
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">Looking for relevant content...</p>
              <div className="inline-block animate-pulse bg-gray-200 h-6 w-32 rounded-md"></div>
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
                Load Next Page
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 