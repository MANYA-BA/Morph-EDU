import { Link, useLocation } from 'react-router-dom';
import { Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AccessibilityToggle } from '@/components/accessibility/AccessibilityToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/upload', label: 'Upload' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/learn', label: 'Learn' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 font-semibold text-xl"
          aria-label="MorphEDU Home"
        >
          <span className="text-primary">Morph</span>
          <span>EDU</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors touch-target-min
                ${location.pathname === link.href 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              aria-current={location.pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <AccessibilityToggle />
          
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="touch-target-min"
            aria-label="Settings"
          >
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden touch-target-min"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background p-4 animate-fade-in"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors touch-target-min
                  ${location.pathname === link.href 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={location.pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
