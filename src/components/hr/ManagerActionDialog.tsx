import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from '@/components/ui/DatePicker';

interface ManagerActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: "PROMOTE" | "TRANSFER";
}

export const ManagerActionDialog: React.FC<ManagerActionDialogProps> = ({ isOpen, onClose, type }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mocking API call for now
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Approval Requested",
                description: `Workflow initiated for the ${type.toLowerCase()} request.`,
            });
            onClose();
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{type === "PROMOTE" ? "Promote Team Member" : "Transfer Team Member"}</DialogTitle>
                    <DialogDescription>
                        Complete the following details to initiate the approval workflow.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>Select Employee</Label>
                            <Select defaultValue="e1">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="e1">Alice Smith</SelectItem>
                                    <SelectItem value="e2">Bob Johnson</SelectItem>
                                    <SelectItem value="e3">Carol White</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === "PROMOTE" ? (
                            <>
                                <div className="space-y-2">
                                    <Label>New Grade</Label>
                                    <Input placeholder="e.g. Senior" />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Job Title</Label>
                                    <Input placeholder="e.g. Principal Product Designer" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Target Department</Label>
                                    <Input placeholder="e.g. Marketing" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Location</Label>
                                    <Input placeholder="e.g. London Office" />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <DatePicker onChange={() => {}} />
                        </div>

                        <div className="space-y-2">
                            <Label>Justification</Label>
                            <Textarea placeholder="Explain the reason for this change..." />
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
