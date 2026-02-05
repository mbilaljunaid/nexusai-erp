
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface POAcknowledgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    poNumber: string;
}

export function POAcknowledgeModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    poNumber,
}: POAcknowledgeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Acknowledge Purchase Order</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to acknowledge PO <strong>{poNumber}</strong>?
                        By doing so, you confirm receipt of the order and agree to the delivery terms.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Acknowledge & Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
