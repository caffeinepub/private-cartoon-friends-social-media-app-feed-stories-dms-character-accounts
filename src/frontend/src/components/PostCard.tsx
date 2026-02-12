import { useState } from 'react';
import { PostView } from '../backend';
import { useLikePost, useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import AvatarImage from './AvatarImage';
import CommentsPanel from './CommentsPanel';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: PostView;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();
  const likePost = useLikePost();

  const author = post.author === 'user' 
    ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
    : characters?.find(c => c.id === post.author);

  const timestamp = new Date(Number(post.timestamp) / 1_000_000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  const handleLike = async () => {
    try {
      await likePost.mutateAsync(post.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Card className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Author Header */}
        <div className="flex items-center gap-3">
          <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="md" />
          <div>
            <p className="font-bold text-foreground">{author?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Image */}
        {post.image && (
          <img
            src={post.image.getDirectURL()}
            alt="Post"
            className="w-full rounded-2xl max-h-96 object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={handleLike}
            disabled={likePost.isPending}
          >
            <Heart className={`mr-2 h-4 w-4 ${post.likes.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {post.likes.length}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Comments
          </Button>
        </div>

        {/* Comments */}
        {showComments && <CommentsPanel postId={post.id} />}
      </CardContent>
    </Card>
  );
}
