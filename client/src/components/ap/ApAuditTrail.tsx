import { useQuery } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Clock, FileText, Database } from "lucide-react";
import { format } from "date-fns";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function ApAuditTrail() {
    const { data: auditLogs, isLoading } = useQuery<any[]>({
        queryKey: ["/api/ap/reports/audit-trail"]
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const getActionColor = (action: string) => {
        if (action.includes("VALIDATED")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        if (action.includes("CLOSE")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        if (action.includes("CREATED")) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
        if (action.includes("HOLD")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Audit Trail</CardTitle>
                <CardDescription>Immutable record of all lifecycle events and data changes</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Initiated By</TableHead>
                            <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {auditLogs?.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`font-mono text-[10px] ${getActionColor(log.action)} border-none px-2 py-0.5`}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Database className="h-3.5 w-3.5 text-muted-foreground" />
                                        {log.entity}
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        {log.userId}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto">
                                                <FileText className="h-3.5 w-3.5" /> View Diff
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[700px]">
                                            <DialogHeader>
                                                <DialogTitle>Audit Detail: {log.action}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Before</h4>
                                                    <pre className="p-3 bg-muted rounded-md text-[10px] overflow-auto h-[300px]">
                                                        {JSON.stringify(log.beforeState, null, 2) || "N/A"}
                                                    </pre>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">After</h4>
                                                    <pre className="p-3 bg-primary/5 border border-primary/20 rounded-md text-[10px] overflow-auto h-[300px]">
                                                        {JSON.stringify(log.afterState, null, 2) || "N/A"}
                                                    </pre>
                                                </div>
                                            </div>
                                            {log.details && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-100 dark:border-blue-900/30">
                                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                                        <strong>System Notes:</strong> {log.details}
                                                    </p>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                        {auditLogs?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No audit records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
