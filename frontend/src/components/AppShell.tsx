import { useState } from 'react';
import { Home, MessageCircle, Users, User, LogOut, Video } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import HomeFeed from '../pages/HomeFeed';
import Messages from '../pages/Messages';
import Characters from '../pages/Characters';
import Profile from '../pages/Profile';
import Videos from '../pages/Videos';

type Page = 'home' | 'messages' | 'characters' | 'profile' | 'videos';

export default function AppShell() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomeFeed />;
      case 'messages':
        return <Messages />;
      case 'characters':
        return <Characters />;
      case 'profile':
        return <Profile />;
      case 'videos':
        return <Videos />;
      default:
        return <HomeFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_60)] via-[oklch(0.96_0.02_120)] to-[oklch(0.94_0.03_180)] dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/logo.dim_512x512.png" 
              alt="ToonSpace" 
              className="w-12 h-12"
            />
            <h1 className="text-2xl font-black bg-gradient-to-r from-[oklch(0.65_0.22_330)] via-[oklch(0.70_0.20_60)] to-[oklch(0.65_0.18_180)] bg-clip-text text-transparent">
              ToonSpace
            </h1>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="rounded-full font-semibold"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around items-center max-w-2xl mx-auto">
            <NavButton
              icon={Home}
              label="Home"
              active={currentPage === 'home'}
              onClick={() => setCurrentPage('home')}
            />
            <NavButton
              icon={Video}
              label="Videos"
              active={currentPage === 'videos'}
              onClick={() => setCurrentPage('videos')}
            />
            <NavButton
              icon={MessageCircle}
              label="Messages"
              active={currentPage === 'messages'}
              onClick={() => setCurrentPage('messages')}
            />
            <NavButton
              icon={Users}
              label="Characters"
              active={currentPage === 'characters'}
              onClick={() => setCurrentPage('characters')}
            />
            <NavButton
              icon={User}
              label="Profile"
              active={currentPage === 'profile'}
              onClick={() => setCurrentPage('profile')}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="pb-20 pt-8 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} • Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
        active
          ? 'bg-gradient-to-br from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] text-white shadow-lg scale-105'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
