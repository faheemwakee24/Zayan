"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  title: string;
  isLoading: boolean;
}

export function AiPromptModal({
  isOpen,
  onClose,
  onGenerate,
  title,
  isLoading,
}: AiPromptModalProps) {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    await onGenerate(prompt);
    setPrompt("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-2xl font-bold"
            style={{ color: "#0f4656" }}
          >
            <Sparkles className="w-6 h-6" style={{ color: "#ef864c" }} />
            AI Assistant
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Provide specific instructions for generating the description for{" "}
            <strong>{title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto px-1">
          <Textarea
            placeholder="e.g., Make it sound ultra-luxurious, focus on the view, or highlight the modern kitchen..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none border-border focus:ring-2"
            style={{ "--tw-ring-color": "#ef864c" } as React.CSSProperties}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-2  ">
            Tip: Be specific for better results!
          </p>
        </div>
        <DialogFooter className="sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="font-semibold text-foreground/70"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex-1 text-white border-0 bg-gradient-to-r from-[#ef864c] to-[#0f4656] hover:opacity-90 transition-all font-semibold gap-2 h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Description
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
