import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type CharacterProfileView, ExternalBlob } from "../backend";
import {
  useCreateCharacter,
  useUpdateCharacter,
  useUploadAvatar,
} from "../hooks/useQueries";
import AvatarImage from "./AvatarImage";

interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: CharacterProfileView | null;
}

export default function CharacterFormDialog({
  open,
  onOpenChange,
  character,
}: CharacterFormDialogProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [savingStep, setSavingStep] = useState<"idle" | "details" | "avatar">(
    "idle",
  );

  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const uploadAvatar = useUploadAvatar();

  // biome-ignore lint/correctness/useExhaustiveDependencies: open resets form when dialog closes
  useEffect(() => {
    if (character) {
      setName(character.name);
      setBio(character.bio);
      setAvatarPreview(null);
    } else {
      setName("");
      setBio("");
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setSavingStep("idle");
    setUploadProgress(0);
  }, [character, open]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
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
      toast.error("Please enter a name");
      return;
    }

    try {
      let characterId = character?.id;

      // Step 1: Save character details
      setSavingStep("details");
      if (character) {
        await updateCharacter.mutateAsync({
          characterId: character.id,
          name: name.trim(),
          bio: bio.trim(),
        });
      } else {
        characterId = await createCharacter.mutateAsync({
          name: name.trim(),
          bio: bio.trim(),
        });
      }

      // Step 2: Upload avatar if provided
      if (avatarFile && characterId) {
        setSavingStep("avatar");
        setUploadProgress(0);

        const arrayBuffer = await avatarFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
          (percentage) => {
            setUploadProgress(percentage);
          },
        );

        await uploadAvatar.mutateAsync({
          characterId,
          image: imageBlob,
        });
      }

      setSavingStep("idle");
      toast.success(
        character ? "Character updated! ✨" : "Character created! 🎉",
      );
      onOpenChange(false);
    } catch {
      // IMPORTANT: do NOT clear avatarFile or avatarPreview on failure
      // so the user can tap Save again without re-picking the photo
      setSavingStep("idle");
      setUploadProgress(0);
      toast.error("Upload failed — tap Save to try again");
    }
  };

  const isSaving = savingStep !== "idle";
  const displayAvatar = avatarPreview
    ? ({ getDirectURL: () => avatarPreview } as ExternalBlob)
    : character?.avatar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            {character ? "Edit Character" : "Create Character"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <AvatarImage
              avatar={displayAvatar}
              name={name || "Character"}
              size="xl"
              avatarTimestamp={character?.avatarTimestamp}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
              id="character-avatar"
              disabled={isSaving}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() =>
                document.getElementById("character-avatar")?.click()
              }
              disabled={isSaving}
              data-ocid="character.upload_button"
            >
              <Upload className="mr-2 h-4 w-4" />
              {character?.avatar || avatarPreview
                ? "Change Avatar"
                : "Upload Avatar"}
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
              disabled={isSaving}
              data-ocid="character.input"
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
              disabled={isSaving}
              data-ocid="character.textarea"
            />
          </div>

          <div className="bg-accent/50 rounded-xl p-3 text-xs text-muted-foreground">
            ⚠️ Only upload content you own or have permission to use. Do not use
            copyrighted images without authorization.
          </div>

          {isSaving && (
            <div className="bg-primary/10 rounded-xl p-3 text-sm">
              {savingStep === "details" && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Saving character details...</span>
                </div>
              )}
              {savingStep === "avatar" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Uploading avatar... {uploadProgress}%</span>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
            disabled={isSaving}
            data-ocid="character.submit_button"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {character ? "Save Changes" : "Create Character"}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
