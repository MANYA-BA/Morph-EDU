import type { TransformedContent, RenderedBlock } from '@/types/rendering';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LearningRendererProps {
  content: TransformedContent;
}

export function LearningRenderer({ content }: LearningRendererProps) {
  const { layout, renderedBlocks, accessibility } = content;
  
  const containerClasses = cn(
    'space-y-6',
    layout.type === 'cards' && 'grid md:grid-cols-2 gap-4 space-y-0',
    layout.type === 'spatial' && layout.columns === 2 && 'grid md:grid-cols-2 gap-6 space-y-0',
    layout.spacing === 'compact' && 'space-y-3',
    layout.spacing === 'generous' && 'space-y-8'
  );
  
  return (
    <article
      role={accessibility.role}
      aria-label={accessibility.ariaLabel}
      className={containerClasses}
    >
      {renderedBlocks.map((block, index) => (
        <BlockRenderer 
          key={block.id} 
          block={block} 
          layout={layout}
          index={index}
        />
      ))}
    </article>
  );
}

interface BlockRendererProps {
  block: RenderedBlock;
  layout: TransformedContent['layout'];
  index: number;
}

function BlockRenderer({ block, layout, index }: BlockRendererProps) {
  const sourceType = block.sourceBlockId.includes('heading') ? 'heading' : 
                     block.sourceBlockId.includes('definition') ? 'definition' :
                     block.sourceBlockId.includes('example') ? 'example' :
                     block.sourceBlockId.includes('step') ? 'step' : 'paragraph';
  
  // Card layout (ADHD profile)
  if (layout.type === 'cards') {
    return (
      <Card className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
        <CardContent className="p-4">
          {block.stepNumber && (
            <Badge variant="secondary" className="mb-2">
              Step {block.stepNumber}
            </Badge>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {block.simplifiedContent || block.content}
          </div>
          {block.keywords && block.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {block.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Visual hints (Deaf profile)
  const hasVisualHints = block.visualHints && block.visualHints.length > 0;
  const importanceBadge = block.visualHints?.find(h => h.type === 'badge');
  const borderHint = block.visualHints?.find(h => h.type === 'border');
  
  // Linear/default layout
  return (
    <div 
      className={cn(
        'animate-fade-up',
        borderHint && 'border-l-4 border-accent pl-4',
        layout.spacing === 'generous' && 'py-2'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Step number for autism/structured profiles */}
      {block.stepNumber && (
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {block.stepNumber}
          </span>
        </div>
      )}
      
      {/* Importance badge */}
      {importanceBadge && (
        <Badge variant="default" className="mb-2">
          {importanceBadge.value}
        </Badge>
      )}
      
      {/* Main content */}
      <div className={cn(
        'readable-width',
        sourceType === 'heading' && 'text-xl font-semibold',
        sourceType === 'definition' && 'bg-secondary/50 rounded-lg p-4',
        sourceType === 'example' && 'border-l-2 border-muted pl-4 italic'
      )}>
        {block.simplifiedContent || block.content}
      </div>
      
      {/* Keywords for dyslexia profile */}
      {block.keywords && block.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {block.keywords.map((keyword) => (
            <span 
              key={keyword} 
              className="bg-accent/20 text-accent-foreground px-2 py-0.5 rounded text-sm font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
      
      {/* Audio script indicator for blind profile */}
      {block.audioScript && (
        <button 
          className="mt-2 text-sm text-primary hover:underline touch-target-min"
          aria-label={`Read aloud: ${block.content.slice(0, 50)}...`}
        >
          🔊 Read aloud
        </button>
      )}
      
      {/* Spatial description for blind profile */}
      {block.spatialDescription && (
        <p className="mt-2 text-sm text-muted-foreground italic">
          {block.spatialDescription}
        </p>
      )}
    </div>
  );
}
