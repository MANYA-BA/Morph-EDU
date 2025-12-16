import { Eye, AlertTriangle, BookOpen, Lightbulb, List, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileError } from '../ProfileErrorBoundary';
import type { RenderedBlock, TransformedContent, VisualHint } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface DeafRendererProps {
  content: TransformedContent;
}

export function DeafRenderer({ content }: DeafRendererProps) {
  const { renderedBlocks, accessibility, layout } = content;

  return (
    <div 
      role="article" 
      aria-label={accessibility.ariaLabel}
      className="space-y-6"
    >
      {/* Visual-first notice */}
      <ProfileError
        type="info"
        feature="Visual-First Mode Active"
        message="All content is presented visually. Audio features are disabled. Text alternatives are provided for all media."
      />

      {/* Two-column spatial layout for deaf profile */}
      <div className={cn(
        'grid gap-6',
        layout.columns === 2 ? 'md:grid-cols-2' : 'grid-cols-1'
      )}>
        {renderedBlocks.map((block, index) => (
          <DeafBlock
            key={block.id}
            block={block}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface DeafBlockProps {
  block: RenderedBlock;
  index: number;
}

function DeafBlock({ block, index }: DeafBlockProps) {
  const sourceType = getSourceType(block.sourceBlockId);
  const IconComponent = getIconForType(sourceType);
  const importanceBadge = block.visualHints?.find(h => h.type === 'badge');
  const borderHint = block.visualHints?.find(h => h.type === 'border');
  const iconHint = block.visualHints?.find(h => h.type === 'icon');

  return (
    <Card 
      className={cn(
        'overflow-hidden animate-fade-up transition-all hover:shadow-lg',
        borderHint && 'border-l-4 border-l-accent',
        sourceType === 'definition' && 'bg-primary/5',
        sourceType === 'example' && 'bg-accent/5'
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardContent className="p-5">
        {/* Header with icon and type indicator */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            sourceType === 'heading' && 'bg-primary/20 text-primary',
            sourceType === 'definition' && 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
            sourceType === 'example' && 'bg-green-500/20 text-green-600 dark:text-green-400',
            sourceType === 'step' && 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
            sourceType === 'paragraph' && 'bg-muted text-muted-foreground'
          )}>
            <IconComponent className="h-5 w-5" aria-hidden="true" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {getTypeLabel(sourceType)}
              </span>
              {importanceBadge && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {importanceBadge.value}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Step number if present */}
        {block.stepNumber && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <span className="sr-only">Step </span>
              {block.stepNumber}
            </Badge>
          </div>
        )}

        {/* Main content with enhanced visibility */}
        <div className={cn(
          'text-lg leading-relaxed',
          sourceType === 'heading' && 'text-xl font-semibold'
        )}>
          {block.simplifiedContent || block.content}
        </div>

        {/* Keywords as visual badges */}
        {block.keywords && block.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="sr-only">Key terms: </span>
            {block.keywords.map((keyword) => (
              <Badge 
                key={keyword} 
                variant="outline" 
                className="text-sm font-medium bg-background"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {/* Visual indicator for content with audio script (shows it's been processed) */}
        {block.audioScript && (
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span>Text alternative available</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getSourceType(sourceBlockId: string): string {
  if (sourceBlockId.includes('heading')) return 'heading';
  if (sourceBlockId.includes('definition')) return 'definition';
  if (sourceBlockId.includes('example')) return 'example';
  if (sourceBlockId.includes('step')) return 'step';
  if (sourceBlockId.includes('list')) return 'list';
  return 'paragraph';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    heading: 'Section',
    definition: 'Definition',
    example: 'Example',
    step: 'Step',
    list: 'List',
    paragraph: 'Content',
  };
  return labels[type] || 'Content';
}

function getIconForType(type: string) {
  const icons: Record<string, typeof Eye> = {
    heading: Eye,
    definition: BookOpen,
    example: Lightbulb,
    step: CheckCircle,
    list: List,
    paragraph: Eye,
  };
  return icons[type] || Eye;
}
