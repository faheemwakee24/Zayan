"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useReportConversationMutation } from "@/services/redux/api/chatApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface ReportChatModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  messageId?: string;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "scam", label: "Scam" },
  { value: "fake_listing", label: "Fake Listing" },
  { value: "other", label: "Other" },
];

export function ReportChatModal({
  open,
  onClose,
  conversationId,
  messageId,
}: ReportChatModalProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { toast } = useToast();
  const [reportConversation, { isLoading }] = useReportConversationMutation();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for reporting this chat.",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportConversation({
        conversationId,
        messageId,
        reason,
        description: description.trim() || undefined,
      }).unwrap();

      toast({
        title: "Report submitted",
        description: "Thank you for your report. We will review it shortly.",
      });

      // Reset form
      setReason("");
      setDescription("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to submit report",
        description: error?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Chat
          </DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this conversation. Your report will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason for Reporting *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label
                    htmlFor={item.value}
                    className="font-normal cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional information that might help us review your report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

