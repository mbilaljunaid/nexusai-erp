import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText, User, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AuditLog {
    id: string;
    entityType: "PARTY" | "ITEM" | "LOCATION";
    entityId: string;
    action: "CREATE" | "UPDATE" | "DELETE" | "MERGE";
    actor: string;
    timestamp: string;
    changes: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
}

export default function MDMAuditViewer() {
    const [entityType, setEntityType] = useState<"PARTY" | "ITEM" | "LOCATION" | "ALL">("ALL");
    const [entityId, setEntityId] = useState("");
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data: auditLogs = [] } = useQuery<any>({
        queryKey: ["/api/mdm/audit", entityType, entityId],
        queryFn: async () => {
            let url = "/api/mdm/audit";
            if (entityType !== "ALL" && entityId) {
                url = `/api/mdm/audit/${entityType.toLowerCase()}/${entityId}`;
            }
            const res = await fetch(url);
            return res.json();
        },
    });

    const actionColors = {
        CREATE: "bg-green-500/10 text-green-700 border-green-200",
        UPDATE: "bg-blue-500/10 text-blue-700 border-blue-200",
        DELETE: "bg-red-500/10 text-red-700 border-red-200",
        MERGE: "bg-purple-500/10 text-purple-700 border-purple-200",
    };

    return (
        <StandardPage title="MDM Audit Viewer">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Complete audit trail for all master data operations
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Search audit logs by entity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Entity Type</label>
                            <Select
                                value={entityType}
                                onValueChange={(v: any) => setEntityType(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="PARTY">Party</SelectItem>
                                    <SelectItem value="ITEM">Item</SelectItem>
                                    <SelectItem value="LOCATION">Location</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Entity ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter entity ID..."
                                    value={entityId}
                                    onChange={(e) => setEntityId(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logs List */}
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Audit Trail</h2>
                    {auditLogs.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No audit logs found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </CardContent>
                        </Card>
                    ) : (
                        auditLogs.map((log: AuditLog) => (
                            <Card
                                key={log.id}
                                className={`cursor-pointer transition-all ${selectedLog?.id === log.id
                                        ? "border-primary ring-2 ring-primary"
                                        : "hover:border-primary/50"
                                    }`}
                                onClick={() => setSelectedLog(log)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-base">
                                                    {log.action} {log.entityType}
                                                </CardTitle>
                                                <Badge className={actionColors[log.action]}>
                                                    {log.action}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                ID: {log.entityId}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{log.actor}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {formatDateTime(log.timestamp)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Log Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Details</CardTitle>
                        <CardDescription>
                            {selectedLog
                                ? `${selectedLog.action} operation on ${selectedLog.entityType}`
                                : "Select a log entry to view details"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedLog ? (
                            <p className="text-center py-12 text-muted-foreground">
                                No log selected
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {/* Metadata */}
                                <div className="p-3 border rounded-lg bg-muted/50 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Entity Type:</span>
                                        <Badge variant="outline">{selectedLog.entityType}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Entity ID:</span>
                                        <span className="font-mono">{selectedLog.entityId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Action:</span>
                                        <Badge className={actionColors[selectedLog.action]}>
                                            {selectedLog.action}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Actor:</span>
                                        <span>{selectedLog.actor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Timestamp:</span>
                                        <span>{formatDateTime(selectedLog.timestamp)}</span>
                                    </div>
                                </div>

                                {/* Field Changes */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-3">Field Changes</h4>
                                    <div className="space-y-3">
                                        {selectedLog.changes.map((change, idx) => (
                                            <div key={idx} className="p-3 border rounded-lg">
                                                <div className="font-medium text-sm mb-2">{change.field}</div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Before:</span>
                                                        <div className="mt-1 p-2 bg-red-500/5 border border-red-200 rounded font-mono text-xs">
                                                            {change.oldValue !== null && change.oldValue !== undefined
                                                                ? String(change.oldValue)
                                                                : <span className="italic text-muted-foreground">null</span>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">After:</span>
                                                        <div className="mt-1 p-2 bg-green-500/5 border border-green-200 rounded font-mono text-xs">
                                                            {change.newValue !== null && change.newValue !== undefined
                                                                ? String(change.newValue)
                                                                : <span className="italic text-muted-foreground">null</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
