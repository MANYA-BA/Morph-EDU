import type {
  RawExtractedContent,
  NormalizedContent,
  SemanticBlock,
  SemanticBlockType,
  SemanticBlockMetadata,
} from '@/types/content';

// ============================================
// SEMANTIC NORMALIZATION LAYER
// ============================================

function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function detectBlockType(text: string, index: number): SemanticBlockType {
  const trimmed = text.trim();
  
  // Heading detection
  if (/^#{1,6}\s/.test(trimmed) || /^[A-Z][^.!?]*$/.test(trimmed) && trimmed.length < 100) {
    return 'heading';
  }
  
  // Definition detection
  if (/^(?:Definition|Meaning|Term):/i.test(trimmed) || /\bis defined as\b/i.test(trimmed)) {
    return 'definition';
  }
  
  // Example detection
  if (/^(?:Example|For instance|e\.g\.|E\.g\.):/i.test(trimmed) || /^(?:Example|For example)/i.test(trimmed)) {
    return 'example';
  }
  
  // Step detection
  if (/^(?:Step\s+\d+|^\d+\.|^[a-z]\))/i.test(trimmed)) {
    return 'step';
  }
  
  // List detection
  if (/^[-•*]\s/.test(trimmed) || /^\d+\)\s/.test(trimmed)) {
    return 'list';
  }
  
  // Quote detection
  if (/^[""]/.test(trimmed) || /^>/.test(trimmed)) {
    return 'quote';
  }
  
  // Code detection
  if (/^```/.test(trimmed) || /^\s{4,}/.test(text)) {
    return 'code';
  }
  
  return 'paragraph';
}

function assessImportance(text: string, type: SemanticBlockType): SemanticBlockMetadata['importance'] {
  if (type === 'heading') return 'critical';
  if (type === 'definition') return 'critical';
  if (type === 'step') return 'critical';
  
  // Check for emphasis markers
  if (/\*\*|__|\bimportant\b|\bcritical\b|\bkey\b|\bnote\b/i.test(text)) {
    return 'critical';
  }
  
  if (type === 'example' || type === 'quote') return 'supporting';
  
  return 'supplementary';
}

function assessComplexity(text: string): 1 | 2 | 3 {
  const words = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s+/g, '').length / words;
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
  const avgSentenceLength = words / sentenceCount;
  
  // Simple heuristic: longer words + longer sentences = more complex
  const score = avgWordLength * 0.3 + avgSentenceLength * 0.1;
  
  if (score < 5) return 1;
  if (score < 8) return 2;
  return 3;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use NLP
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once', 'and',
    'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'not',
    'only', 'own', 'same', 'than', 'too', 'very', 'just', 'this', 'that',
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
  
  // Count frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  
  // Return top keywords
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function splitIntoBlocks(rawText: string): string[] {
  // Split by double newlines or markdown-style breaks
  return rawText
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

// ============================================
// MAIN NORMALIZER FUNCTION
// ============================================

export async function normalizeContent(
  raw: RawExtractedContent
): Promise<NormalizedContent> {
  const textBlocks = splitIntoBlocks(raw.rawText);
  
  const blocks: SemanticBlock[] = textBlocks.map((text, index) => {
    const type = detectBlockType(text, index);
    const importance = assessImportance(text, type);
    const complexity = assessComplexity(text);
    const keywords = extractKeywords(text);
    
    return {
      id: generateId(),
      type,
      content: text.replace(/^#{1,6}\s/, '').replace(/^[-•*]\s/, '').trim(),
      metadata: {
        importance,
        complexity,
        keywords,
        relationships: [], // Would be populated by more advanced NLP
      },
    };
  });
  
  // Extract title from first heading or first block
  const titleBlock = blocks.find((b) => b.type === 'heading');
  const title = titleBlock?.content || blocks[0]?.content.slice(0, 50) || 'Untitled';
  
  // Generate outline from headings
  const outline = blocks
    .filter((b) => b.type === 'heading')
    .map((b) => b.content);
  
  // Generate summary from first few paragraphs
  const summaryBlocks = blocks
    .filter((b) => b.type === 'paragraph')
    .slice(0, 2);
  const summary = summaryBlocks.map((b) => b.content).join(' ').slice(0, 200);
  
  return {
    id: `content_${Date.now()}`,
    title,
    summary: summary || 'No summary available.',
    blocks,
    outline,
    sourceType: raw.sourceType,
    createdAt: new Date(),
  };
}
