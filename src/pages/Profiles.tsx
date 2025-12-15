import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useContent } from '@/contexts/ContentContext';
import { PROFILE_INFO } from '@/lib/profiles/definitions';
import type { ProfileId } from '@/types/accessibility';

export default function Profiles() {
  const navigate = useNavigate();
  const { preferences, toggleProfile, hasProfile } = useAccessibility();
  const { normalizedContent, transformForProfiles } = useContent();
  
  const handleContinue = async () => {
    if (normalizedContent && preferences.activeProfiles.length > 0) {
      await transformForProfiles(preferences.activeProfiles);
      navigate('/learn');
    } else if (preferences.activeProfiles.length > 0) {
      navigate('/learn');
    }
  };
  
  const profileEntries = Object.entries(PROFILE_INFO) as [ProfileId, typeof PROFILE_INFO[ProfileId]][];
  
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="mb-4">Choose Your Accessibility Profile</h1>
            <p className="text-muted-foreground readable-width mx-auto">
              Select one or more profiles that match your learning needs. 
              You can combine multiple profiles for a personalized experience.
            </p>
          </div>
          
          {/* Profile Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {profileEntries.map(([id, profile]) => {
              const isActive = hasProfile(id);
              
              return (
                <Card
                  key={id}
                  className={`cursor-pointer transition-all touch-target-min
                    ${isActive 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                    }`}
                  onClick={() => toggleProfile(id)}
                  role="checkbox"
                  aria-checked={isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleProfile(id);
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: profile.color }}
                          aria-hidden="true"
                        />
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                      </div>
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {profile.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Selected profiles summary */}
          {preferences.activeProfiles.length > 0 && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium mb-2">Selected profiles:</p>
              <div className="flex flex-wrap gap-2">
                {preferences.activeProfiles.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: `${PROFILE_INFO[id].color}20`,
                      color: PROFILE_INFO[id].color 
                    }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PROFILE_INFO[id].color }}
                    />
                    {PROFILE_INFO[id].name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={preferences.activeProfiles.length === 0}
              className="touch-target-min"
            >
              {normalizedContent ? 'Transform & Continue' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {!normalizedContent && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/upload')}
                className="touch-target-min"
              >
                Upload Content First
              </Button>
            )}
          </div>
          
          {/* Info note */}
          <p className="text-sm text-muted-foreground text-center mt-8">
            You can change your profiles anytime using the accessibility toggle in the header.
          </p>
        </div>
      </div>
    </Layout>
  );
}
