// Image OCR - uses Tesseract.js loaded from CDN to avoid bundling issues

export interface OCRExtractionResult {
  success: boolean;
  text: string;
  confidence: number;
  error?: string;
}

// Load Tesseract from CDN
async function loadTesseract(): Promise<any> {
  if ((window as any).Tesseract) {
    return (window as any).Tesseract;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => resolve((window as any).Tesseract);
    script.onerror = () => reject(new Error('Failed to load OCR library'));
    document.head.appendChild(script);
  });
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRExtractionResult> {
  try {
    const Tesseract = await loadTesseract();
    const imageUrl = URL.createObjectURL(file);
    
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });
    
    URL.revokeObjectURL(imageUrl);
    
    const extractedText = result.data.text.trim();
    const confidence = result.data.confidence;
    
    if (!extractedText) {
      return {
        success: false,
        text: '',
        confidence: 0,
        error: 'No readable text found in image.',
      };
    }
    
    return {
      success: true,
      text: extractedText,
      confidence,
      error: confidence < 50 ? `Low confidence (${confidence.toFixed(0)}%)` : undefined,
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      confidence: 0,
      error: `OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
