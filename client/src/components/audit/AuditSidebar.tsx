import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export interface AuditEvent {
    id: string;
    action: "create" | "update" | "delete" | "approve" | "reject" | "view" | string;
    actor: string;
    timestamp: string; // ISO string
    details?: string;
}

export interface AuditSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    events: AuditEvent[];
}

/**
 * AuditSidebar
 * A reusable side panel to display the Level-15 audit trail for any entity.
 */
export function AuditSidebar({
    open,
    onOpenChange,
    title = "Audit Trail",
    events
}: AuditSidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        History of changes and actions performed on this record.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-0">
                        {events.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No audit events recording.
                            </div>
                        ) : (
                            events.map((event, index) => (
                                <div key={event.id || index} className="relative pl-6 pb-8 border-l last:border-0 border-muted-foreground/20 last:pb-0">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold capitalize text-foreground">
                                                {event.action.replace(/_/g, " ")}
                                            </span>
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="text-xs text-primary font-medium">
                                            by {event.actor}
                                        </div>

                                        {event.details && (
                                            <div className="mt-1 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                                {event.details}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="mt-4">
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
