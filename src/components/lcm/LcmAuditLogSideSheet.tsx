
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, FilePlus, Edit, Trash2, CheckCircle, Calculator } from "lucide-react";

interface LcmAuditLogSideSheetProps {
    entityId: string | null;
    entityTable?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function LcmAuditLogSideSheet({ entityId, entityTable = 'lcm_trade_operations', isOpen, onClose }: LcmAuditLogSideSheetProps) {

    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['lcmAudit', entityId],
        queryFn: async () => {
            if (!entityId) return [];
            const res = await fetch(`/api/lcm/audit/${entityTable}/${entityId}`);
            if (!res.ok) throw new Error("Failed to fetch logs");
            return res.json();
        },
        enabled: !!entityId && isOpen
    });

    const getIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <FilePlus className="h-4 w-4 text-blue-500" />;
            case 'UPDATE': return <Edit className="h-4 w-4 text-amber-500" />;
            case 'DELETE': return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'CLOSE': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'ALLOCATE': return <Calculator className="h-4 w-4 text-purple-500" />;
            default: return <History className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatChanges = (fields: any) => {
        if (!fields) return null;
        if (fields.new && !fields.old) {
            return <div className="text-xs text-muted-foreground mt-1">Created with initial data.</div>;
        }
        if (fields.varianceCalculated) {
            return <div className="text-xs text-green-600 font-medium mt-1">Variances finalized and locked.</div>;
        }
        if (fields.totalAllocatedLines) {
            return <div className="text-xs text-muted-foreground mt-1">
                Allocated {fields.totalCharges} charges to {fields.totalAllocatedLines} lines.
            </div>;
        }

        // Generic diff
        return (
            <div className="text-xs mt-1 space-y-1">
                {Object.keys(fields).map(k => (
                    <div key={k}>
                        <span className="font-semibold">{k}:</span> {JSON.stringify(fields[k])}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Audit History
                    </SheetTitle>
                    <SheetDescription>
                        Timeline of actions and changes.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    {isLoading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading history...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No history found.</div>
                    ) : (
                        <div className="relative border-l ml-3 pl-6 space-y-6">
                            {logs.map((log: any) => (
                                <div key={log.id} className="relative">
                                    <div className="absolute -left-[31px] bg-background border rounded-full p-1">
                                        {getIcon(log.action)}
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{log.action}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            Performed by <Badge variant="outline" className="text-[10px] h-5">{log.performedBy}</Badge>
                                        </div>
                                        {formatChanges(log.changedFields)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
