import type {
  ProfileId,
  ComposedProfile,
  LayoutRule,
  ContentTransformRule,
  InteractionRule,
} from '@/types/accessibility';
import { PROFILE_MODIFIERS } from './definitions';

// ============================================
// PROFILE COMPOSITION ENGINE
// ============================================

function mergeRules<T extends { priority: number }>(
  rulesArrays: T[][],
  dedupeKey: (rule: T) => string
): T[] {
  const ruleMap = new Map<string, T>();

  for (const rules of rulesArrays) {
    for (const rule of rules) {
      const key = dedupeKey(rule);
      const existing = ruleMap.get(key);
      if (!existing || rule.priority > existing.priority) {
        ruleMap.set(key, rule);
      }
    }
  }

  return Array.from(ruleMap.values()).sort((a, b) => b.priority - a.priority);
}

export function composeProfiles(profiles: ProfileId[]): ComposedProfile {
  if (profiles.length === 0) {
    return {
      activeProfiles: [],
      mergedLayoutRules: [],
      mergedContentRules: [],
      mergedInteractionRules: [],
    };
  }

  // Sort profiles by weight (highest first)
  const sortedProfiles = [...profiles].sort((a, b) => {
    const weightA = PROFILE_MODIFIERS[a]?.weight ?? 0;
    const weightB = PROFILE_MODIFIERS[b]?.weight ?? 0;
    return weightB - weightA;
  });

  const modifiers = sortedProfiles.map((id) => PROFILE_MODIFIERS[id]).filter(Boolean);

  // Merge layout rules (dedupe by property)
  const mergedLayoutRules = mergeRules<LayoutRule>(
    modifiers.map((m) => m.layoutRules),
    (rule) => rule.property
  );

  // Merge content rules (dedupe by type)
  const mergedContentRules = mergeRules<ContentTransformRule>(
    modifiers.map((m) => m.contentRules),
    (rule) => rule.type
  );

  // Merge interaction rules (dedupe by type)
  const mergedInteractionRules = mergeRules<InteractionRule>(
    modifiers.map((m) => m.interactionRules),
    (rule) => rule.type
  );

  return {
    activeProfiles: sortedProfiles,
    mergedLayoutRules,
    mergedContentRules,
    mergedInteractionRules,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getLayoutValue(
  composed: ComposedProfile,
  property: string,
  defaultValue: string
): string {
  const rule = composed.mergedLayoutRules.find((r) => r.property === property);
  return rule?.value ?? defaultValue;
}

export function hasContentRule(
  composed: ComposedProfile,
  type: ContentTransformRule['type']
): boolean {
  return composed.mergedContentRules.some((r) => r.type === type);
}

export function getContentRuleParams<T extends Record<string, unknown>>(
  composed: ComposedProfile,
  type: ContentTransformRule['type']
): T | null {
  const rule = composed.mergedContentRules.find((r) => r.type === type);
  return rule ? (rule.params as T) : null;
}

export function hasInteractionRule(
  composed: ComposedProfile,
  type: InteractionRule['type']
): boolean {
  return composed.mergedInteractionRules.some((r) => r.type === type);
}
