import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ProfileId, AccessibilityPreferences, ComposedProfile } from '@/types/accessibility';
import { DEFAULT_PREFERENCES } from '@/types/accessibility';
import { composeProfiles } from '@/lib/profiles/composer';

// ============================================
// CONTEXT TYPE
// ============================================

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  composedProfile: ComposedProfile;
  
  // Profile management
  toggleProfile: (profileId: ProfileId) => void;
  setProfiles: (profiles: ProfileId[]) => void;
  clearProfiles: () => void;
  hasProfile: (profileId: ProfileId) => boolean;
  
  // Preference setters
  setFontSize: (size: AccessibilityPreferences['fontSize']) => void;
  setFontFamily: (family: AccessibilityPreferences['fontFamily']) => void;
  setContrast: (contrast: AccessibilityPreferences['contrast']) => void;
  setReducedMotion: (reduced: boolean) => void;
  setPacing: (pacing: AccessibilityPreferences['pacing']) => void;
  
  // Reset
  resetPreferences: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = 'morphedu_accessibility_preferences';

// ============================================
// PROVIDER
// ============================================

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load accessibility preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  });
  
  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save accessibility preferences:', e);
    }
  }, [preferences]);
  
  // Apply preferences to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('text-scale-small', 'text-scale-medium', 'text-scale-large', 'text-scale-xlarge');
    root.classList.add(`text-scale-${preferences.fontSize}`);
    
    // Font family
    root.classList.remove('font-dyslexic', 'font-mono-accessible');
    if (preferences.fontFamily === 'dyslexic') {
      root.classList.add('font-dyslexic');
    } else if (preferences.fontFamily === 'mono') {
      root.classList.add('font-mono-accessible');
    }
    
    // Contrast
    root.classList.remove('high-contrast');
    if (preferences.contrast === 'high' || preferences.contrast === 'ultra') {
      root.classList.add('high-contrast');
    }
    
    // Reduced motion
    root.classList.toggle('reduce-motion', preferences.reducedMotion);
  }, [preferences]);
  
  // Compute composed profile
  const composedProfile = useMemo(
    () => composeProfiles(preferences.activeProfiles),
    [preferences.activeProfiles]
  );
  
  // Profile management
  const toggleProfile = useCallback((profileId: ProfileId) => {
    setPreferences((prev) => {
      const isActive = prev.activeProfiles.includes(profileId);
      return {
        ...prev,
        activeProfiles: isActive
          ? prev.activeProfiles.filter((id) => id !== profileId)
          : [...prev.activeProfiles, profileId],
      };
    });
  }, []);
  
  const setProfiles = useCallback((profiles: ProfileId[]) => {
    setPreferences((prev) => ({ ...prev, activeProfiles: profiles }));
  }, []);
  
  const clearProfiles = useCallback(() => {
    setPreferences((prev) => ({ ...prev, activeProfiles: [] }));
  }, []);
  
  const hasProfile = useCallback(
    (profileId: ProfileId) => preferences.activeProfiles.includes(profileId),
    [preferences.activeProfiles]
  );
  
  // Preference setters
  const setFontSize = useCallback((fontSize: AccessibilityPreferences['fontSize']) => {
    setPreferences((prev) => ({ ...prev, fontSize }));
  }, []);
  
  const setFontFamily = useCallback((fontFamily: AccessibilityPreferences['fontFamily']) => {
    setPreferences((prev) => ({ ...prev, fontFamily }));
  }, []);
  
  const setContrast = useCallback((contrast: AccessibilityPreferences['contrast']) => {
    setPreferences((prev) => ({ ...prev, contrast }));
  }, []);
  
  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    setPreferences((prev) => ({ ...prev, reducedMotion }));
  }, []);
  
  const setPacing = useCallback((pacing: AccessibilityPreferences['pacing']) => {
    setPreferences((prev) => ({ ...prev, pacing }));
  }, []);
  
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);
  
  const value: AccessibilityContextType = {
    preferences,
    composedProfile,
    toggleProfile,
    setProfiles,
    clearProfiles,
    hasProfile,
    setFontSize,
    setFontFamily,
    setContrast,
    setReducedMotion,
    setPacing,
    resetPreferences,
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
