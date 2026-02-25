import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Eye } from 'lucide-react';
import AvatarImage from './AvatarImage';
import { useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';

interface LiveStreamViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stream: {
    authorId: string;
    title: string;
  } | null;
}

export default function LiveStreamViewer({ open, onOpenChange, stream }: LiveStreamViewerProps) {
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();

  if (!stream) return null;

  const author = stream.authorId === 'user'
    ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
    : characters?.find(c => c.id === stream.authorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <div className="relative h-full flex flex-col bg-black">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Live Badge */}
          <div className="absolute top-4 left-4 z-50">
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-4 py-2">
              <div className="h-3 w-3 bg-white rounded-full animate-pulse mr-2" />
              LIVE
            </Badge>
          </div>

          {/* Video Stream Area */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-purple-500/20">
            <div className="text-center space-y-4">
              <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="lg" />
              <p className="text-white text-xl font-bold">Live Stream in Progress</p>
              <p className="text-white/70">Simulated live stream view</p>
            </div>
          </div>

          {/* Stream Info Bar */}
          <div className="bg-card border-t-4 border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="md" />
                <div>
                  <h3 className="font-bold text-lg">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground">{author?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">{Math.floor(Math.random() * 500) + 50} watching</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
