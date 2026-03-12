import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreatePost, useGetCharacterProfiles } from "../hooks/useQueries";
import ScrollableSelectContent from "./ScrollableSelectContent";

export default function PostComposer() {
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("user");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "saving">(
    "idle",
  );

  const { data: characters } = useGetCharacterProfiles();
  const createPost = useCreatePost();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isPosting = uploadStep !== "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      toast.error("Please add some content or an image");
      return;
    }

    try {
      let imageBlob: ExternalBlob | null = null;
      if (imageFile) {
        setUploadStep("uploading");
        setUploadProgress(0);
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
          (percentage) => {
            setUploadProgress(percentage);
          },
        );
      }

      setUploadStep("saving");
      await createPost.mutateAsync({
        authorId,
        content: content.trim(),
        image: imageBlob,
      });

      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setAuthorId("user");
      setUploadProgress(0);
      setUploadStep("idle");
      toast.success("Post shared! 🎉");
    } catch {
      // Keep all form state so user can tap again without starting over
      setUploadStep("idle");
      setUploadProgress(0);
      toast.error("Post failed — tap Share to try again");
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
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

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share with your toon friends! 🎨"
          className="min-h-24 rounded-xl resize-none"
          disabled={isPosting}
        />

        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            {!isPosting && (
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
            )}
          </div>
        )}

        {isPosting && (
          <div className="bg-primary/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>
                {uploadStep === "uploading"
                  ? `Uploading image... ${uploadProgress}%`
                  : "Saving post..."}
              </span>
            </div>
            {uploadStep === "uploading" && uploadProgress > 0 && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="post-image"
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isPosting}
            onClick={() => document.getElementById("post-image")?.click()}
            data-ocid="post.upload_button"
          >
            <Image className="mr-2 h-4 w-4" />
            Add Image
          </Button>

          <Button
            type="submit"
            className="ml-auto rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
            disabled={isPosting}
            data-ocid="post.submit_button"
          >
            {isPosting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
