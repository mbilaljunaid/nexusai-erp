
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, FileText, User } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    details: any;
    timestamp: string;
}

export function AuditLogViewer() {
    const { data: logs, isLoading } = useQuery<AuditLog[]>({
        queryKey: ["gl-audit-logs"],
        queryFn: async () => {
            const res = await fetch("/api/gl/audit-logs");
            if (!res.ok) throw new Error("Failed to fetch audit logs");
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading audit trail...</div>;
    }

    return (
        <Card className="h-full border-l-4 border-l-blue-600 shadow-sm">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-blue-600" />
                    <CardTitle>Immutable Audit Log</CardTitle>
                </div>
                <CardDescription>
                    Complete history of all critical financial actions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[150px]">Action</TableHead>
                                <TableHead className="w-[150px]">Entity</TableHead>
                                <TableHead className="w-[150px]">User</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No audit records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs?.map((log) => (
                                    <TableRow key={log.id} className="group hover:bg-muted/5">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs bg-slate-50">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <span className="font-medium">{log.entity}</span>
                                            <br />
                                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px] inline-block">
                                                {log.entityId}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                {log.userId}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground break-all">
                                            {JSON.stringify(log.details)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
