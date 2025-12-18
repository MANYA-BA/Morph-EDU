import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Sliders, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

const steps = [
  {
    icon: Upload,
    step: '1',
    title: 'Upload content',
    description: 'PDF, images, text, or transcripts — any educational format.',
  },
  {
    icon: Sliders,
    step: '2',
    title: 'Choose accessibility profile',
    description: 'Select the learning experience that works best for you.',
  },
  {
    icon: BookOpen,
    step: '3',
    title: 'Learn your way',
    description: 'Experience the content in a format designed for your needs.',
  },
];

const profiles = [
  { id: 'blind', name: 'Blind / Low Vision' },
  { id: 'deaf', name: 'Deaf / Hard of Hearing' },
  { id: 'dyslexia', name: 'Dyslexia' },
  { id: 'autism', name: 'Autism Spectrum' },
  { id: 'adhd', name: 'ADHD' },
  { id: 'motor', name: 'Motor Disabilities' },
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            One Content. Infinite Access.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Upload any educational content and experience it in formats designed for different learning needs.
          </p>
          <div className="pt-4">
            <Button size="lg" asChild>
              <Link to="/upload">
                Upload your content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-20 md:py-24">
        <div className="container">
          <h2 className="text-2xl font-semibold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {steps.map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mx-auto">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Profiles */}
      <section className="border-t border-border py-20 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-semibold">Designed for everyone</h2>
            <p className="text-muted-foreground">
              Six accessibility profiles, each with thoughtful adaptations for how you learn.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-12 max-w-3xl mx-auto">
            {profiles.map((profile) => (
              <span
                key={profile.id}
                className="px-4 py-2 text-sm border border-border rounded-full text-muted-foreground"
              >
                {profile.name}
              </span>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/profiles">Learn more about profiles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 md:py-24">
        <div className="container text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Upload your first piece of content and experience accessible learning.
          </p>
          <Button size="lg" asChild>
            <Link to="/upload">
              Start now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}