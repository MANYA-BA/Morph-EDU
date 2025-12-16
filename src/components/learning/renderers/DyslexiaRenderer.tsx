import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RenderedBlock, TransformedContent } from '@/types/rendering';
import { cn } from '@/lib/utils';

interface DyslexiaRendererProps {
  content: TransformedContent;
}

export function DyslexiaRenderer({ content }: DyslexiaRendererProps) {
  const { renderedBlocks, accessibility } = content;

  return (
    <div 
      role="article" 
      aria-label={accessibility.ariaLabel}
      className="space-y-8 font-dyslexic"
    >
      {renderedBlocks.map((block, index) => (
        <DyslexiaBlock
          key={block.id}
          block={block}
          index={index}
        />
      ))}
    </div>
  );
}

interface DyslexiaBlockProps {
  block: RenderedBlock;
  index: number;
}

function DyslexiaBlock({ block, index }: DyslexiaBlockProps) {
  const sourceType = getSourceType(block.sourceBlockId);
  const content = block.simplifiedContent || block.content;
  
  // Chunk content into smaller pieces for easier reading
  const chunks = chunkText(content, 50);

  return (
    <div 
      className={cn(
        'animate-fade-up',
        'readable-width' // Uses CSS class for max line length
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Keywords first for context */}
      {block.keywords && block.keywords.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="sr-only">Key words: </span>
          {block.keywords.map((keyword) => (
            <Badge 
              key={keyword} 
              className="text-base px-3 py-1 bg-accent/30 text-accent-foreground font-medium"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      )}

      {/* Chunked content */}
      <Card className={cn(
        'overflow-hidden',
        sourceType === 'definition' && 'bg-primary/5 border-l-4 border-l-primary',
        sourceType === 'example' && 'bg-accent/5 border-l-4 border-l-accent'
      )}>
        <CardContent className="p-6">
          {/* Step number */}
          {block.stepNumber && (
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {block.stepNumber}
              </span>
            </div>
          )}

          {/* Type label for definitions and examples */}
          {(sourceType === 'definition' || sourceType === 'example') && (
            <div className="mb-3">
              <Badge variant="outline" className="text-sm uppercase tracking-wider">
                {sourceType}
              </Badge>
            </div>
          )}

          {/* Chunked text with generous spacing */}
          <div className={cn(
            'space-y-4',
            sourceType === 'heading' && 'text-2xl font-semibold'
          )}>
            {chunks.map((chunk, chunkIndex) => (
              <p 
                key={chunkIndex}
                className={cn(
                  'text-lg leading-loose tracking-wide',
                  // Alternating background for chunks helps track reading position
                  chunkIndex % 2 === 0 ? 'bg-transparent' : 'bg-muted/30 -mx-2 px-2 py-1 rounded'
                )}
              >
                {highlightKeywords(chunk, block.keywords || [])}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
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

// Split text into chunks of approximately maxWords
function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  
  return chunks;
}

// Highlight keywords in text
function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (keywords.length === 0) return text;
  
  // Create regex pattern for all keywords
  const pattern = new RegExp(`\\b(${keywords.map(k => escapeRegExp(k)).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);
  
  return parts.map((part, index) => {
    const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
    if (isKeyword) {
      return (
        <mark 
          key={index} 
          className="bg-accent/40 text-accent-foreground px-1 rounded font-medium"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
