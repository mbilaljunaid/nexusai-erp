import { ArrowRight, MinusCircle, PlusCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiffValue {
    old: any;
    new: any;
}

interface AuditDiffViewerProps {
    changes: Record<string, DiffValue>;
}

export function AuditDiffViewer({ changes }: AuditDiffViewerProps) {
    const fields = Object.keys(changes);

    if (fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-slate-500/10 rounded-lg border border-dashed">
                <RefreshCw className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm italic">No granular field changes detected.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
                {fields.map((field) => (
                    <div key={field} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="px-3 py-1.5 bg-slate-500/10 border-b flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{field}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">MUTATION</Badge>
                        </div>
                        <div className="p-3 bg-white grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                    <MinusCircle className="h-3 w-3 text-red-400" />
                                    PREVIOUS
                                </div>
                                <div className="text-sm font-mono bg-red-50/50 p-2 rounded border border-red-100/50 text-red-900 dark:text-red-200 break-all">
                                    {renderValue(changes[field].old)}
                                </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-slate-300" />

                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                    <PlusCircle className="h-3 w-3 text-green-400" />
                                    CURRENT
                                </div>
                                <div className="text-sm font-mono bg-green-50/50 p-2 rounded border border-green-100/50 text-green-900 dark:text-green-200 break-all">
                                    {renderValue(changes[field].new)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

function renderValue(val: any) {
    if (val === null || val === undefined) return <span className="italic text-muted-foreground opacity-50">NULL</span>;
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
}
