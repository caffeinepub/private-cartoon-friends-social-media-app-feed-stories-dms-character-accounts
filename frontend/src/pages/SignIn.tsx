import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function SignIn() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[oklch(0.95_0.02_60)] via-[oklch(0.92_0.03_120)] to-[oklch(0.90_0.04_180)]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/assets/generated/background-tile.dim_1024x1024.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-[oklch(0.85_0.05_60)]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/generated/logo.dim_512x512.png" 
              alt="App Logo" 
              className="w-32 h-32 drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-center mb-2 bg-gradient-to-r from-[oklch(0.65_0.22_330)] via-[oklch(0.70_0.20_60)] to-[oklch(0.65_0.18_180)] bg-clip-text text-transparent tracking-tight">
            ToonSpace
          </h1>
          <p className="text-center text-muted-foreground mb-8 text-lg font-medium">
            Your private cartoon hangout! 🎨✨
          </p>

          {/* Description */}
          <div className="bg-accent/50 rounded-2xl p-6 mb-8 border-2 border-accent">
            <p className="text-sm text-center text-foreground/90 leading-relaxed">
              Welcome to your personal social space! Connect with your favorite cartoon friends from the 90s and 2000s. 
              This is a <strong>private app</strong> just for you—create character profiles, share posts, stories, and messages!
            </p>
            <p className="text-xs text-center text-muted-foreground mt-3 italic">
              Remember: Only upload content you own or have permission to use.
            </p>
          </div>

          {/* Login Button */}
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full text-lg font-bold rounded-full h-14 bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)] shadow-lg hover:shadow-xl transition-all"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Enter ToonSpace
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}
