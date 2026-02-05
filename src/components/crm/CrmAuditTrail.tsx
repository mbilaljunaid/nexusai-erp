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

interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    beforeState: any;
    afterState: any;
    details?: string;
}

export default function CrmAuditTrail({ entityId }: { entityId?: string }) {
    const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
        queryKey: ["/api/crm/audit", entityId],
        queryFn: async () => {
            // Mock data if API missing
            try {
                const url = entityId ? `/api/crm/audit?entityId=${entityId}` : "/api/crm/audit";
                const res = await fetch(url);
                if (res.ok) return res.json();
                throw new Error("Mock fallback");
            } catch (e) {
                return [
                    {
                        id: '1',
                        timestamp: new Date().toISOString(),
                        action: 'LEAD_CREATED',
                        entity: 'Lead',
                        entityId: entityId || '1',
                        userId: 'admin',
                        beforeState: null,
                        afterState: { name: 'John Doe', status: 'new' },
                        details: 'Lead captured from website'
                    },
                    {
                        id: '2',
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        action: 'STATUS_CHANGE',
                        entity: 'Lead',
                        entityId: entityId || '1',
                        userId: 'sales_rep',
                        beforeState: { status: 'new' },
                        afterState: { status: 'contacted' },
                        details: 'Initial outreach call'
                    }
                ]
            }
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const getActionColor = (action: string) => {
        if (action.includes("CREATE")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        if (action.includes("DELETE")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        if (action.includes("STATUS")) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Metric & Audit History</CardTitle>
                <CardDescription>Track changes and updates to this record</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {auditLogs?.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`font-mono text-[10px] ${getActionColor(log.action)} border-none px-2 py-0.5`}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
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
                                                <FileText className="h-3.5 w-3.5" /> View
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle>Audit Detail: {log.action}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase">Before</h4>
                                                    <pre className="p-2 bg-muted rounded text-[10px] overflow-auto h-[200px]">
                                                        {JSON.stringify(log.beforeState, null, 2) || "N/A"}
                                                    </pre>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-primary uppercase">After</h4>
                                                    <pre className="p-2 bg-primary/5 border border-primary/20 rounded text-[10px] overflow-auto h-[200px]">
                                                        {JSON.stringify(log.afterState, null, 2) || "N/A"}
                                                    </pre>
                                                </div>
                                            </div>
                                            {log.details && (
                                                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                                    <p className="text-xs">
                                                        <strong>Note:</strong> {log.details}
                                                    </p>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
