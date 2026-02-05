
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, AlertCircle, Info, ChevronRight } from "lucide-react";

interface TraceStep {
    stepName: string;
    details: string;
    outcome: "Success" | "Skipped" | "Information";
    data?: any;
}

interface TraceLog {
    eventClassId: string;
    eventTypeId: string;
    steps: TraceStep[];
}

interface AccountingTraceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trace: TraceLog | null;
    isLoading: boolean;
}

export function AccountingTraceModal({ open, onOpenChange, trace, isLoading }: AccountingTraceModalProps) {

    const getIcon = (outcome: string) => {
        switch (outcome) {
            case "Success": return <Check className="h-4 w-4 text-green-500" />;
            case "Skipped": return <Info className="h-4 w-4 text-yellow-500" />; // Or gray
            case "Information": return <Info className="h-4 w-4 text-blue-500" />;
            default: return <AlertCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getColor = (outcome: string) => {
        switch (outcome) {
            case "Success": return "border-l-green-500 bg-green-50/10";
            case "Skipped": return "border-l-yellow-500 bg-yellow-50/10";
            case "Information": return "border-l-blue-500 bg-blue-50/10";
            default: return "border-l-gray-300";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>AI Accounting Trace</DialogTitle>
                    {trace && (
                        <div className="text-sm text-muted-foreground flex gap-2">
                            <span>Event: {trace.eventClassId}</span>
                            <ChevronRight className="h-4 w-4" />
                            <span>Type: {trace.eventTypeId}</span>
                        </div>
                    )}
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    {isLoading && <div className="p-4 text-center">Thinking...</div>}

                    {!isLoading && trace && (
                        <div className="space-y-4 p-1">
                            {trace.steps.map((step, idx) => (
                                <div key={idx} className={`border-l-4 p-3 rounded-r-md border border-t-0 border-b-0 border-r-0 ${getColor(step.outcome)} shadow-sm`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {getIcon(step.outcome)}
                                        <span className="font-semibold text-sm">{step.stepName}</span>
                                        <span className="ml-auto text-xs text-muted-foreground uppercase">{step.outcome}</span>
                                    </div>
                                    <div className="text-sm pl-6">
                                        {step.details}
                                    </div>
                                    {step.data && (
                                        <div className="mt-2 pl-6">
                                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                {JSON.stringify(step.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
