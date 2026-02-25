import { VideoView } from '../backend';
import { useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import AvatarImage from './AvatarImage';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  video: VideoView;
}

export default function VideoCard({ video }: VideoCardProps) {
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();

  const author = video.author === 'user'
    ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
    : characters?.find(c => c.id === video.author);

  const timestamp = new Date(Number(video.timestamp) / 1_000_000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <Card className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="md" />
          <div className="flex-1">
            <p className="font-bold text-lg">{author?.name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Caption */}
        {video.caption && (
          <p className="text-foreground whitespace-pre-wrap">{video.caption}</p>
        )}

        {/* Video Player */}
        <div className="rounded-2xl overflow-hidden bg-black">
          <video
            src={video.video.getDirectURL()}
            controls
            className="w-full max-h-[600px] object-contain"
            preload="metadata"
          />
        </div>
      </CardContent>
    </Card>
  );
}
