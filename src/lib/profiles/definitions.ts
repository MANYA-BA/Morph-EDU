import type { ProfileId, ProfileInfo, ProfileModifier } from '@/types/accessibility';

// ============================================
// PROFILE DEFINITIONS
// ============================================

export const PROFILE_INFO: Record<ProfileId, ProfileInfo> = {
  blind: {
    id: 'blind',
    name: 'Blind / Low Vision',
    description: 'Audio-first experience with spatial descriptions and screen-reader optimization',
    icon: 'Eye',
    color: 'hsl(270, 70%, 60%)',
  },
  deaf: {
    id: 'deaf',
    name: 'Deaf / Hard of Hearing',
    description: 'Visual-first layouts with subtitles and no audio dependencies',
    icon: 'Ear',
    color: 'hsl(210, 70%, 60%)',
  },
  dyslexia: {
    id: 'dyslexia',
    name: 'Dyslexia',
    description: 'OpenDyslexic font, chunked content, and highlighted keywords',
    icon: 'Type',
    color: 'hsl(150, 70%, 45%)',
  },
  autism: {
    id: 'autism',
    name: 'Autism Spectrum',
    description: 'Predictable layouts, literal explanations, and low-stimulus design',
    icon: 'Brain',
    color: 'hsl(45, 70%, 55%)',
  },
  adhd: {
    id: 'adhd',
    name: 'ADHD',
    description: 'Micro-learning cards, progress timelines, and focus mode',
    icon: 'Zap',
    color: 'hsl(0, 70%, 60%)',
  },
  motor: {
    id: 'motor',
    name: 'Motor Disabilities',
    description: 'Voice control, large touch targets, and keyboard-first navigation',
    icon: 'Hand',
    color: 'hsl(180, 50%, 45%)',
  },
};

// ============================================
// PROFILE MODIFIERS
// ============================================

export const PROFILE_MODIFIERS: Record<ProfileId, ProfileModifier> = {
  blind: {
    id: 'blind',
    weight: 100,
    layoutRules: [
      { property: 'layout', value: 'linear', priority: 100 },
      { property: 'spacing', value: 'generous', priority: 90 },
    ],
    contentRules: [
      { type: 'narrate', params: { includeDescriptions: true }, priority: 100 },
      { type: 'simplify', params: { targetGrade: 8 }, priority: 80 },
    ],
    interactionRules: [
      { type: 'keyboard', config: { enhanced: true }, priority: 100 },
      { type: 'focus', config: { announceOnFocus: true }, priority: 100 },
    ],
  },
  deaf: {
    id: 'deaf',
    weight: 90,
    layoutRules: [
      { property: 'layout', value: 'spatial', priority: 90 },
      { property: 'columns', value: '2', priority: 80 },
    ],
    contentRules: [
      { type: 'visualize', params: { addIcons: true }, priority: 100 },
      { type: 'highlight', params: { keyTerms: true }, priority: 85 },
    ],
    interactionRules: [
      { type: 'focus', config: { visualFeedback: 'strong' }, priority: 90 },
    ],
  },
  dyslexia: {
    id: 'dyslexia',
    weight: 85,
    layoutRules: [
      { property: 'layout', value: 'linear', priority: 85 },
      { property: 'lineLength', value: 'short', priority: 90 },
    ],
    contentRules: [
      { type: 'chunk', params: { maxWords: 50 }, priority: 95 },
      { type: 'highlight', params: { keywords: true }, priority: 90 },
      { type: 'simplify', params: { targetGrade: 6 }, priority: 85 },
    ],
    interactionRules: [
      { type: 'timing', config: { extendedTime: true }, priority: 80 },
    ],
  },
  autism: {
    id: 'autism',
    weight: 80,
    layoutRules: [
      { property: 'layout', value: 'linear', priority: 95 },
      { property: 'spacing', value: 'generous', priority: 85 },
      { property: 'animation', value: 'none', priority: 100 },
    ],
    contentRules: [
      { type: 'number', params: { allSteps: true }, priority: 100 },
      { type: 'simplify', params: { removeFigurativeLanguage: true }, priority: 90 },
    ],
    interactionRules: [
      { type: 'timing', config: { predictable: true }, priority: 95 },
    ],
  },
  adhd: {
    id: 'adhd',
    weight: 75,
    layoutRules: [
      { property: 'layout', value: 'cards', priority: 90 },
      { property: 'spacing', value: 'compact', priority: 70 },
    ],
    contentRules: [
      { type: 'chunk', params: { maxWords: 30, asCards: true }, priority: 100 },
      { type: 'highlight', params: { actionItems: true }, priority: 85 },
    ],
    interactionRules: [
      { type: 'timing', config: { progressVisible: true, gamified: true }, priority: 90 },
      { type: 'focus', config: { singleTask: true }, priority: 95 },
    ],
  },
  motor: {
    id: 'motor',
    weight: 95,
    layoutRules: [
      { property: 'touchTargets', value: 'large', priority: 100 },
      { property: 'spacing', value: 'generous', priority: 95 },
    ],
    contentRules: [],
    interactionRules: [
      { type: 'keyboard', config: { fullNavigation: true }, priority: 100 },
      { type: 'voice', config: { enabled: true }, priority: 95 },
      { type: 'touch', config: { largeTargets: true, minSize: 48 }, priority: 100 },
    ],
  },
};
