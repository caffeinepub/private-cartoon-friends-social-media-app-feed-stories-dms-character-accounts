import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AvatarImage from './AvatarImage';
import { useGetConversation, useGetCharacterProfiles, useSendMessage } from '../hooks/useQueries';
import { CharacterProfileView, MessageView } from '../backend';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  conversationId: string;
  onBack: () => void;
}

function ThreadSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex justify-start">
          <Skeleton className="h-10 w-48 rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-10 w-56 rounded-2xl" />
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export default function MessageThread({ conversationId, onBack }: MessageThreadProps) {
  const [messageText, setMessageText] = useState('');
  const [senderId, setSenderId] = useState<string>('user');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: conversation,
    isLoading: convLoading,
    isFetched: convFetched,
    error: convError,
    refetch: convRefetch,
  } = useGetConversation(conversationId);

  const { data: characters, isLoading: charsLoading } = useGetCharacterProfiles();
  const sendMessage = useSendMessage();

  const isLoading = convLoading || charsLoading;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages?.length]);

  // Set default sender to first non-user participant
  useEffect(() => {
    if (conversation && characters) {
      const firstCharId = conversation.participants.find(p => p !== 'user');
      if (firstCharId) {
        const char = characters.find((c: CharacterProfileView) => c.id === firstCharId);
        if (char) setSenderId(firstCharId);
      }
    }
  }, [conversation, characters]);

  const getCharacter = (id: string): CharacterProfileView | undefined => {
    if (!characters) return undefined;
    return characters.find((c: CharacterProfileView) => c.id === id);
  };

  const getParticipantName = (id: string): string => {
    if (id === 'user') return 'You';
    const char = getCharacter(id);
    return char ? char.name : id;
  };

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content || !conversationId) return;
    setMessageText('');
    try {
      await sendMessage.mutateAsync({
        conversationId,
        senderId,
        content,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessageText(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading state
  if (isLoading) {
    return <ThreadSkeleton />;
  }

  // Error state
  if (convError) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-foreground">Error</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-foreground font-semibold">Failed to load conversation</p>
          <p className="text-muted-foreground text-sm">
            {convError instanceof Error ? convError.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => convRefetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Not found state (fetched but no data)
  if (convFetched && !conversation) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-foreground">Not Found</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-foreground font-semibold">Conversation not found</p>
          <p className="text-muted-foreground text-sm">This conversation may have been deleted.</p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Still waiting for first fetch — show skeleton
  if (!conversation) {
    return <ThreadSkeleton />;
  }

  // Determine participants for the header
  const participantIds = conversation.participants.filter(p => p !== 'user');
  const headerChar = participantIds.length > 0 ? getCharacter(participantIds[0]) : undefined;
  const headerTitle = participantIds.length > 0
    ? participantIds.map(id => getParticipantName(id)).join(', ')
    : 'Conversation';

  const allParticipants = conversation.participants;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <AvatarImage
          avatar={headerChar?.avatar}
          name={headerChar?.name || headerTitle}
          avatarTimestamp={headerChar?.avatarTimestamp}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{headerTitle}</p>
          <p className="text-xs text-muted-foreground">
            {allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!conversation.messages || conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-2">
            <div className="text-4xl">💬</div>
            <p className="text-muted-foreground font-medium">Start the conversation!</p>
            <p className="text-sm text-muted-foreground">
              Say hello to {headerTitle}
            </p>
          </div>
        ) : (
          conversation.messages.map((message: MessageView) => {
            const isUser = message.sender === 'user';
            const senderChar = isUser ? undefined : getCharacter(message.sender);
            const senderName = getParticipantName(message.sender);

            let timeAgo = '';
            try {
              const ts = Number(message.timestamp) / 1_000_000;
              if (!isNaN(ts) && ts > 0) {
                timeAgo = formatDistanceToNow(new Date(ts), { addSuffix: true });
              }
            } catch {
              timeAgo = '';
            }

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser && (
                  <AvatarImage
                    avatar={senderChar?.avatar}
                    name={senderChar?.name || senderName}
                    avatarTimestamp={senderChar?.avatarTimestamp}
                    size="sm"
                    className="flex-shrink-0 mt-1"
                  />
                )}
                <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isUser && (
                    <span className="text-xs text-muted-foreground px-1">{senderName}</span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                  {timeAgo && (
                    <span className="text-xs text-muted-foreground px-1">{timeAgo}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border bg-card/50">
        {/* Sender selector */}
        {allParticipants.length > 1 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {allParticipants.map(pid => {
              const char = pid === 'user' ? undefined : getCharacter(pid);
              const name = getParticipantName(pid);
              const isSelected = senderId === pid;
              return (
                <button
                  key={pid}
                  onClick={() => setSenderId(pid)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <AvatarImage
                    avatar={char?.avatar}
                    name={char?.name || name}
                    avatarTimestamp={char?.avatarTimestamp}
                    size="sm"
                    className="w-4 h-4"
                  />
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Message input */}
        <div className="flex gap-2 items-end">
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message as ${getParticipantName(senderId)}…`}
            rows={1}
            className="flex-1 resize-none bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            size="icon"
            className="rounded-full w-11 h-11 flex-shrink-0 bg-primary hover:bg-primary/90"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
