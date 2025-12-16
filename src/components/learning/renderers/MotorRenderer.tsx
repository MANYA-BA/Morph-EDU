import { useState, useRef, useEffect } from 'react';
import { Keyboard, MousePointer, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileError } from '../ProfileErrorBoundary';
import { useSpeech } from '@/hooks/useSpeech';
import type { RenderedBlock, TransformedContent } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface MotorRendererProps {
  content: TransformedContent;
}

export function MotorRenderer({ content }: MotorRendererProps) {
  const { renderedBlocks, accessibility } = content;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSupported: ttsSupported, speak, stop } = useSpeech();

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we're focused within this component
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setActiveIndex(prev => Math.min(prev + 1, renderedBlocks.length - 1));
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setActiveIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(renderedBlocks.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Read current block aloud if TTS available
          if (ttsSupported) {
            const block = renderedBlocks[activeIndex];
            speak(block.audioScript || block.content, block.id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          stop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, renderedBlocks, ttsSupported, speak, stop]);

  // Scroll active block into view
  useEffect(() => {
    const activeBlock = document.getElementById(`motor-block-${activeIndex}`);
    if (activeBlock) {
      activeBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      activeBlock.focus();
    }
  }, [activeIndex]);

  return (
    <div 
      ref={containerRef}
      role="article" 
      aria-label={accessibility.ariaLabel}
      className="space-y-6"
      tabIndex={-1}
    >
      {/* Keyboard navigation instructions */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Keyboard className="h-5 w-5" aria-hidden="true" />
            Keyboard Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">↓ / J</Badge>
              <span>Next section</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">↑ / K</Badge>
              <span>Previous section</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Enter</Badge>
              <span>Read aloud</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Esc</Badge>
              <span>Stop reading</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Large navigation buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={() => setActiveIndex(prev => Math.max(prev - 1, 0))}
          disabled={activeIndex === 0}
          className="h-16 px-8 text-lg touch-target-min"
          aria-label="Go to previous section"
        >
          <ChevronUp className="h-6 w-6 mr-2" aria-hidden="true" />
          Previous
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => setActiveIndex(prev => Math.min(prev + 1, renderedBlocks.length - 1))}
          disabled={activeIndex === renderedBlocks.length - 1}
          className="h-16 px-8 text-lg touch-target-min"
          aria-label="Go to next section"
        >
          Next
          <ChevronDown className="h-6 w-6 ml-2" aria-hidden="true" />
        </Button>
      </div>

      {/* Position indicator */}
      <div className="text-center text-muted-foreground">
        Section {activeIndex + 1} of {renderedBlocks.length}
      </div>

      {/* Content blocks with large touch targets */}
      <div className="space-y-4" role="list">
        {renderedBlocks.map((block, index) => (
          <MotorBlock
            key={block.id}
            block={block}
            index={index}
            isActive={index === activeIndex}
            onActivate={() => setActiveIndex(index)}
            onReadAloud={() => {
              if (ttsSupported) {
                speak(block.audioScript || block.content, block.id);
              }
            }}
            ttsSupported={ttsSupported}
          />
        ))}
      </div>
    </div>
  );
}

interface MotorBlockProps {
  block: RenderedBlock;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onReadAloud: () => void;
  ttsSupported: boolean;
}

function MotorBlock({ block, index, isActive, onActivate, onReadAloud, ttsSupported }: MotorBlockProps) {
  const sourceType = getSourceType(block.sourceBlockId);

  return (
    <Card 
      id={`motor-block-${index}`}
      role="listitem"
      tabIndex={0}
      onClick={onActivate}
      onFocus={onActivate}
      className={cn(
        'cursor-pointer transition-all',
        'focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2',
        isActive && 'ring-4 ring-primary ring-offset-2 bg-primary/5',
        !isActive && 'hover:bg-muted/50',
        // Large padding for easier touch targets
        'p-6'
      )}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="flex items-start gap-4">
        {/* Large step indicator */}
        <div 
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold',
            isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          )}
          aria-hidden="true"
        >
          {block.stepNumber || index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="mb-2">
            {getTypeLabel(sourceType)}
          </Badge>
          
          <p className={cn(
            'text-lg leading-relaxed',
            sourceType === 'heading' && 'text-xl font-semibold'
          )}>
            {block.simplifiedContent || block.content}
          </p>

          {/* Keywords */}
          {block.keywords && block.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {block.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Large read aloud button */}
        {ttsSupported && isActive && (
          <Button
            size="lg"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onReadAloud();
            }}
            className="h-14 w-14 p-0 touch-target-min flex-shrink-0"
            aria-label="Read this section aloud"
          >
            <Volume2 className="h-6 w-6" aria-hidden="true" />
          </Button>
        )}
      </div>
    </Card>
  );
}

function getSourceType(sourceBlockId: string): string {
  if (sourceBlockId.includes('heading')) return 'heading';
  if (sourceBlockId.includes('definition')) return 'definition';
  if (sourceBlockId.includes('example')) return 'example';
  if (sourceBlockId.includes('step')) return 'step';
  return 'paragraph';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    heading: 'Section',
    definition: 'Definition',
    example: 'Example',
    step: 'Step',
    paragraph: 'Content',
  };
  return labels[type] || 'Content';
}
