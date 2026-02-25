import { useState } from 'react';
import { useGetPosts } from '../hooks/useQueries';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import StoriesRow from '../components/StoriesRow';
import LiveStreamDialog from '../components/LiveStreamDialog';
import LiveStreamCard from '../components/LiveStreamCard';
import LiveStreamViewer from '../components/LiveStreamViewer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio } from 'lucide-react';

export default function HomeFeed() {
  const [showLiveDialog, setShowLiveDialog] = useState(false);
  const [activeStream, setActiveStream] = useState<{ authorId: string; title: string } | null>(null);
  const [viewingStream, setViewingStream] = useState<{ authorId: string; title: string } | null>(null);

  const { data: posts, isLoading } = useGetPosts();

  // Sort posts by timestamp (newest first)
  const sortedPosts = posts ? [...posts].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];

  const handleStreamStart = (stream: { authorId: string; title: string }) => {
    setActiveStream(stream);
    // Auto-clear after 5 minutes (simulated)
    setTimeout(() => setActiveStream(null), 5 * 60 * 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stories Row */}
      <StoriesRow />

      {/* Live Stream Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {activeStream && <Radio className="h-5 w-5 text-red-500 animate-pulse" />}
          {activeStream ? 'Live Now' : 'Go Live'}
        </h2>
        <Button
          onClick={() => setShowLiveDialog(true)}
          size="sm"
          className="rounded-full font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Radio className="mr-2 h-4 w-4" />
          Start Stream
        </Button>
      </div>

      {activeStream && (
        <LiveStreamCard
          stream={activeStream}
          onClick={() => setViewingStream(activeStream)}
        />
      )}

      {/* Post Composer */}
      <PostComposer />

      {/* Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
          </>
        ) : sortedPosts.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 text-center border-4 border-dashed border-border">
            <p className="text-muted-foreground text-lg">
              No posts yet! Share your first post above 🎨
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Dialogs */}
      <LiveStreamDialog
        open={showLiveDialog}
        onOpenChange={setShowLiveDialog}
        onStreamStart={handleStreamStart}
      />

      <LiveStreamViewer
        open={!!viewingStream}
        onOpenChange={(open) => !open && setViewingStream(null)}
        stream={viewingStream}
      />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-6 border-4 border-border space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
