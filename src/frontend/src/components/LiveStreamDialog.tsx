import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { useGetCharacterProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import AvatarImage from './AvatarImage';
import ScrollableSelectContent from './ScrollableSelectContent';

interface LiveStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStreamStart: (stream: { authorId: string; title: string }) => void;
}

export default function LiveStreamDialog({ open, onOpenChange, onStreamStart }: LiveStreamDialogProps) {
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('user');
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();

  const selectedAuthor = authorId === 'user'
    ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
    : characters?.find(c => c.id === authorId);

  const handleStartStream = () => {
    if (!title.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    setIsStreaming(true);
    onStreamStart({ authorId, title: title.trim() });
    toast.success('Live stream started! 🔴');
    
    // Reset after a delay
    setTimeout(() => {
      setIsStreaming(false);
      setTitle('');
      setAuthorId('user');
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            Go Live
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stream as</Label>
            <div className="flex items-center gap-3">
              <AvatarImage avatar={selectedAuthor?.avatar} name={selectedAuthor?.name || 'User'} size="sm" />
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger className="flex-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <ScrollableSelectContent>
                  <SelectItem value="user">You</SelectItem>
                  {characters?.map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.name}
                    </SelectItem>
                  ))}
                </ScrollableSelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stream-title">Stream Title</Label>
            <Input
              id="stream-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your stream about?"
              className="rounded-xl"
            />
          </div>

          {isStreaming && (
            <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-red-500 font-bold">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </div>
              <p className="text-sm text-muted-foreground mt-2">Your stream is now live!</p>
            </div>
          )}

          <Button
            onClick={handleStartStream}
            className="w-full rounded-full font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            disabled={isStreaming}
          >
            {isStreaming ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Starting...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Start Live Stream
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
