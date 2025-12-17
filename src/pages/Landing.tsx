import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Users, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
const features = [{
  icon: Upload,
  title: 'Upload Any Content',
  description: 'PDF, images, text, or transcripts — we accept all educational formats.'
}, {
  icon: Users,
  title: 'Choose Your Profile',
  description: 'Select accessibility needs: visual, hearing, cognitive, or motor.'
}, {
  icon: Sparkles,
  title: 'AI Transforms Content',
  description: 'Our AI restructures content specifically for how you learn best.'
}, {
  icon: BookOpen,
  title: 'Learn Your Way',
  description: 'Experience the same knowledge in a format designed for you.'
}];
const profiles = [{
  id: 'blind',
  name: 'Blind / Low Vision',
  color: 'hsl(270, 70%, 60%)'
}, {
  id: 'deaf',
  name: 'Deaf / Hard of Hearing',
  color: 'hsl(210, 70%, 60%)'
}, {
  id: 'dyslexia',
  name: 'Dyslexia',
  color: 'hsl(150, 70%, 45%)'
}, {
  id: 'autism',
  name: 'Autism Spectrum',
  color: 'hsl(45, 70%, 55%)'
}, {
  id: 'adhd',
  name: 'ADHD',
  color: 'hsl(0, 70%, 60%)'
}, {
  id: 'motor',
  name: 'Motor Disabilities',
  color: 'hsl(180, 50%, 45%)'
}];
export default function Landing() {
  return <Layout>
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="animate-fade-up">
            One content.{' '}
            <span className="text-primary">Infinite access.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground readable-width mx-auto animate-fade-up" style={{
          animationDelay: '0.1s'
        }}>
            MorphEDU transforms any educational content into personalized, 
            accessible learning experiences for every type of learner.
          </p>
          <div style={{
          animationDelay: '0.2s'
        }} className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-up text-5xl">
            <Button size="lg" asChild className="touch-target-min">
              <Link to="/upload">
                ​Many ways to learn.    
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="touch-target-min">
              <Link to="/profiles">
                Explore Profiles
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
        <div className="container">
          <h2 className="text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <Card key={feature.title} className="border-0 bg-background animate-fade-up" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>
      
      {/* Supported Profiles */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="mb-4">Designed for Everyone</h2>
          <p className="text-muted-foreground readable-width mx-auto">
            Six comprehensive accessibility profiles, each with unique adaptations. 
            Combine multiple profiles for a personalized experience.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {profiles.map((profile, index) => <div key={profile.id} className="p-4 rounded-lg border border-border text-center hover:border-primary/50 transition-colors animate-fade-up" style={{
          animationDelay: `${index * 0.05}s`
        }}>
              <div className="w-4 h-4 rounded-full mx-auto mb-3" style={{
            backgroundColor: profile.color
          }} aria-hidden="true" />
              <span className="text-sm font-medium">{profile.name}</span>
            </div>)}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/profiles">Learn More About Profiles</Link>
          </Button>
        </div>
      </section>
      
      {/* CTA */}
      <section className="border-t border-border bg-primary/5 py-16 md:py-24">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Transform Learning?</h2>
          <p className="text-muted-foreground mb-8 readable-width mx-auto">
            Upload your first piece of content and experience accessible education.
          </p>
          <Button size="lg" asChild className="touch-target-min">
            <Link to="/upload">
              Start Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>;
}