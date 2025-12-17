import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UploadState, NormalizedContent, RawExtractedContent } from '@/types/content';
import type { TransformedContent } from '@/types/rendering';
import type { ProfileId } from '@/types/accessibility';
import { normalizeContent } from '@/lib/normalizer';
import { transformContent } from '@/lib/transformers';
import { interpretContent, interpretedToRawText, type InterpretedContent } from '@/lib/interpretation';

// ============================================
// CONTEXT TYPE
// ============================================

interface ContentContextType {
  uploadState: UploadState;
  normalizedContent: NormalizedContent | null;
  transformedContent: TransformedContent | null;
  interpretedContent: InterpretedContent | null;
  
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
  const [interpretedContent, setInterpretedContent] = useState<InterpretedContent | null>(null);
  
  const processContent = useCallback(async (rawContent: RawExtractedContent) => {
    try {
      // Step 1: Extraction complete, start AI interpretation
      setUploadState((prev) => ({ ...prev, status: 'interpreting', progress: 30 }));
      
      let interpreted: InterpretedContent;
      let textForNormalization: string;
      
      try {
        // Call AI to interpret the content
        interpreted = await interpretContent(rawContent);
        setInterpretedContent(interpreted);
        
        // Convert AI interpretation to structured text
        textForNormalization = interpretedToRawText(interpreted);
        
        console.log('AI interpretation complete:', interpreted.topic);
      } catch (aiError) {
        // If AI fails, log but continue with raw text
        console.warn('AI interpretation failed, using raw extraction:', aiError);
        textForNormalization = rawContent.rawText;
        interpreted = {
          topic: 'Content Analysis',
          overview: 'AI interpretation unavailable. Showing extracted content.',
          contentType: 'text',
          sections: []
        };
        setInterpretedContent(interpreted);
      }
      
      // Step 2: Normalize the interpreted content
      setUploadState((prev) => ({ ...prev, status: 'normalizing', progress: 70 }));
      
      const normalizedRaw: RawExtractedContent = {
        ...rawContent,
        rawText: textForNormalization
      };
      
      const normalized = await normalizeContent(normalizedRaw);
      
      // Add interpretation metadata to normalized content
      normalized.interpretation = {
        topic: interpreted.topic,
        contentType: interpreted.contentType,
        spatialDescription: interpreted.spatialDescription
      };
      
      setNormalizedContent(normalized);
      
      setUploadState((prev) => ({
        ...prev,
        status: 'complete',
        progress: 100,
        normalizedContent: normalized,
      }));
    } catch (error) {
      console.error('Content processing error:', error);
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
    setInterpretedContent(null);
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
    interpretedContent,
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
