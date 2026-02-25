import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import AvatarImage from './AvatarImage';
import { useGetCharacterProfiles, useCreateConversation } from '../hooks/useQueries';
import { CharacterProfileView } from '../backend';

interface CreateConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export default function CreateConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: CreateConversationDialogProps) {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: characters, isLoading: charsLoading } = useGetCharacterProfiles();
  const createConversation = useCreateConversation();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedCharacters([]);
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacters(prev =>
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCharacters.length === 0) {
      setError('Please select at least one character to chat with.');
      return;
    }

    setError(null);

    try {
      const participants = ['user', ...selectedCharacters];
      const newConvId = await createConversation.mutateAsync(participants);

      if (!newConvId) {
        setError('Failed to create conversation. Please try again.');
        return;
      }

      setSelectedCharacters([]);
      setError(null);
      onConversationCreated(newConvId);
    } catch (err: unknown) {
      console.error('Failed to create conversation:', err);
      const message = err instanceof Error ? err.message : 'Failed to create conversation. Please try again.';
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">New Conversation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select characters to chat with
          </DialogDescription>
        </DialogHeader>

        {/* Character list */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 py-2">
          {charsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : !characters || characters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium">No characters yet</p>
              <p className="text-sm mt-1">Create some characters first to start chatting!</p>
            </div>
          ) : (
            characters.map((char: CharacterProfileView) => {
              const isSelected = selectedCharacters.includes(char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCharacter(char.id)}
                    className="flex-shrink-0"
                    onClick={e => e.stopPropagation()}
                  />
                  <AvatarImage
                    avatar={char.avatar}
                    name={char.name}
                    avatarTimestamp={char.avatarTimestamp}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{char.name}</p>
                    {char.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{char.bio}</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={selectedCharacters.length === 0 || createConversation.isPending}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full py-3 font-semibold flex items-center justify-center gap-2"
        >
          {createConversation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Start Chat
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
