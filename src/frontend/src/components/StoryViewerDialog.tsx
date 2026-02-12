import { StoryView } from '../backend';
import { useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AvatarImage from './AvatarImage';
import { formatDistanceToNow } from 'date-fns';

interface StoryViewerDialogProps {
  story: StoryView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StoryViewerDialog({ story, open, onOpenChange }: StoryViewerDialogProps) {
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();

  const author = story.author === 'user'
    ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
    : characters?.find(c => c.id === story.author);

  const timestamp = new Date(Number(story.timestamp) / 1_000_000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 bg-black border-0">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="sm" />
              <div>
                <p className="font-bold text-white">{author?.name || 'Unknown'}</p>
                <p className="text-xs text-white/80">{timeAgo}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          {story.image && (
            <img
              src={story.image.getDirectURL()}
              alt="Story"
              className="w-full max-h-[80vh] object-contain"
            />
          )}

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center">{story.caption}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
