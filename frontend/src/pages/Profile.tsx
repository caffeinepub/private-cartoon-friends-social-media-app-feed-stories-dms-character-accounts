import { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AvatarImage from '../components/AvatarImage';
import { ExternalBlob } from '../backend';

export default function Profile() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState(userProfile?.name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Update form when profile loads
  useState(() => {
    if (userProfile) {
      setName(userProfile.name);
      setBio(userProfile.bio);
    }
  });

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
      toast.error('Please enter your name');
      return;
    }

    try {
      let avatarBlob: ExternalBlob | undefined = userProfile?.avatar;

      if (avatarFile) {
        const arrayBuffer = await avatarFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        avatarBlob = ExternalBlob.fromBytes(uint8Array);
      }

      await saveProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatarBlob
      });

      toast.success('Profile updated! ✨');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-black bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] bg-clip-text text-transparent">
        Your Profile
      </h1>

      <Card className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-black">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <AvatarImage
                avatar={avatarPreview ? { getDirectURL: () => avatarPreview } as any : userProfile?.avatar}
                name={name || 'You'}
                size="xl"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
                id="profile-avatar"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => document.getElementById('profile-avatar')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {userProfile?.avatar || avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Only upload content you own or have permission to use
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
