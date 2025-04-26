import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.4,
  topP: 0.8,
  topK: 40,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function getTopicsFromText(text: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
    Extract the 5 most important topics or concepts from the following text.
    Return them as a JSON array of strings, nothing else.
    
    Text: ${text}
  `;
  
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const responseText = response.text();
    
    try {
      // Clean up response to extract valid JSON
      const jsonStr = responseText.replace(/```json|```|\n/g, '').trim();
      // console.log('Topics: ', jsonStr);
      
      // Check if we have a valid JSON array
      if (jsonStr.startsWith('[') && jsonStr.endsWith(']')) {
        return JSON.parse(jsonStr);
      } else {
        // If not valid JSON, try to extract topics another way or use default
        console.warn('Gemini response was not in expected JSON format:', jsonStr);
        // Extract anything that looks like a topic between quotes
        const extractedTopics = jsonStr.match(/"([^"]+)"/g)?.map(t => t.replace(/"/g, ''));
        return extractedTopics || ['General knowledge', 'Education', 'Information', 'Learning', 'Reading'];
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return ['General knowledge', 'Education', 'Information', 'Learning', 'Reading'];
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return ['General knowledge', 'Education', 'Information', 'Learning', 'Reading'];
  }
}

export async function generateEmbeddings(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
  });
  
  const embedding = result.embedding;
  return embedding.values;
}

export async function getVideoRecommendations(topics: string[]): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
    Generate YouTube search queries for the following topics. For each topic, create one search query 
    that would yield high-quality educational content. Return them as a JSON array of strings, nothing else.
    
    Topics: ${topics.join(', ')}
  `;
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings,
  });
  
  const response = result.response;
  const responseText = response.text();
  
  try {
    // Clean up response to extract valid JSON
    const jsonStr = responseText.replace(/```json|```|\n/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return [];
  }
}

export async function getImageSearchQueries(topics: string[]): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
    Generate image search queries for the following topics. For each topic, create one 
    specific search query that would yield informative and relevant images. 
    Return them as a JSON array of strings, nothing else.
    
    Topics: ${topics.join(', ')}
  `;
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings,
  });
  
  const response = result.response;
  const responseText = response.text();
  
  try {
    // Clean up response to extract valid JSON
    const jsonStr = responseText.replace(/```json|```|\n/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return [];
  }
} 