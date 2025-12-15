import type { NormalizedContent, SemanticBlock } from '@/types/content';
import type { ProfileId, ComposedProfile } from '@/types/accessibility';
import type { TransformedContent, RenderedBlock, VisualHint } from '@/types/rendering';
import { composeProfiles, getLayoutValue, hasContentRule, getContentRuleParams } from '@/lib/profiles/composer';

// ============================================\
// CONTENT TRANSFORMER
// ============================================\

function transformBlockForProfile(
  block: SemanticBlock,
  profile: ProfileId,
  composed: ComposedProfile
): Partial<RenderedBlock> {
  const additions: Partial<RenderedBlock> = {};
  
  switch (profile) {
    case 'blind':
      // Generate audio script with spatial descriptions
      additions.audioScript = generateAudioScript(block);
      additions.spatialDescription = generateSpatialDescription(block);
      break;
      
    case 'deaf':
      // Add visual hints and icons
      additions.visualHints = generateVisualHints(block);
      break;
      
    case 'dyslexia':
      // Simplify and highlight
      additions.simplifiedContent = simplifyContent(block.content);
      additions.keywords = block.metadata.keywords;
      break;
      
    case 'autism':
      // Number steps and remove figurative language
      if (block.type === 'step' || block.type === 'paragraph') {
        additions.simplifiedContent = removeFigurativeLanguage(block.content);
      }
      break;
      
    case 'adhd':
      // Keep it short and actionable
      additions.simplifiedContent = block.content.slice(0, 150);
      additions.keywords = block.metadata.keywords.slice(0, 3);
      break;
      
    case 'motor':
      // No content changes, just interaction changes handled at render level
      break;
  }
  
  return additions;
}

function generateAudioScript(block: SemanticBlock): string {
  const typeIntro: Record<string, string> = {
    heading: 'Section heading: ',
    paragraph: '',
    definition: 'Definition: ',
    example: 'Here is an example: ',
    step: 'Step: ',
    list: 'List item: ',
    quote: 'Quote: ',
    code: 'Code sample: ',
    image: 'Image description: ',
  };
  
  return `${typeIntro[block.type] || ''}${block.content}`;
}

function generateSpatialDescription(block: SemanticBlock): string {
  if (block.type === 'image') {
    return `Visual element: ${block.content}. Imagine it positioned in the center of your mental space.`;
  }
  return '';
}

function generateVisualHints(block: SemanticBlock): VisualHint[] {
  const hints: VisualHint[] = [];
  
  if (block.metadata.importance === 'critical') {
    hints.push({ type: 'badge', value: 'Important', position: 'start' });
  }
  
  if (block.type === 'definition') {
    hints.push({ type: 'icon', value: 'book', position: 'start' });
  }
  
  if (block.type === 'example') {
    hints.push({ type: 'border', value: 'accent', position: 'inline' });
  }
  
  return hints;
}

function simplifyContent(content: string): string {
  // Simple sentence shortening - in production, use AI
  return content
    .replace(/\b(furthermore|moreover|consequently|nevertheless|however)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeFigurativeLanguage(content: string): string {
  // Remove common metaphors and idioms - in production, use AI
  return content
    .replace(/like a .+?(?=[,.])/gi, '')
    .replace(/as if .+?(?=[,.])/gi, '')
    .trim();
}

// ============================================\
// MAIN TRANSFORM FUNCTION
// ============================================\

export async function transformContent(
  content: NormalizedContent,
  profiles: ProfileId[]
): Promise<TransformedContent> {
  const composed = composeProfiles(profiles);
  
  // Determine primary profile for variant tagging
  const primaryProfile = composed.activeProfiles[0] || 'default';
  
  // Transform each block
  const renderedBlocks: RenderedBlock[] = content.blocks.map((block, index) => {
    const baseBlock: RenderedBlock = {
      id: `rendered_${block.id}`,
      sourceBlockId: block.id,
      variant: primaryProfile === 'default' ? 'default' : primaryProfile,
      content: block.content,
    };
    
    // Apply profile-specific transformations
    for (const profileId of composed.activeProfiles) {
      const additions = transformBlockForProfile(block, profileId, composed);
      Object.assign(baseBlock, additions);
    }
    
    // Add step numbers for autism/adhd profiles
    if (hasContentRule(composed, 'number')) {
      baseBlock.stepNumber = index + 1;
    }
    
    return baseBlock;
  });
  
  // Determine layout
  const layoutType = getLayoutValue(composed, 'layout', 'linear') as TransformedContent['layout']['type'];
  const spacing = getLayoutValue(composed, 'spacing', 'normal') as TransformedContent['layout']['spacing'];
  
  return {
    source: content,
    activeProfiles: composed.activeProfiles,
    renderedBlocks,
    accessibility: {
      role: 'article',
      ariaLabel: `Learning content: ${content.title}`,
    },
    layout: {
      type: layoutType,
      spacing,
      columns: layoutType === 'spatial' ? 2 : undefined,
    },
    timing: {
      autoAdvance: hasContentRule(composed, 'chunk'),
      pauseOnInteraction: true,
    },
  };
}
