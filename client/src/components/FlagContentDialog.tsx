import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle } from "lucide-react";

interface FlagContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "post" | "comment";
  targetId: string;
}

const FLAG_REASONS = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "off-topic", label: "Off-topic or irrelevant" },
  { value: "duplicate", label: "Duplicate content" },
  { value: "other", label: "Other reason" },
];

export function FlagContentDialog({ open, onOpenChange, targetType, targetId }: FlagContentDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const flagMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/community/flag", {
        targetType,
        targetId,
        reason: `${reason}${details ? `: ${details}` : ""}`,
      });
    },
    onSuccess: () => {
      toast({ 
        title: "Report submitted", 
        description: "Thank you for helping keep our community safe. We'll review this content shortly." 
      });
      onOpenChange(false);
      setReason("");
      setDetails("");
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to submit report. Please log in first.", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast({ title: "Please select a reason", variant: "destructive" });
      return;
    }
    flagMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report {targetType === "post" ? "Post" : "Comment"}
          </DialogTitle>
          <DialogDescription>
            Help us understand why you're reporting this content. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger data-testid="select-flag-reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {FLAG_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context that might help our moderators..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-flag-details"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!reason || flagMutation.isPending}
            data-testid="button-submit-flag"
          >
            {flagMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
