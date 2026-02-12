import { useState } from 'react';
import { useGetPosts } from '../hooks/useQueries';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import StoriesRow from '../components/StoriesRow';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomeFeed() {
  const { data: posts, isLoading } = useGetPosts();

  // Sort posts by timestamp (newest first)
  const sortedPosts = posts ? [...posts].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stories Row */}
      <StoriesRow />

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
