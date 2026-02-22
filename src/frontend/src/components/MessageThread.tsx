import { useState, useEffect, useRef } from 'react';
import { ConversationView } from '../backend';
import { useSendMessage, useGetCharacterProfiles, useGetCallerUserProfile, useGetConversation } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send } from 'lucide-react';
import AvatarImage from './AvatarImage';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import ScrollableSelectContent from './ScrollableSelectContent';

interface MessageThreadProps {
  conversation: ConversationView;
  onBack: () => void;
}

export default function MessageThread({ conversation, onBack }: MessageThreadProps) {
  const [content, setContent] = useState('');
  const [senderId, setSenderId] = useState('user');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: updatedConversation } = useGetConversation(conversation.id);
  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();
  const sendMessage = useSendMessage();

  const currentConversation = updatedConversation || conversation;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation.messages]);

  const getConversationName = () => {
    const participantNames = currentConversation.participants
      .filter(p => p !== 'user')
      .map(p => characters?.find(c => c.id === p)?.name || 'Unknown')
      .join(', ');
    return participantNames || 'Conversation';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const messageContent = content.trim();
    setContent(''); // Clear immediately for better UX
    setSenderId('user');

    try {
      await sendMessage.mutateAsync({
        conversationId: currentConversation.id,
        senderId,
        content: messageContent
      });
    } catch (error) {
      toast.error('Failed to send message');
      setContent(messageContent); // Restore content on error
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-card rounded-t-3xl p-4 border-4 border-b-0 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-black">{getConversationName()}</h2>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-card border-x-4 border-[oklch(0.85_0.05_60)] dark:border-border p-4 overflow-y-auto space-y-4"
      >
        {currentConversation.messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          currentConversation.messages.map((message) => {
            const author = message.sender === 'user'
              ? { name: userProfile?.name || 'You', avatar: userProfile?.avatar }
              : characters?.find(c => c.id === message.sender);

            const timestamp = new Date(Number(message.timestamp) / 1_000_000);
            const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

            return (
              <div key={message.id} className="flex gap-2">
                <AvatarImage avatar={author?.avatar} name={author?.name || 'Unknown'} size="sm" />
                <div className="flex-1 bg-accent/50 rounded-2xl p-3">
                  <p className="text-sm font-semibold">{author?.name || 'Unknown'}</p>
                  <p className="text-sm text-foreground">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Message Form */}
      <div className="bg-card rounded-b-3xl p-4 border-4 border-t-0 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Select value={senderId} onValueChange={setSenderId}>
            <SelectTrigger className="w-32 rounded-xl">
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

          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="rounded-xl"
          />

          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={sendMessage.isPending || !content.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
