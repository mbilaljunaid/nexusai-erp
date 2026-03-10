
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User } from "lucide-react";

interface AuditLogViewerProps {
    entityType: string;
    entityId: string;
}

interface AuditLogEntry {
    id: string;
    action: string;
    changedBy: string;
    changes: any;
    createdAt: string;
}

export default function AuditLogViewer({ entityType, entityId }: AuditLogViewerProps) {
    const { data: logs = [], isLoading } = useQuery<AuditLogEntry[]>({
        queryKey: [`/api/mdm/audit/${entityType}/${entityId}`],
    });

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading audit history...</div>;

    if (logs.length === 0) {
        return <div className="p-4 text-sm text-muted-foreground">No audit history found for this record.</div>;
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">Audit History</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {logs.map((log: any) => (
                            <div key={log.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="mt-1">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">{log.action}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <User className="w-3 h-3 mr-1" />
                                        {log.changedBy}
                                    </div>
                                    {log.changes && (
                                        <div className="mt-2 text-xs bg-muted p-2 rounded font-mono">
                                            {JSON.stringify(log.changes, null, 2)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
