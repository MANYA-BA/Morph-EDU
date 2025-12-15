import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { RotateCcw } from 'lucide-react';

export default function Settings() {
  const {
    preferences,
    setFontSize,
    setFontFamily,
    setContrast,
    setReducedMotion,
    setPacing,
    resetPreferences,
  } = useAccessibility();
  
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Customize your accessibility preferences for the best learning experience.
            </p>
          </div>
          
          {/* Typography */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Adjust text display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Font Size */}
              <div className="space-y-2">
                <Label>Font Size</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={preferences.fontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFontSize(size)}
                      className="capitalize"
                    >
                      {size === 'xlarge' ? 'X-Large' : size}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Font Family */}
              <div className="space-y-2">
                <Label>Font Family</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={preferences.fontFamily === 'default' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFontFamily('default')}
                  >
                    Default
                  </Button>
                  <Button
                    variant={preferences.fontFamily === 'dyslexic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFontFamily('dyslexic')}
                  >
                    Dyslexia-Friendly
                  </Button>
                  <Button
                    variant={preferences.fontFamily === 'mono' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFontFamily('mono')}
                  >
                    Monospace
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Visual */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Visual</CardTitle>
              <CardDescription>Adjust visual display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contrast */}
              <div className="space-y-2">
                <Label>Contrast</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'high', 'ultra'] as const).map((contrast) => (
                    <Button
                      key={contrast}
                      variant={preferences.contrast === contrast ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContrast(contrast)}
                      className="capitalize"
                    >
                      {contrast}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={preferences.reducedMotion}
                  onCheckedChange={setReducedMotion}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Pacing */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Learning Pace</CardTitle>
              <CardDescription>Control content timing and progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Pacing</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['slow', 'normal', 'fast'] as const).map((pacing) => (
                    <Button
                      key={pacing}
                      variant={preferences.pacing === pacing ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPacing(pacing)}
                      className="capitalize"
                    >
                      {pacing}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Reset */}
          <Separator className="my-8" />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Reset All Settings</h3>
              <p className="text-sm text-muted-foreground">
                Restore all settings to their default values
              </p>
            </div>
            <Button variant="destructive" onClick={resetPreferences}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
