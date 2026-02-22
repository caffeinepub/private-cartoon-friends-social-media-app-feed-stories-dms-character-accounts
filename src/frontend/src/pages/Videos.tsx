import { useState } from 'react';
import { useGetVideos } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Video, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import VideoComposer from '../components/VideoComposer';
import VideoCard from '../components/VideoCard';
import LiveStreamDialog from '../components/LiveStreamDialog';
import LiveStreamCard from '../components/LiveStreamCard';
import LiveStreamViewer from '../components/LiveStreamViewer';

export default function Videos() {
  const [showLiveDialog, setShowLiveDialog] = useState(false);
  const [activeStream, setActiveStream] = useState<{ authorId: string; title: string } | null>(null);
  const [viewingStream, setViewingStream] = useState<{ authorId: string; title: string } | null>(null);

  const { data: videos, isLoading } = useGetVideos();

  // Sort videos by timestamp (newest first)
  const sortedVideos = videos ? [...videos].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];

  const handleStreamStart = (stream: { authorId: string; title: string }) => {
    setActiveStream(stream);
    // Auto-clear after 5 minutes (simulated)
    setTimeout(() => setActiveStream(null), 5 * 60 * 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] bg-clip-text text-transparent">
          Videos
        </h1>
        <Button
          onClick={() => setShowLiveDialog(true)}
          className="rounded-full font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Radio className="mr-2 h-4 w-4" />
          Go Live
        </Button>
      </div>

      {/* Active Live Streams */}
      {activeStream && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            Live Now
          </h2>
          <LiveStreamCard
            stream={activeStream}
            onClick={() => setViewingStream(activeStream)}
          />
        </div>
      )}

      {/* Video Composer */}
      <VideoComposer />

      {/* Videos Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Video className="h-5 w-5" />
          All Videos
        </h2>

        {isLoading ? (
          <>
            <VideoSkeleton />
            <VideoSkeleton />
          </>
        ) : sortedVideos.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 text-center border-4 border-dashed border-border">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">
              No videos yet! Post your first video above 🎬
            </p>
          </div>
        ) : (
          sortedVideos.map((video) => <VideoCard key={video.id} video={video} />)
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

function VideoSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-6 border-4 border-border space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
