// ============================================
// SEMANTIC NORMALIZATION LAYER - Output Contract
// ============================================

export type SemanticBlockType =
  | 'heading'
  | 'paragraph'
  | 'definition'
  | 'example'
  | 'step'
  | 'list'
  | 'image'
  | 'quote'
  | 'code';

export interface SemanticBlockMetadata {
  importance: 'critical' | 'supporting' | 'supplementary';
  complexity: 1 | 2 | 3;
  keywords: string[];
  relationships: string[]; // IDs of related blocks
}

export interface SemanticBlock {
  id: string;
  type: SemanticBlockType;
  content: string;
  metadata: SemanticBlockMetadata;
}

export interface NormalizedContent {
  id: string;
  title: string;
  summary: string;
  blocks: SemanticBlock[];
  outline: string[];
  sourceType: ContentSourceType;
  createdAt: Date;
}

// ============================================
// CONTENT EXTRACTION - Input Types
// ============================================

export type ContentSourceType = 'pdf' | 'image' | 'text' | 'transcript';

export interface RawExtractedContent {
  sourceType: ContentSourceType;
  rawText: string;
  fileName?: string;
  fileSize?: number;
  extractedAt: Date;
}

// ============================================
// UPLOAD STATE
// ============================================

export type UploadStatus = 'idle' | 'uploading' | 'extracting' | 'normalizing' | 'complete' | 'error';

export interface UploadState {
  status: UploadStatus;
  progress: number;
  file?: File;
  error?: string;
  rawContent?: RawExtractedContent;
  normalizedContent?: NormalizedContent;
}
