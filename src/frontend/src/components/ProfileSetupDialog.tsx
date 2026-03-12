import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetupDialog() {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        bio: "",
        avatar: undefined,
      });
      toast.success("Welcome to ToonSpace! 🎉");
    } catch (_error) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center bg-gradient-to-r from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] bg-clip-text text-transparent">
            Welcome to ToonSpace!
          </DialogTitle>
          <DialogDescription className="text-center">
            Let's set up your profile to get started
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">What should we call you?</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="rounded-xl"
              autoFocus
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
                Setting up...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Let's Go!
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
