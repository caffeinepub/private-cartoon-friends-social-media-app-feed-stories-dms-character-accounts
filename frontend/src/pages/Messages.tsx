import React, { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CreateConversationDialog from '../components/CreateConversationDialog';
import MessageThread from '../components/MessageThread';
import AvatarImage from '../components/AvatarImage';
import { useGetConversations, useGetCharacterProfiles } from '../hooks/useQueries';
import { ConversationView, CharacterProfileView } from '../backend';

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: conversations, isLoading: convsLoading, isFetching: convsFetching } = useGetConversations();
  const { data: characters } = useGetCharacterProfiles();

  const handleConversationCreated = (newConvId: string) => {
    setShowCreateDialog(false);
    setSelectedConversationId(newConvId);
  };

  const getConversationTitle = (conv: ConversationView): string => {
    if (!characters) return 'Conversation';
    const participantIds = conv.participants.filter(p => p !== 'user');
    if (participantIds.length === 0) return 'Conversation';
    const names = participantIds.map(id => {
      const char = characters.find((c: CharacterProfileView) => c.id === id);
      return char ? char.name : id;
    });
    return names.join(', ');
  };

  const getConversationChar = (conv: ConversationView): CharacterProfileView | undefined => {
    if (!characters) return undefined;
    const firstParticipantId = conv.participants.find(p => p !== 'user');
    if (!firstParticipantId) return undefined;
    return characters.find((c: CharacterProfileView) => c.id === firstParticipantId);
  };

  const getLastMessage = (conv: ConversationView): string => {
    if (!conv.messages || conv.messages.length === 0) return 'No messages yet';
    const last = conv.messages[conv.messages.length - 1];
    return last.content.length > 50 ? last.content.slice(0, 50) + '…' : last.content;
  };

  // If a conversation is selected, show the thread
  if (selectedConversationId) {
    return (
      <MessageThread
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  const isLoading = convsLoading || (convsFetching && !conversations);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-2xl font-bold text-primary font-display">Messages</h1>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="divide-y divide-border">
            {conversations.map((conv: ConversationView) => {
              const char = getConversationChar(conv);
              const title = getConversationTitle(conv);
              const lastMsg = getLastMessage(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    <AvatarImage
                      avatar={char?.avatar}
                      name={char?.name || title}
                      avatarTimestamp={char?.avatarTimestamp}
                      size="md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{title}</p>
                    <p className="text-sm text-muted-foreground truncate">{lastMsg}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-muted/30 border-2 border-dashed border-border flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No conversations yet!</h3>
            <p className="text-muted-foreground mb-6">Start chatting with your characters 💬</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full px-6 py-2 font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Start Conversation
            </Button>
          </div>
        )}
      </div>

      <CreateConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
