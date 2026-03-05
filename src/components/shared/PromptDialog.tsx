import { useState, useEffect, KeyboardEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromptDialogProps {
    open: boolean;
    title: string;
    description?: string;
    label?: string;
    placeholder?: string;
    inputType?: string;
    defaultValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

/**
 * Shared PromptDialog — design-system replacement for native browser `prompt()`.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   ...
 *   <PromptDialog
 *     open={open}
 *     title="Rejection Reason"
 *     description="Please provide a reason for rejection."
 *     label="Reason"
 *     placeholder="Enter reason..."
 *     onConfirm={(reason) => { setOpen(false); rejectMutation.mutate({ id, reason }); }}
 *     onCancel={() => setOpen(false)}
 *   />
 */
export function PromptDialog({
    open,
    title,
    description,
    label,
    placeholder = "Enter value...",
    inputType = "text",
    defaultValue = "",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
}: PromptDialogProps) {
    const [value, setValue] = useState(defaultValue);

    // Reset value each time the dialog opens
    useEffect(() => {
        if (open) setValue(defaultValue);
    }, [open, defaultValue]);

    const handleConfirm = () => {
        if (!value.trim() && inputType !== "number") return;
        onConfirm(value.trim());
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="py-2 space-y-2">
                    {label && <Label htmlFor="prompt-input">{label}</Label>}
                    <Input
                        id="prompt-input"
                        type={inputType}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!value.trim() && inputType !== "number"}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
