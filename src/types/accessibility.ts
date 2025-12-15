// ============================================
// ACCESSIBILITY PROFILE SYSTEM
// ============================================

export type ProfileId =
  | 'blind'
  | 'deaf'
  | 'dyslexia'
  | 'autism'
  | 'adhd'
  | 'motor';

export interface ProfileInfo {
  id: ProfileId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================
// COMPOSABLE PROFILE RULES
// ============================================

export interface LayoutRule {
  property: string;
  value: string;
  priority: number;
}

export interface ContentTransformRule {
  type: 'simplify' | 'chunk' | 'highlight' | 'narrate' | 'number' | 'visualize';
  params: Record<string, unknown>;
  priority: number;
}

export interface InteractionRule {
  type: 'keyboard' | 'voice' | 'touch' | 'focus' | 'timing';
  config: Record<string, unknown>;
  priority: number;
}

export interface ProfileModifier {
  id: ProfileId;
  weight: number;
  layoutRules: LayoutRule[];
  contentRules: ContentTransformRule[];
  interactionRules: InteractionRule[];
}

export interface ComposedProfile {
  activeProfiles: ProfileId[];
  mergedLayoutRules: LayoutRule[];
  mergedContentRules: ContentTransformRule[];
  mergedInteractionRules: InteractionRule[];
}

// ============================================
// USER PREFERENCES
// ============================================

export interface AccessibilityPreferences {
  activeProfiles: ProfileId[];
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'default' | 'dyslexic' | 'mono';
  contrast: 'normal' | 'high' | 'ultra';
  reducedMotion: boolean;
  focusIndicators: boolean;
  voiceControl: boolean;
  autoRead: boolean;
  pacing: 'slow' | 'normal' | 'fast';
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  activeProfiles: [],
  fontSize: 'medium',
  fontFamily: 'default',
  contrast: 'normal',
  reducedMotion: false,
  focusIndicators: true,
  voiceControl: false,
  autoRead: false,
  pacing: 'normal',
};
