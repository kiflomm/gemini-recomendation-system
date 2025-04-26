import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, getPageRangeString } from '@/utils/pdf-parser';
import { getTopicsFromText, generateEmbeddings, getVideoRecommendations, getImageSearchQueries } from '@/utils/gemini';
import { searchYouTubeVideos } from '@/utils/youtube';
import { storeEmbeddings } from '@/utils/pinecone';

// Import the interface from youtube.ts
interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const startPage = parseInt(formData.get('startPage') as string) || 1;
    const pageCount = parseInt(formData.get('pageCount') as string) || 1;
    const recommendationType = formData.get('type') as string; // 'videos' or 'pics'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF
    const text = await extractTextFromPDF(buffer, startPage, pageCount);

    // Generate embeddings for the text
    const embeddings = await generateEmbeddings(text);

    // Get the page range string
    const pageRange = getPageRangeString(startPage, pageCount);

    // Store the embeddings in Pinecone
    await storeEmbeddings(pageRange, embeddings, {
      fileName: file.name,
      pageCount,
      startPage,
    });

    // Extract topics from the text
    const topics = await getTopicsFromText(text);

    let recommendations: string[] = [];
    let videoData: YouTubeVideo[][] = [];

    // Generate recommendations based on the type
    if (recommendationType === 'videos') {
      recommendations = await getVideoRecommendations(topics);
      
      // Fetch actual YouTube videos for each recommendation
      const videoPromises = recommendations.map(query => searchYouTubeVideos(query));
      videoData = await Promise.all(videoPromises);
    } else if (recommendationType === 'pics') {
      recommendations = await getImageSearchQueries(topics);
    }

    return NextResponse.json({
      message: 'PDF processed successfully',
      pageRange,
      topics,
      recommendations,
      videoData: recommendationType === 'videos' ? videoData : undefined,
    });
  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process PDF' },
      { status: 500 }
    );
  }
} 