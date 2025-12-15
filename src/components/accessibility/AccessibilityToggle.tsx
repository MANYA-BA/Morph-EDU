import { Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { PROFILE_INFO } from '@/lib/profiles/definitions';
import { Badge } from '@/components/ui/badge';

export function AccessibilityToggle() {
  const { preferences, toggleProfile, hasProfile } = useAccessibility();
  const activeCount = preferences.activeProfiles.length;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative touch-target-min"
          aria-label={`Accessibility settings. ${activeCount} profiles active.`}
        >
          <Accessibility className="h-5 w-5" />
          {activeCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm">Quick Profile Toggle</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select your accessibility needs
            </p>
          </div>
          
          <div className="grid gap-2">
            {(Object.keys(PROFILE_INFO) as Array<keyof typeof PROFILE_INFO>).map((profileId) => {
              const profile = PROFILE_INFO[profileId];
              const isActive = hasProfile(profileId);
              
              return (
                <button
                  key={profileId}
                  onClick={() => toggleProfile(profileId)}
                  className={`flex items-center gap-3 p-2 rounded-md text-left transition-colors touch-target-min
                    ${isActive 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-secondary border border-transparent'
                    }`}
                  aria-pressed={isActive}
                >
                  <div 
                    className={`w-3 h-3 rounded-full`}
                    style={{ backgroundColor: profile.color }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{profile.name}</div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                </button>
              );
            })}
          </div>
          
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/settings">All Settings</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
