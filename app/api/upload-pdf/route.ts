import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/utils/pdf-parser';

// This configuration is needed for Next.js to handle form data properly
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Read the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert the file to an array buffer and then to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store the file in session storage for later use
    // Since we can't directly save the buffer to a session, we'll save the file details
    // and let the client upload it again for processing later

    return NextResponse.json({
      message: 'PDF uploaded successfully',
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    );
  }
} 