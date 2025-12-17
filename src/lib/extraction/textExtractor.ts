// Plain text file extraction

export interface TextExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

export async function extractTextFromFile(file: File): Promise<TextExtractionResult> {
  try {
    const text = await file.text();
    
    if (!text.trim()) {
      return {
        success: false,
        text: '',
        error: 'The file appears to be empty. Please upload a file with content.',
      };
    }
    
    return {
      success: true,
      text: text.trim(),
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: `Failed to read text file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Extract text from VTT/SRT subtitle files
export async function extractTextFromSubtitle(file: File): Promise<TextExtractionResult> {
  try {
    const content = await file.text();
    
    if (!content.trim()) {
      return {
        success: false,
        text: '',
        error: 'The subtitle file appears to be empty.',
      };
    }
    
    // Parse VTT/SRT and extract just the text content
    const lines = content.split('\n');
    const textLines: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines, WEBVTT header, timestamps, and cue numbers
      if (
        !trimmed ||
        trimmed === 'WEBVTT' ||
        trimmed.includes('-->') ||
        /^\d+$/.test(trimmed) ||
        /^\d{2}:\d{2}/.test(trimmed)
      ) {
        continue;
      }
      
      // Remove HTML tags that might be in subtitles
      const cleanText = trimmed.replace(/<[^>]*>/g, '');
      if (cleanText) {
        textLines.push(cleanText);
      }
    }
    
    const extractedText = textLines.join(' ');
    
    if (!extractedText) {
      return {
        success: false,
        text: '',
        error: 'No readable text found in subtitle file.',
      };
    }
    
    return {
      success: true,
      text: extractedText,
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: `Failed to parse subtitle file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
