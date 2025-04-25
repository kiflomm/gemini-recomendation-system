import { Pinecone } from '@pinecone-database/pinecone';

let pineconeInstance: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  
  return pineconeInstance;
}

export async function storeEmbeddings(pageRange: string, embeddings: number[], metadata: any) {
  const pinecone = await getPineconeClient();
  const index = pinecone.index(process.env.PINECONE_INDEX!);
  
  await index.upsert([{
    id: `pdf-${pageRange}`,
    values: embeddings,
    metadata: {
      ...metadata,
      pageRange,
    },
  }]);
}

export async function queryEmbeddings(embeddings: number[], topK: number = 5) {
  const pinecone = await getPineconeClient();
  const index = pinecone.index(process.env.PINECONE_INDEX!);
  
  const queryResponse = await index.query({
    vector: embeddings,
    topK,
    includeMetadata: true,
  });
  
  return queryResponse.matches;
} 