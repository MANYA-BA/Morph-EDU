// Unified Content Extraction Service
// Routes files to appropriate extractors and returns normalized results

import { extractTextFromPDF } from './pdfExtractor';
import { extractTextFromImage } from './imageExtractor';
import { extractTextFromFile, extractTextFromSubtitle } from './textExtractor';
import type { ContentSourceType } from '@/types/content';

export interface ExtractionResult {
  success: boolean;
  text: string;
  sourceType: ContentSourceType;
  error?: string;
  warning?: string;
  metadata?: {
    pageCount?: number;
    confidence?: number;
  };
}

export interface ExtractionOptions {
  onProgress?: (progress: number, status: string) => void;
}

/**
 * Detect file type from file extension and MIME type
 */
function detectSourceType(file: File): ContentSourceType {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();
  
  // PDF detection
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }
  
  // Image detection
  if (
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'].includes(ext) ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }
  
  // Subtitle/transcript detection
  if (['vtt', 'srt'].includes(ext)) {
    return 'transcript';
  }
  
  // Default to text
  return 'text';
}

/**
 * Extract content from any supported file type
 * Routes to the appropriate extractor based on file type
 */
export async function extractContent(
  file: File,
  options: ExtractionOptions = {}
): Promise<ExtractionResult> {
  const { onProgress } = options;
  const sourceType = detectSourceType(file);
  
  onProgress?.(10, 'Analyzing file...');
  
  try {
    switch (sourceType) {
      case 'pdf': {
        onProgress?.(20, 'Extracting text from PDF...');
        const result = await extractTextFromPDF(file);
        
        if (!result.success) {
          return {
            success: false,
            text: '',
            sourceType,
            error: result.error,
          };
        }
        
        onProgress?.(90, 'PDF extraction complete');
        return {
          success: true,
          text: result.text,
          sourceType,
          metadata: { pageCount: result.pageCount },
        };
      }
      
      case 'image': {
        onProgress?.(20, 'Performing OCR on image...');
        const result = await extractTextFromImage(file, (progress) => {
          onProgress?.(20 + progress * 0.7, 'Recognizing text...');
        });
        
        if (!result.success && !result.text) {
          return {
            success: false,
            text: '',
            sourceType,
            error: result.error,
          };
        }
        
        onProgress?.(90, 'OCR complete');
        return {
          success: true,
          text: result.text,
          sourceType,
          warning: result.confidence < 70 ? result.error : undefined,
          metadata: { confidence: result.confidence },
        };
      }
      
      case 'transcript': {
        onProgress?.(20, 'Parsing subtitle file...');
        const result = await extractTextFromSubtitle(file);
        
        if (!result.success) {
          return {
            success: false,
            text: '',
            sourceType,
            error: result.error,
          };
        }
        
        onProgress?.(90, 'Transcript extraction complete');
        return {
          success: true,
          text: result.text,
          sourceType,
        };
      }
      
      case 'text':
      default: {
        onProgress?.(20, 'Reading text file...');
        const result = await extractTextFromFile(file);
        
        if (!result.success) {
          return {
            success: false,
            text: '',
            sourceType,
            error: result.error,
          };
        }
        
        onProgress?.(90, 'Text extraction complete');
        return {
          success: true,
          text: result.text,
          sourceType,
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      text: '',
      sourceType,
      error: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Re-export individual extractors for direct use if needed
export { extractTextFromPDF } from './pdfExtractor';
export { extractTextFromImage } from './imageExtractor';
export { extractTextFromFile, extractTextFromSubtitle } from './textExtractor';
