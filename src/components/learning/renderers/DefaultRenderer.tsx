import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RenderedBlock, TransformedContent } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface DefaultRendererProps {
  content: TransformedContent;
}

export function DefaultRenderer({ content }: DefaultRendererProps) {
  const { renderedBlocks, accessibility, layout } = content;

  return (
    <article
      role={accessibility.role}
      aria-label={accessibility.ariaLabel}
      className={cn(
        'space-y-6',
        layout.spacing === 'compact' && 'space-y-3',
        layout.spacing === 'generous' && 'space-y-8'
      )}
    >
      {renderedBlocks.map((block, index) => (
        <DefaultBlock
          key={block.id}
          block={block}
          index={index}
        />
      ))}
    </article>
  );
}

interface DefaultBlockProps {
  block: RenderedBlock;
  index: number;
}

function DefaultBlock({ block, index }: DefaultBlockProps) {
  const sourceType = getSourceType(block.sourceBlockId);

  return (
    <div 
      className={cn(
        'animate-fade-up',
        'readable-width'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {block.stepNumber && (
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {block.stepNumber}
          </span>
        </div>
      )}

      <div className={cn(
        sourceType === 'heading' && 'text-xl font-semibold',
        sourceType === 'definition' && 'bg-secondary/50 rounded-lg p-4',
        sourceType === 'example' && 'border-l-2 border-muted pl-4 italic'
      )}>
        {block.simplifiedContent || block.content}
      </div>

      {block.keywords && block.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {block.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function getSourceType(sourceBlockId: string): string {
  if (sourceBlockId.includes('heading')) return 'heading';
  if (sourceBlockId.includes('definition')) return 'definition';
  if (sourceBlockId.includes('example')) return 'example';
  if (sourceBlockId.includes('step')) return 'step';
  return 'paragraph';
}
