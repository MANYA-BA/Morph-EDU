import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ProfileId } from '@/types/accessibility';

interface ProfileErrorProps {
  type: 'unsupported' | 'missing' | 'fallback' | 'info';
  feature: string;
  profile?: ProfileId;
  message?: string;
  suggestion?: string;
}

export function ProfileError({ type, feature, profile, message, suggestion }: ProfileErrorProps) {
  const isInfo = type === 'info';
  
  return (
    <Alert 
      variant={isInfo ? 'default' : 'destructive'} 
      className="mb-4"
      role="alert"
      aria-live="polite"
    >
      {isInfo ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>
        {type === 'unsupported' && `${feature} Not Supported`}
        {type === 'missing' && `Missing ${feature}`}
        {type === 'fallback' && `${feature} Fallback Active`}
        {type === 'info' && feature}
      </AlertTitle>
      <AlertDescription>
        {message || `The ${feature.toLowerCase()} feature is not available for ${profile || 'this profile'}.`}
        {suggestion && <span className="block mt-1 text-sm">{suggestion}</span>}
      </AlertDescription>
    </Alert>
  );
}

interface FeatureGateProps {
  isSupported: boolean;
  featureName: string;
  fallbackMessage: string;
  children: React.ReactNode;
}

export function FeatureGate({ isSupported, featureName, fallbackMessage, children }: FeatureGateProps) {
  if (!isSupported) {
    return (
      <ProfileError
        type="unsupported"
        feature={featureName}
        message={fallbackMessage}
        suggestion="Try using a different browser or device."
      />
    );
  }
  
  return <>{children}</>;
}
