import { supabase } from '@/integrations/supabase/client';
import type { RawExtractedContent } from '@/types/content';

// ============================================
// INTERPRETED CONTENT TYPES
// ============================================

export interface InterpretedSection {
  title: string;
  explanation: string;
  keyPoints: string[];
  type: 'concept' | 'definition' | 'example' | 'procedure' | 'summary';
}

export interface InterpretedContent {
  topic: string;
  overview: string;
  sections: InterpretedSection[];
  contentType: 'text' | 'diagram' | 'flowchart' | 'notes' | 'graph' | 'table' | 'mixed';
  spatialDescription?: string;
}

// ============================================
// AI INTERPRETATION SERVICE
// ============================================

export async function interpretContent(
  raw: RawExtractedContent
): Promise<InterpretedContent> {
  const isImage = raw.sourceType === 'image';
  
  console.log('Sending content for AI interpretation...', {
    sourceType: raw.sourceType,
    isImage,
    textLength: raw.rawText.length
  });

  const { data, error } = await supabase.functions.invoke('interpret-content', {
    body: {
      rawText: raw.rawText,
      sourceType: raw.sourceType,
      isImage
    }
  });

  if (error) {
    console.error('Interpretation service error:', error);
    throw new Error(`AI interpretation failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'AI interpretation returned no data');
  }

  console.log('AI interpretation complete:', data.data.topic);
  return data.data as InterpretedContent;
}

// ============================================
// CONVERT INTERPRETED → RAW FOR NORMALIZER
// ============================================

/**
 * Converts AI-interpreted content back into a structured raw text format
 * that the existing normalizer can process effectively.
 * 
 * This creates clean, educational text from the AI's understanding.
 */
export function interpretedToRawText(interpreted: InterpretedContent): string {
  const lines: string[] = [];
  
  // Topic as main heading
  lines.push(`# ${interpreted.topic}`);
  lines.push('');
  
  // Overview
  lines.push(interpreted.overview);
  lines.push('');
  
  // Spatial description for images (critical for blind/low-vision)
  if (interpreted.spatialDescription) {
    lines.push('## Visual Layout');
    lines.push(interpreted.spatialDescription);
    lines.push('');
  }
  
  // Each section becomes a structured block
  for (const section of interpreted.sections) {
    // Section heading with type marker
    const typeMarker = getTypeMarker(section.type);
    lines.push(`## ${typeMarker}${section.title}`);
    lines.push('');
    
    // Explanation
    lines.push(section.explanation);
    lines.push('');
    
    // Key points as list
    if (section.keyPoints.length > 0) {
      lines.push('**Key Points:**');
      for (const point of section.keyPoints) {
        lines.push(`• ${point}`);
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

function getTypeMarker(type: InterpretedSection['type']): string {
  switch (type) {
    case 'definition': return 'Definition: ';
    case 'example': return 'Example: ';
    case 'procedure': return 'Steps: ';
    case 'summary': return 'Summary: ';
    default: return '';
  }
}
