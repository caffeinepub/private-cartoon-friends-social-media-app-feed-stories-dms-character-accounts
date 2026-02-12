import { useState } from 'react';
import { useGetComments, useCreateComment, useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import AvatarImage from './AvatarImage';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentsPanelProps {
  postId: string;
}

export default function CommentsPanel({ postId }: CommentsPanelProps) {
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState('user');
  
  const { data: comments, isLoading } = useGetComments(postId);
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();
  const createComment = useCreateComment();

  const sortedComments = comments ? [...comments].sort((a, b) => Number(a.timestamp - b.timestamp)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({
        postId,
        authorId,
        content: content.trim()
      });
      setContent('');
      setAuthorId('user');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="border-t-2 border-border pt-4 space-y-4">
      {/* Comments List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : sortedComments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {sortedComments.map((comment) => {
            const author = comment.author === 'user'
              ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
              : characters?.find(c => c.id === comment.author);
            
            const timestamp = new Date(Number(comment.timestamp) / 1_000_000);
            const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

            return (
              <div key={comment.id} className="flex gap-2">
                <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="sm" />
                <div className="flex-1 bg-accent/50 rounded-2xl p-3">
                  <p className="text-sm font-semibold">{author?.name || 'Unknown'}</p>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Select value={authorId} onValueChange={setAuthorId}>
          <SelectTrigger className="w-32 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">You</SelectItem>
            {characters?.map((char) => (
              <SelectItem key={char.id} value={char.id}>
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="rounded-xl"
        />

        <Button
          type="submit"
          size="icon"
          className="rounded-full"
          disabled={createComment.isPending || !content.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
