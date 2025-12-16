import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { useSpeech } from '@/hooks/useSpeech';
import { ProfileError } from '../ProfileErrorBoundary';
import type { RenderedBlock, TransformedContent } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface BlindRendererProps {
  content: TransformedContent;
}

export function BlindRenderer({ content }: BlindRendererProps) {
  const { renderedBlocks, accessibility } = content;
  const { 
    isSupported, 
    isSpeaking, 
    isPaused, 
    currentBlockId, 
    error,
    speak, 
    pause, 
    resume, 
    stop,
    clearError 
  } = useSpeech();
  
  const [rate, setRate] = useState(1.0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current block
  useEffect(() => {
    if (currentBlockId) {
      const element = document.getElementById(currentBlockId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  }, [currentBlockId]);

  const handleReadBlock = (block: RenderedBlock, index: number) => {
    const textToRead = block.audioScript || block.content;
    setCurrentIndex(index);
    speak(textToRead, block.id, { rate });
  };

  const handleReadAll = () => {
    const blocksToRead = renderedBlocks
      .filter(b => b.audioScript || b.content)
      .map(b => ({
        id: b.id,
        text: b.audioScript || b.content
      }));
    
    if (blocksToRead.length > 0) {
      speak(blocksToRead[0].text, blocksToRead[0].id, { rate });
    }
  };

  const handleNextBlock = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < renderedBlocks.length) {
      stop();
      handleReadBlock(renderedBlocks[nextIndex], nextIndex);
    }
  };

  const handleTogglePlayPause = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      handleReadAll();
    }
  };

  if (!isSupported) {
    return (
      <div role="article" aria-label={accessibility.ariaLabel}>
        <ProfileError
          type="unsupported"
          feature="Text-to-Speech"
          profile="blind"
          message="Your browser does not support the Web Speech API needed for audio narration."
          suggestion="Please use Chrome, Firefox, Edge, or Safari for the best experience."
        />
        {/* Still render content for screen readers */}
        <div className="sr-only">
          {renderedBlocks.map(block => (
            <p key={block.id}>{block.audioScript || block.content}</p>
          ))}
        </div>
        <div className="space-y-6">
          {renderedBlocks.map((block, index) => (
            <BlindBlock 
              key={block.id} 
              block={block} 
              isActive={false}
              onRead={() => {}}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      role="article" 
      aria-label={accessibility.ariaLabel}
      className="space-y-6"
    >
      {/* Audio Controls - Sticky */}
      <Card className="sticky top-4 z-10 bg-background/95 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="lg"
                onClick={handleTogglePlayPause}
                aria-label={isSpeaking && !isPaused ? 'Pause reading' : isPaused ? 'Resume reading' : 'Read all content'}
                className="touch-target-min"
              >
                {isSpeaking && !isPaused ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                <span className="ml-2">
                  {isSpeaking && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Read All'}
                </span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => stop()}
                disabled={!isSpeaking && !isPaused}
                aria-label="Stop reading"
                className="touch-target-min"
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextBlock}
                disabled={!isSpeaking || currentIndex >= renderedBlocks.length - 1}
                aria-label="Skip to next section"
                className="touch-target-min"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="speech-rate" className="text-sm text-muted-foreground whitespace-nowrap">
                Speed:
              </label>
              <Slider
                id="speech-rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={([v]) => setRate(v)}
                className="flex-1"
                aria-label={`Speech rate: ${rate}x`}
              />
              <span className="text-sm font-medium w-12 text-right">{rate}x</span>
            </div>
          </div>

          {/* Progress indicator */}
          {isSpeaking && (
            <div className="mt-3 text-sm text-muted-foreground" aria-live="polite">
              Reading section {currentIndex + 1} of {renderedBlocks.length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <ProfileError
          type="fallback"
          feature="Audio Playback"
          message={error}
          suggestion="Try refreshing the page or using a different browser."
        />
      )}

      {/* Content blocks */}
      <div className="space-y-8" role="list" aria-label="Content sections">
        {renderedBlocks.map((block, index) => (
          <BlindBlock
            key={block.id}
            block={block}
            isActive={currentBlockId === block.id}
            onRead={() => handleReadBlock(block, index)}
          />
        ))}
      </div>
    </div>
  );
}

interface BlindBlockProps {
  block: RenderedBlock;
  isActive: boolean;
  onRead: () => void;
}

function BlindBlock({ block, isActive, onRead }: BlindBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);

  return (
    <div
      id={block.id}
      ref={blockRef}
      role="listitem"
      tabIndex={0}
      className={cn(
        'p-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
        isActive && 'bg-primary/10 ring-2 ring-primary',
        !isActive && 'bg-secondary/20 hover:bg-secondary/40'
      )}
      aria-current={isActive ? 'true' : undefined}
      aria-label={block.audioScript || block.content}
    >
      {/* Screen reader optimized content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {block.simplifiedContent || block.content}
      </div>

      {/* Spatial description for images/diagrams */}
      {block.spatialDescription && (
        <p className="mt-3 text-muted-foreground italic border-l-2 border-muted pl-3">
          {block.spatialDescription}
        </p>
      )}

      {/* Read button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRead}
        className="mt-3 touch-target-min"
        aria-label={`Read this section aloud`}
      >
        <Volume2 className="h-4 w-4 mr-2" aria-hidden="true" />
        Read aloud
      </Button>
    </div>
  );
}
