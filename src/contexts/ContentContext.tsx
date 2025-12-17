import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UploadState, NormalizedContent, RawExtractedContent } from '@/types/content';
import type { TransformedContent } from '@/types/rendering';
import type { ProfileId } from '@/types/accessibility';
import { normalizeContent } from '@/lib/normalizer';
import { transformContent } from '@/lib/transformers';

// ============================================
// CONTEXT TYPE
// ============================================

interface ContentContextType {
  uploadState: UploadState;
  normalizedContent: NormalizedContent | null;
  transformedContent: TransformedContent | null;
  
  // Actions
  processContent: (rawContent: RawExtractedContent) => Promise<void>;
  transformForProfiles: (profiles: ProfileId[]) => Promise<void>;
  resetContent: () => void;
  setUploadProgress: (progress: number) => void;
  setUploadError: (error: string) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

// ============================================
// INITIAL STATE
// ============================================

const initialUploadState: UploadState = {
  status: 'idle',
  progress: 0,
};

// ============================================
// PROVIDER
// ============================================

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [uploadState, setUploadState] = useState<UploadState>(initialUploadState);
  const [normalizedContent, setNormalizedContent] = useState<NormalizedContent | null>(null);
  const [transformedContent, setTransformedContent] = useState<TransformedContent | null>(null);
  
  const processContent = useCallback(async (rawContent: RawExtractedContent) => {
    try {
      // Start with extracting status
      setUploadState((prev) => ({ ...prev, status: 'extracting', progress: 30 }));
      
      // Move to normalizing
      setUploadState((prev) => ({ ...prev, status: 'normalizing', progress: 60 }));
      
      const normalized = await normalizeContent(rawContent);
      setNormalizedContent(normalized);
      
      setUploadState((prev) => ({
        ...prev,
        status: 'complete',
        progress: 100,
        normalizedContent: normalized,
      }));
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to process content',
      }));
    }
  }, []);
  
  const transformForProfiles = useCallback(async (profiles: ProfileId[]) => {
    if (!normalizedContent) {
      console.warn('No normalized content to transform');
      return;
    }
    
    try {
      const transformed = await transformContent(normalizedContent, profiles);
      setTransformedContent(transformed);
    } catch (error) {
      console.error('Failed to transform content:', error);
    }
  }, [normalizedContent]);
  
  const resetContent = useCallback(() => {
    setUploadState(initialUploadState);
    setNormalizedContent(null);
    setTransformedContent(null);
  }, []);
  
  const setUploadProgress = useCallback((progress: number) => {
    setUploadState((prev) => ({ ...prev, progress }));
  }, []);
  
  const setUploadError = useCallback((error: string) => {
    setUploadState((prev) => ({ ...prev, status: 'error', error }));
  }, []);
  
  const value: ContentContextType = {
    uploadState,
    normalizedContent,
    transformedContent,
    processContent,
    transformForProfiles,
    resetContent,
    setUploadProgress,
    setUploadError,
  };
  
  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
