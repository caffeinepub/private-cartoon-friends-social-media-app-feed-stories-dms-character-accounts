import { useState } from 'react';
import { useCreateStory, useGetCharacterProfiles } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import ScrollableSelectContent from './ScrollableSelectContent';

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
  const [authorId, setAuthorId] = useState('user');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: characters } = useGetCharacterProfiles();
  const createStory = useCreateStory();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const imageBlob = ExternalBlob.fromBytes(uint8Array);

      await createStory.mutateAsync({
        authorId,
        image: imageBlob,
        caption: caption.trim()
      });

      toast.success('Story created! ✨');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create story');
    }
  };

  const resetForm = () => {
    setAuthorId('user');
    setCaption('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Create Story</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Post as</Label>
            <Select value={authorId} onValueChange={setAuthorId}>
              <SelectTrigger className="rounded-xl">
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

          <div className="space-y-2">
            <Label>Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="story-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 rounded-xl"
                  onClick={() => document.getElementById('story-image')?.click()}
                >
                  <Image className="mr-2 h-6 w-6" />
                  Select Image
                </Button>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
            disabled={createStory.isPending || !imageFile}
          >
            {createStory.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Share Story
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
