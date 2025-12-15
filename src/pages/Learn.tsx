import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useContent } from '@/contexts/ContentContext';
import { PROFILE_INFO } from '@/lib/profiles/definitions';
import { LearningRenderer } from '@/components/learning/LearningRenderer';

export default function Learn() {
  const { preferences, composedProfile } = useAccessibility();
  const { normalizedContent, transformedContent, transformForProfiles } = useContent();
  
  // Re-transform when profiles change
  useEffect(() => {
    if (normalizedContent && preferences.activeProfiles.length > 0) {
      transformForProfiles(preferences.activeProfiles);
    }
  }, [normalizedContent, preferences.activeProfiles, transformForProfiles]);
  
  // No content state
  if (!normalizedContent) {
    return (
      <Layout>
        <div className="container py-16 md:py-24">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2>No Content Yet</h2>
            <p className="text-muted-foreground">
              Upload educational content to start your accessible learning experience.
            </p>
            <Button asChild>
              <Link to="/upload">Upload Content</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // No profiles selected state
  if (preferences.activeProfiles.length === 0) {
    return (
      <Layout>
        <div className="container py-16 md:py-24">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2>Select a Profile</h2>
            <p className="text-muted-foreground">
              Choose your accessibility profile to transform the content for your needs.
            </p>
            <Button asChild>
              <Link to="/profiles">Choose Profile</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl mb-2">{normalizedContent.title}</h1>
              <p className="text-muted-foreground">{normalizedContent.summary}</p>
            </div>
            
            {/* Active profiles */}
            <div className="flex flex-wrap gap-2">
              {composedProfile.activeProfiles.map((id) => (
                <Badge
                  key={id}
                  variant="outline"
                  className="gap-2"
                  style={{ 
                    borderColor: PROFILE_INFO[id].color,
                    color: PROFILE_INFO[id].color 
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PROFILE_INFO[id].color }}
                  />
                  {PROFILE_INFO[id].name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content outline */}
        {normalizedContent.outline.length > 0 && (
          <Card className="mb-8">
            <CardContent className="py-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Outline</h2>
              <nav aria-label="Content outline">
                <ol className="flex flex-wrap gap-2">
                  {normalizedContent.outline.map((item, index) => (
                    <li key={index}>
                      <a 
                        href={`#section-${index}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {index + 1}. {item}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </CardContent>
          </Card>
        )}
        
        {/* Learning content */}
        {transformedContent ? (
          <LearningRenderer content={transformedContent} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Transforming content...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
