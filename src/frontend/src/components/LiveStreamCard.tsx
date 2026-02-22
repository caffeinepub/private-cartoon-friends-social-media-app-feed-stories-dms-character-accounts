import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import AvatarImage from './AvatarImage';
import { useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';

interface LiveStreamCardProps {
  stream: {
    authorId: string;
    title: string;
  };
  onClick: () => void;
}

export default function LiveStreamCard({ stream, onClick }: LiveStreamCardProps) {
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();

  const author = stream.authorId === 'user'
    ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
    : characters?.find(c => c.id === stream.authorId);

  return (
    <Card 
      className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail/Preview */}
        <div className="relative bg-gradient-to-br from-red-500/20 to-purple-500/20 aspect-video flex items-center justify-center">
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-2" />
              LIVE
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full text-white text-sm">
            <Eye className="h-4 w-4" />
            <span>{Math.floor(Math.random() * 500) + 50}</span>
          </div>
          <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="lg" />
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg line-clamp-2">{stream.title}</h3>
          <div className="flex items-center gap-2">
            <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="sm" />
            <p className="text-sm text-muted-foreground">{author?.name || 'Unknown'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
