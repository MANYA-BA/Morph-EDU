import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle } from 'lucide-react';
import type { RenderedBlock, TransformedContent } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface AutismRendererProps {
  content: TransformedContent;
}

export function AutismRenderer({ content }: AutismRendererProps) {
  const { renderedBlocks, accessibility, source } = content;

  return (
    <div 
      role="article" 
      aria-label={accessibility.ariaLabel}
      className="space-y-6"
    >
      {/* Predictable structure overview */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Content Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            <p className="mb-2">This content has <strong>{renderedBlocks.length}</strong> sections.</p>
            <p>You will read them one at a time, in order from 1 to {renderedBlocks.length}.</p>
          </div>
          
          {/* Visual progress indicator */}
          <div className="mt-4 flex flex-wrap gap-2">
            {renderedBlocks.map((_, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium"
                aria-hidden="true"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content blocks with strict numbering */}
      <div className="space-y-6">
        {renderedBlocks.map((block, index) => (
          <AutismBlock
            key={block.id}
            block={block}
            index={index}
            total={renderedBlocks.length}
          />
        ))}
      </div>

      {/* End marker */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" aria-hidden="true" />
            <p className="text-lg font-medium">End of content. You have finished reading all {renderedBlocks.length} sections.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AutismBlockProps {
  block: RenderedBlock;
  index: number;
  total: number;
}

function AutismBlock({ block, index, total }: AutismBlockProps) {
  const sourceType = getSourceType(block.sourceBlockId);
  const content = block.simplifiedContent || block.content;
  const stepNumber = block.stepNumber || index + 1;

  return (
    <Card 
      id={block.id}
      className="overflow-hidden"
      // No animations - predictable UI
    >
      <CardHeader className="pb-2">
        {/* Clear position indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span 
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold"
              aria-label={`Section ${stepNumber}`}
            >
              {stepNumber}
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Section {stepNumber} of {total}
              </p>
              <Badge variant="outline" className="mt-1">
                {getTypeLabel(sourceType)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        {/* Literal, clear content */}
        <div className={cn(
          'text-lg leading-relaxed',
          sourceType === 'heading' && 'text-xl font-semibold'
        )}>
          {content}
        </div>

        {/* Keywords listed clearly */}
        {block.keywords && block.keywords.length > 0 && (
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Important words in this section:
            </p>
            <ul className="space-y-1">
              {block.keywords.map((keyword) => (
                <li key={keyword} className="flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-current text-primary" aria-hidden="true" />
                  <span className="font-medium">{keyword}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What to expect next */}
        {index < total - 1 && (
          <div className="mt-6 pt-4 border-t border-dashed">
            <p className="text-sm text-muted-foreground">
              Next: Section {stepNumber + 1} of {total}
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
  return 'paragraph';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    heading: 'Title',
    definition: 'What something means',
    example: 'An example',
    step: 'A step to follow',
    paragraph: 'Information',
  };
  return labels[type] || 'Information';
}
