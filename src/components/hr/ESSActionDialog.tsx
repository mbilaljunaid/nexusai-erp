import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ESSActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: "ADDRESS" | "MARITAL_STATUS";
}

export const ESSActionDialog: React.FC<ESSActionDialogProps> = ({ isOpen, onClose, type }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mocking API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Change Requested",
                description: `Your ${type.toLowerCase().replace('_', ' ')} change request has been submitted for HR approval.`,
            });
            onClose();
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{type === "ADDRESS" ? "Request Address Change" : "Request Marital Status Change"}</DialogTitle>
                    <DialogDescription>
                        Significant personal changes require HR review and approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        {type === "ADDRESS" ? (
                            <div className="space-y-2">
                                <Label>New Residential Address</Label>
                                <Textarea placeholder="Enter your full new address..." required />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>New Marital Status</Label>
                                <Select required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SINGLE">Single</SelectItem>
                                        <SelectItem value="MARRIED">Married</SelectItem>
                                        <SelectItem value="DIVORCED">Divorced</SelectItem>
                                        <SelectItem value="WIDOWED">Widowed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <Input type="date" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Justification / Reason</Label>
                            <Textarea placeholder="Brief explanation for the change..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                            {isSubmitting ? "Submitting..." : "Submit for Approval"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
