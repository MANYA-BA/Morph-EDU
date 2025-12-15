import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>MorphEDU — One content. Infinite access.</p>
          <p className="mt-1">Accessible learning for everyone.</p>
        </div>
      </footer>
    </div>
  );
}
