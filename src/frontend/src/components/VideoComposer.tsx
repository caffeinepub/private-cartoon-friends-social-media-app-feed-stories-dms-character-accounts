import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import {
  useCreateVideo,
  useGetCallerUserProfile,
  useGetCharacterProfiles,
} from "../hooks/useQueries";
import AvatarImage from "./AvatarImage";
import ScrollableSelectContent from "./ScrollableSelectContent";

export default function VideoComposer() {
  const [caption, setCaption] = useState("");
  const [authorId, setAuthorId] = useState("user");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: characters } = useGetCharacterProfiles();
  const { data: userProfile } = useGetCallerUserProfile();
  const createVideo = useCreateVideo();

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file is too large (max 100MB)");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const isUploading = createVideo.isPending || uploadProgress > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error("Please select a video");
      return;
    }

    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const videoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          setUploadProgress(percentage);
        },
      );

      await createVideo.mutateAsync({
        authorId,
        video: videoBlob,
        caption: caption.trim(),
      });

      toast.success("Video posted! 🎬");
      setCaption("");
      setAuthorId("user");
      setVideoFile(null);
      setVideoPreview(null);
      setUploadProgress(0);
    } catch {
      // IMPORTANT: keep videoFile and videoPreview on failure
      // so the user can tap Post Video again without re-selecting the file
      setUploadProgress(0);
      toast.error("Upload failed — tap Post Video to try again");
    }
  };

  const selectedAuthor =
    authorId === "user"
      ? { name: userProfile?.name || "You", avatar: userProfile?.avatar }
      : characters?.find((c) => c.id === authorId);

  return (
    <Card className="rounded-3xl border-4 border-[oklch(0.85_0.05_60)] dark:border-border shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <AvatarImage
              avatar={selectedAuthor?.avatar}
              name={selectedAuthor?.name || "User"}
              size="md"
            />
            <Select value={authorId} onValueChange={setAuthorId}>
              <SelectTrigger className="w-48 rounded-xl font-semibold">
                <SelectValue />
              </SelectTrigger>
              <ScrollableSelectContent>
                <SelectItem value="user">Post as You</SelectItem>
                {characters?.map((char) => (
                  <SelectItem key={char.id} value={char.id}>
                    Post as {char.name}
                  </SelectItem>
                ))}
              </ScrollableSelectContent>
            </Select>
          </div>

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption for your video..."
            className="rounded-2xl resize-none"
            rows={3}
            disabled={isUploading}
          />

          {videoPreview && (
            <div className="relative rounded-2xl overflow-hidden bg-black">
              {/* biome-ignore lint/a11y/useMediaCaption: preview video for user-uploaded content */}
              <video
                src={videoPreview}
                controls
                className="w-full max-h-96 object-contain"
              />
              {!isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button
                type="button"
                variant="outline"
                className="rounded-full font-semibold"
                disabled={isUploading}
                asChild
                data-ocid="video.upload_button"
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {videoFile ? "Change Video" : "Select Video"}
                </span>
              </Button>
            </label>

            <Button
              type="submit"
              className="flex-1 rounded-full font-bold bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] hover:from-[oklch(0.60_0.24_330)] hover:to-[oklch(0.65_0.22_60)]"
              disabled={isUploading || !videoFile}
              data-ocid="video.submit_button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Post Video
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
