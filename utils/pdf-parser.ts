import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(pdfBuffer: Buffer, startPage: number = 1, pageCount: number = 1): Promise<string> {
  const options = {
    max: startPage + pageCount - 1, // Extract up to this page (inclusive)
    pagerender: function(pageData: any) {
      // Skip pages before startPage
      if (pageData.pageIndex < startPage - 1) {
        return Promise.resolve('');
      }
      
      // Get the text content of the page
      return pageData.getTextContent()
        .then(function(textContent: any) {
          let text = '';
          for (let item of textContent.items) {
            text += item.str + ' ';
          }
          return text;
        });
    }
  };

  try {
    const data = await pdfParse(pdfBuffer, options);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

export function getPageRangeString(startPage: number, pageCount: number = 1): string {
  if (pageCount === 1) {
    return `${startPage}`;
  }
  const endPage = startPage + pageCount - 1;
  return `${startPage}-${endPage}`;
} 