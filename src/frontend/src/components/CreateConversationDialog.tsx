import { useState } from 'react';
import { useCreateConversation, useGetCharacterProfiles } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationView } from '../backend';
import AvatarImage from './AvatarImage';

interface CreateConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: ConversationView) => void;
}

export default function CreateConversationDialog({ 
  open, 
  onOpenChange, 
  onConversationCreated 
}: CreateConversationDialogProps) {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  
  const { data: characters } = useGetCharacterProfiles();
  const createConversation = useCreateConversation();

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacters(prev =>
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCharacters.length === 0) {
      toast.error('Please select at least one character');
      return;
    }

    try {
      const conversationId = await createConversation.mutateAsync(['user', ...selectedCharacters]);
      
      // Fetch the created conversation to pass to parent
      // For now, we'll just close and let the parent refresh
      toast.success('Conversation created! 🎉');
      onOpenChange(false);
      setSelectedCharacters([]);
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">New Conversation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select characters to chat with</Label>
            {characters?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No characters yet. Create some characters first!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {characters?.map((character) => (
                  <div
                    key={character.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent cursor-pointer"
                    onClick={() => toggleCharacter(character.id)}
                  >
                    <Checkbox
                      checked={selectedCharacters.includes(character.id)}
                      onCheckedChange={() => toggleCharacter(character.id)}
                    />
                    <AvatarImage avatar={character.avatar} name={character.name} size="sm" />
                    <div className="flex-1">
                      <p className="font-semibold">{character.name}</p>
                      <p className="text-xs text-muted-foreground">{character.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
            disabled={createConversation.isPending || selectedCharacters.length === 0}
          >
            {createConversation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Chat
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
