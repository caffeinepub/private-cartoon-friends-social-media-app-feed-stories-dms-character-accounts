import { useState } from 'react';
import { useGetConversations, useCreateConversation, useGetCharacterProfiles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageCircle } from 'lucide-react';
import MessageThread from '../components/MessageThread';
import CreateConversationDialog from '../components/CreateConversationDialog';
import AvatarImage from '../components/AvatarImage';
import { ConversationView } from '../backend';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationView | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { data: conversations, isLoading } = useGetConversations();
  const { data: characters } = useGetCharacterProfiles();

  const getConversationName = (conv: ConversationView) => {
    const participantNames = conv.participants
      .filter(p => p !== 'user')
      .map(p => characters?.find(c => c.id === p)?.name || 'Unknown')
      .join(', ');
    return participantNames || 'Conversation';
  };

  const getLastMessage = (conv: ConversationView) => {
    if (conv.messages.length === 0) return 'No messages yet';
    const last = conv.messages[conv.messages.length - 1];
    return last.content;
  };

  if (selectedConversation) {
    return (
      <MessageThread
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] bg-clip-text text-transparent">
          Messages
        </h1>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      ) : conversations?.length === 0 ? (
        <Card className="rounded-3xl border-4 border-dashed border-border">
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg mb-4">
              No conversations yet! Start chatting with your characters 💬
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations?.map((conv) => {
            const firstParticipant = conv.participants.find(p => p !== 'user');
            const character = characters?.find(c => c.id === firstParticipant);

            return (
              <Card
                key={conv.id}
                className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedConversation(conv)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AvatarImage avatar={character?.avatar} name={getConversationName(conv)} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{getConversationName(conv)}</p>
                      <p className="text-sm text-muted-foreground truncate">{getLastMessage(conv)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConversationCreated={setSelectedConversation}
      />
    </div>
  );
}
