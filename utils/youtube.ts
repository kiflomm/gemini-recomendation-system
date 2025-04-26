import axios from 'axios';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    throw new Error('YouTube API key is not configured');
  }
  
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 3,
        q: query,
        type: 'video',
        key: API_KEY
      }
    });
    
    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('YouTube API error:', error);
    throw new Error('Failed to fetch videos from YouTube');
  }
} 