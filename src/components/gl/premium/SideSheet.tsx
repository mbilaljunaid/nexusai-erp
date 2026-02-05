
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface SideSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function SideSheet({ open, onOpenChange, title, description, children, className }: SideSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className={`sm:max-w-xl w-[400px] overflow-y-auto ${className || ""}`}>
                <SheetHeader className="mb-6">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
