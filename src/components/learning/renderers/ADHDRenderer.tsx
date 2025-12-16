import { useState } from 'react';
import { ChevronLeft, ChevronRight, Focus, LayoutGrid, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toggle } from '@/components/ui/toggle';
import type { RenderedBlock, TransformedContent } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface ADHDRendererProps {
  content: TransformedContent;
}

export function ADHDRenderer({ content }: ADHDRendererProps) {
  const { renderedBlocks, accessibility } = content;
  const [focusMode, setFocusMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set());

  const progress = (completedBlocks.size / renderedBlocks.length) * 100;

  const handleNext = () => {
    setCompletedBlocks(prev => new Set([...prev, currentIndex]));
    if (currentIndex < renderedBlocks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCardClick = (index: number) => {
    if (!focusMode) {
      setCurrentIndex(index);
      setFocusMode(true);
    }
  };

  const markComplete = () => {
    setCompletedBlocks(prev => new Set([...prev, currentIndex]));
  };

  return (
    <div 
      role="article" 
      aria-label={accessibility.ariaLabel}
      className="space-y-6"
    >
      {/* Progress and controls bar */}
      <Card className="sticky top-4 z-10 bg-background/95 backdrop-blur">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Toggle
                pressed={focusMode}
                onPressedChange={setFocusMode}
                aria-label={focusMode ? 'Switch to overview mode' : 'Switch to focus mode'}
                className="gap-2"
              >
                {focusMode ? (
                  <>
                    <Focus className="h-4 w-4" aria-hidden="true" />
                    Focus Mode
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                    Overview
                  </>
                )}
              </Toggle>
            </div>

            <div className="text-sm font-medium">
              {completedBlocks.size} / {renderedBlocks.length} complete
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-3" aria-label={`Progress: ${Math.round(progress)}%`} />

          {/* Progress dots */}
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {renderedBlocks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  index === currentIndex && 'ring-2 ring-primary ring-offset-2',
                  completedBlocks.has(index) 
                    ? 'bg-green-500' 
                    : index === currentIndex 
                      ? 'bg-primary' 
                      : 'bg-muted'
                )}
                aria-label={`Go to card ${index + 1}${completedBlocks.has(index) ? ' (completed)' : ''}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Focus mode - single card view */}
      {focusMode ? (
        <div className="space-y-4">
          <ADHDCard
            block={renderedBlocks[currentIndex]}
            index={currentIndex}
            total={renderedBlocks.length}
            isComplete={completedBlocks.has(currentIndex)}
            isFocused={true}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="gap-2 touch-target-min"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>

            <Button
              variant={completedBlocks.has(currentIndex) ? 'outline' : 'secondary'}
              onClick={markComplete}
              className="gap-2"
            >
              {completedBlocks.has(currentIndex) ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                  Done
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" aria-hidden="true" />
                  Mark Done
                </>
              )}
            </Button>

            <Button
              variant="default"
              onClick={handleNext}
              disabled={currentIndex === renderedBlocks.length - 1}
              className="gap-2 touch-target-min"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        /* Overview mode - card grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderedBlocks.map((block, index) => (
            <button
              key={block.id}
              onClick={() => handleCardClick(index)}
              className="text-left w-full"
            >
              <ADHDCard
                block={block}
                index={index}
                total={renderedBlocks.length}
                isComplete={completedBlocks.has(index)}
                isFocused={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Completion celebration */}
      {completedBlocks.size === renderedBlocks.length && (
        <Card className="bg-green-500/10 border-green-500/30 animate-fade-up">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-xl font-semibold mb-2">All Done!</h3>
            <p className="text-muted-foreground">You've completed all {renderedBlocks.length} cards.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ADHDCardProps {
  block: RenderedBlock;
  index: number;
  total: number;
  isComplete: boolean;
  isFocused: boolean;
}

function ADHDCard({ block, index, total, isComplete, isFocused }: ADHDCardProps) {
  const content = block.simplifiedContent || block.content;
  // Keep content short for ADHD - max 150 chars in overview, full in focus
  const displayContent = isFocused ? content : content.slice(0, 150) + (content.length > 150 ? '...' : '');

  return (
    <Card 
      className={cn(
        'transition-all h-full',
        isFocused && 'shadow-lg border-primary',
        isComplete && 'opacity-75',
        !isFocused && 'hover:shadow-md hover:border-primary/50 cursor-pointer'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant={isComplete ? 'default' : 'secondary'} className="gap-1">
            {isComplete && <CheckCircle className="h-3 w-3" aria-hidden="true" />}
            {index + 1} / {total}
          </Badge>
          
          {block.keywords && block.keywords.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {block.keywords[0]}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className={cn(
          'leading-relaxed',
          isFocused ? 'text-lg' : 'text-sm'
        )}>
          {displayContent}
        </p>

        {/* Action keywords in focus mode */}
        {isFocused && block.keywords && block.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {block.keywords.map((keyword) => (
              <Badge key={keyword} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
