import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { History, User, Database, Clock } from "lucide-react";
import { AuditDiffViewer } from "./AuditDiffViewer";

interface AuditEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    timestamp: string;
    changes: any;
    metadata?: any;
}

interface AuditDetailsSideSheetProps {
    entry: AuditEntry | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuditDetailsSideSheet({ entry, isOpen, onOpenChange }: AuditDetailsSideSheetProps) {
    if (!entry) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Audit Record Details
                    </SheetTitle>
                    <SheetDescription>
                        Detailed traceability for record ID: {entry.entityId}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Entity Type</p>
                            <Badge variant="outline">{entry.entityType}</Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Action</p>
                            <Badge
                                className={
                                    entry.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                        entry.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                }
                            >
                                {entry.action}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold">Actor</p>
                                <p className="text-sm font-medium">{entry.actorId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold">Timestamp</p>
                                <p className="text-sm font-medium">
                                    {format(new Date(entry.timestamp), 'PPP p')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold">Audit Record ID</p>
                                <p className="text-sm font-mono text-xs">{entry.id}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" />
                            Property Comparisons
                        </h4>
                        <div className="max-h-[400px]">
                            {entry.changes && Object.keys(entry.changes).length > 0 ? (
                                <AuditDiffViewer changes={entry.changes} />
                            ) : (
                                <div className="bg-slate-500/10 rounded-lg border p-6 text-center italic text-muted-foreground text-sm">
                                    No granular property changes recorded for this entry.
                                </div>
                            )}
                        </div>
                    </div>

                    {entry.metadata && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold">Extended Metadata</h4>
                            <div className="bg-slate-500/10 rounded-lg border p-4 font-mono text-xs overflow-auto">
                                <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
