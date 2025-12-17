// PDF Text Extraction using pdf.js via CDN
// This avoids bundling issues with pdfjs-dist

export interface PDFExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  error?: string;
}

// Load pdf.js from CDN
async function loadPdfJs(): Promise<any> {
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js library'));
    document.head.appendChild(script);
  });
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    const pdfjsLib = await loadPdfJs();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pageCount = pdf.numPages;
    const textParts: string[] = [];
    
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      
      if (pageText.trim()) {
        textParts.push(`[Page ${i}]\n${pageText.trim()}`);
      }
    }
    
    const fullText = textParts.join('\n\n');
    
    if (!fullText.trim()) {
      return {
        success: false,
        text: '',
        pageCount,
        error: 'No readable text found in PDF. The document may contain scanned images - try uploading as images for OCR.',
      };
    }
    
    return { success: true, text: fullText, pageCount };
  } catch (error) {
    return {
      success: false,
      text: '',
      pageCount: 0,
      error: `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
