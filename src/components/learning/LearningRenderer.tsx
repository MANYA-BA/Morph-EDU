import type { TransformedContent } from '@/types/rendering';
import type { ProfileId } from '@/types/accessibility';
import { BlindRenderer } from './renderers/BlindRenderer';
import { DeafRenderer } from './renderers/DeafRenderer';
import { DyslexiaRenderer } from './renderers/DyslexiaRenderer';
import { AutismRenderer } from './renderers/AutismRenderer';
import { ADHDRenderer } from './renderers/ADHDRenderer';
import { MotorRenderer } from './renderers/MotorRenderer';
import { DefaultRenderer } from './renderers/DefaultRenderer';
import { ProfileError } from './ProfileErrorBoundary';

interface LearningRendererProps {
  content: TransformedContent;
}

// Map profiles to their renderers
const PROFILE_RENDERERS: Record<ProfileId, React.ComponentType<{ content: TransformedContent }>> = {
  blind: BlindRenderer,
  deaf: DeafRenderer,
  dyslexia: DyslexiaRenderer,
  autism: AutismRenderer,
  adhd: ADHDRenderer,
  motor: MotorRenderer,
};

export function LearningRenderer({ content }: LearningRendererProps) {
  const { activeProfiles, renderedBlocks } = content;

  // Validation: ensure we have content to render
  if (!renderedBlocks || renderedBlocks.length === 0) {
    return (
      <ProfileError
        type="missing"
        feature="Content"
        message="No content blocks available to render."
        suggestion="Try uploading content again."
      />
    );
  }

  // No profiles selected - use default renderer
  if (activeProfiles.length === 0) {
    return <DefaultRenderer content={content} />;
  }

  // Get the primary profile (highest priority - first in sorted list)
  const primaryProfile = activeProfiles[0];
  const Renderer = PROFILE_RENDERERS[primaryProfile];

  if (!Renderer) {
    return (
      <ProfileError
        type="missing"
        feature={`${primaryProfile} Renderer`}
        message={`No renderer found for profile: ${primaryProfile}`}
        suggestion="This profile may not be fully implemented yet."
      />
    );
  }

  // Render with profile-specific renderer
  return <Renderer content={content} />;
}
