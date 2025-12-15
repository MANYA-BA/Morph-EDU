// ============================================
// AI TRANSFORMER → UI RENDERER CONTRACT
// ============================================

import type { NormalizedContent, SemanticBlock } from './content';
import type { ProfileId } from './accessibility';

// ============================================
// VISUAL HINTS FOR RENDERING
// ============================================

export interface VisualHint {
  type: 'highlight' | 'icon' | 'badge' | 'border' | 'background';
  value: string;
  position?: 'start' | 'end' | 'inline';
}

// ============================================
// RENDERED BLOCK - Output from Transformer
// ============================================

export interface RenderedBlock {
  id: string;
  sourceBlockId: string;
  variant: ProfileId | 'default';
  content: string;
  html?: string;
  audioScript?: string;
  visualHints?: VisualHint[];
  // Profile-specific additions
  simplifiedContent?: string;
  keywords?: string[];
  stepNumber?: number;
  spatialDescription?: string;
}

// ============================================
// ACCESSIBILITY METADATA
// ============================================

export interface AccessibilityMetadata {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  announceOnFocus?: string;
}

// ============================================
// TRANSFORMED CONTENT - Final Contract
// ============================================

export interface TransformedContent {
  source: NormalizedContent;
  activeProfiles: ProfileId[];
  renderedBlocks: RenderedBlock[];
  accessibility: AccessibilityMetadata;
  // Layout directives
  layout: {
    type: 'linear' | 'cards' | 'focus' | 'spatial';
    columns?: number;
    spacing: 'compact' | 'normal' | 'generous';
  };
  // Timing directives
  timing: {
    autoAdvance: boolean;
    intervalMs?: number;
    pauseOnInteraction: boolean;
  };
}

// ============================================
// TRANSFORMER FUNCTION SIGNATURE
// ============================================

export type ContentTransformer = (
  content: NormalizedContent,
  profiles: ProfileId[]
) => Promise<TransformedContent>;
