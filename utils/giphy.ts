import axios from 'axios';

interface GiphyGif {
  id: string;
  title: string;
  url: string;
  preview: string;
}

export async function searchGiphyGifs(query: string): Promise<GiphyGif[]> {
  const API_KEY = process.env.GIPHY_API_KEY;
  
  if (!API_KEY) {
    throw new Error('GIPHY API key is not configured');
  }
  
  try {
    // Limit query length to prevent 414 URI Too Long errors
    const truncatedQuery = query.length > 100 ? query.substring(0, 100) : query;
    
    const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: API_KEY,
        q: truncatedQuery,
        limit: 3,
        rating: 'g'
      }
    });
    
    return response.data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      url: item.images.original.url,
      preview: item.images.fixed_height.url
    }));
  } catch (error) {
    console.error('GIPHY API error:', error);
    // Return empty array instead of throwing
    return [];
  }
} 