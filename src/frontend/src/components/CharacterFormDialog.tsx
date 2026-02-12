import { useState, useEffect } from 'react';
import { useCreateCharacter, useUpdateCharacter, useUploadAvatar } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { CharacterProfileView, ExternalBlob } from '../backend';
import AvatarImage from './AvatarImage';

interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: CharacterProfileView | null;
}

export default function CharacterFormDialog({ open, onOpenChange, character }: CharacterFormDialogProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const uploadAvatar = useUploadAvatar();

  useEffect(() => {
    if (character) {
      setName(character.name);
      setBio(character.bio);
      setAvatarPreview(character.avatar?.getDirectURL() || null);
    } else {
      setName('');
      setBio('');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [character, open]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      let characterId = character?.id;

      if (character) {
        // Update existing character
        await updateCharacter.mutateAsync({
          characterId: character.id,
          name: name.trim(),
          bio: bio.trim()
        });
      } else {
        // Create new character
        characterId = await createCharacter.mutateAsync({
          name: name.trim(),
          bio: bio.trim()
        });
      }

      // Upload avatar if provided
      if (avatarFile && characterId) {
        const arrayBuffer = await avatarFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageBlob = ExternalBlob.fromBytes(uint8Array);

        await uploadAvatar.mutateAsync({
          characterId,
          image: imageBlob
        });
      }

      toast.success(character ? 'Character updated! ✨' : 'Character created! 🎉');
      onOpenChange(false);
    } catch (error) {
      toast.error(character ? 'Failed to update character' : 'Failed to create character');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            {character ? 'Edit Character' : 'Create Character'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <AvatarImage 
              avatar={avatarPreview ? { getDirectURL: () => avatarPreview } as any : character?.avatar} 
              name={name || 'Character'} 
              size="xl" 
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
              id="character-avatar"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => document.getElementById('character-avatar')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {character?.avatar || avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., SpongeBob, Tommy Pickles"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about this character..."
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="bg-accent/50 rounded-xl p-3 text-xs text-muted-foreground">
            ⚠️ Only upload content you own or have permission to use. Do not use copyrighted images without authorization.
          </div>

          <Button
            type="submit"
            className="w-full rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
            disabled={createCharacter.isPending || updateCharacter.isPending || uploadAvatar.isPending}
          >
            {createCharacter.isPending || updateCharacter.isPending || uploadAvatar.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {character ? 'Save Changes' : 'Create Character'}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
