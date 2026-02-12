import { useState } from 'react';
import { useGetCharacterProfiles, useDeleteCharacter } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import CharacterFormDialog from '../components/CharacterFormDialog';
import AvatarImage from '../components/AvatarImage';
import { toast } from 'sonner';
import { CharacterProfileView } from '../backend';

export default function Characters() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfileView | null>(null);
  
  const { data: characters, isLoading } = useGetCharacterProfiles();
  const deleteCharacter = useDeleteCharacter();

  const handleEdit = (character: CharacterProfileView) => {
    setEditingCharacter(character);
    setShowDialog(true);
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    try {
      await deleteCharacter.mutateAsync(characterId);
      toast.success('Character deleted');
    } catch (error) {
      toast.error('Failed to delete character');
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCharacter(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] bg-clip-text text-transparent">
          Your Characters
        </h1>
        <Button
          onClick={() => setShowDialog(true)}
          className="rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Character
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      ) : characters?.length === 0 ? (
        <Card className="rounded-3xl border-4 border-dashed border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              No characters yet! Create your first cartoon friend 🎨
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters?.map((character) => (
            <Card key={character.id} className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <AvatarImage avatar={character.avatar} name={character.name} size="lg" />
                  <div className="flex-1">
                    <CardTitle className="text-xl font-black">{character.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{character.bio || 'No bio yet'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleEdit(character)}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleDelete(character.id)}
                    disabled={deleteCharacter.isPending}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CharacterFormDialog
        open={showDialog}
        onOpenChange={handleCloseDialog}
        character={editingCharacter}
      />
    </div>
  );
}
