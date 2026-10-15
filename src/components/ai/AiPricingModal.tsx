"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, Check } from "lucide-react";

interface AiPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedPrice: number | string | null;
  explanation: string;
  title: string;
}

export function AiPricingModal({
  isOpen,
  onClose,
  suggestedPrice,
  explanation,
  title,
}: AiPricingModalProps) {
  const formattedPrice =
    typeof suggestedPrice === "number"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(suggestedPrice)
      : suggestedPrice;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-2xl font-bold"
            style={{ color: "#0f4656" }}
          >
            <DollarSign className="w-6 h-6" style={{ color: "#ef864c" }} />
            AI Pricing Suggestion
          </DialogTitle>
          <DialogDescription className="text-foreground/60 text-lg">
            Analysis for <strong>{title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6 max-h-[60vh] overflow-y-auto px-1">
          <div className="bg-gradient-to-br from-[#ef864c]/10 to-[#0f4656]/10 p-6 rounded-2xl border border-primary/10 text-center">
            <p className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-1">
              Suggested Value
            </p>
            <p className="text-4xl font-extrabold" style={{ color: "#0f4656" }}>
              {formattedPrice || "Price TBD"}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#0f4656] flex items-center gap-2">
              Market Analysis & Reasoning
            </h4>
            <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed text-foreground/80 border border-border/50">
              {explanation}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full text-white border-0 bg-gradient-to-r from-[#ef864c] to-[#0f4656] hover:opacity-90 transition-all font-bold gap-2 h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
          >
            <Check className="w-5 h-5" />
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
