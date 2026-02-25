import { useState } from 'react';
import { useGetStories } from '../hooks/useQueries';
import { Plus } from 'lucide-react';
import CreateStoryDialog from './CreateStoryDialog';
import StoryViewerDialog from './StoryViewerDialog';
import AvatarImage from './AvatarImage';
import { useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import { StoryView } from '../backend';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function StoriesRow() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryView | null>(null);
  
  const { data: stories } = useGetStories();
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <>
      <div className="bg-card rounded-3xl p-4 border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {/* Create Story Button */}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <span className="text-xs font-bold text-foreground">Create</span>
            </button>

            {/* Stories */}
            {stories?.map((story) => {
              const author = story.author === 'user'
                ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
                : characters?.find(c => c.id === story.author);

              return (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] group-hover:scale-105 transition-transform">
                    <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="md" className="border-2 border-card" />
                  </div>
                  <span className="text-xs font-bold text-foreground max-w-[64px] truncate">
                    {author?.name || 'Unknown'}
                  </span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <CreateStoryDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      {selectedStory && (
        <StoryViewerDialog
          story={selectedStory}
          open={!!selectedStory}
          onOpenChange={(open) => !open && setSelectedStory(null)}
        />
      )}
    </>
  );
}
