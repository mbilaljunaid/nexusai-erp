import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContractAIAnalysisPanelProps {
    isOpen: boolean;
    onClose: () => void;
    contractId?: string;
}

export function ContractAIAnalysisPanel({ isOpen, onClose, contractId }: ContractAIAnalysisPanelProps) {
    const [analysis, setAnalysis] = useState<any>(null);

    // Run contract analysis
    const analysisMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/contract-portal/contracts/${contractId}/analyze`, {
                method: "POST"
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (data) => {
            setAnalysis(data);
            toast({ title: "Analysis Complete", description: "AI compliance analysis finished" });
        },
        onError: (err: any) => {
            toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
        }
    });

    const getRiskBadge = (level: string) => {
        const config: Record<string, any> = {
            LOW: { variant: "outline", className: "border-green-500 text-green-700", icon: CheckCircle2 },
            MEDIUM: { variant: "outline", className: "border-yellow-500 text-yellow-700", icon: AlertTriangle },
            HIGH: { variant: "outline", className: "border-red-500 text-red-700", icon: XCircle }
        };
        const { icon: Icon, ...badgeProps } = config[level] || config.MEDIUM;
        return (
            <Badge {...badgeProps} className="gap-1">
                <Icon className="h-3 w-3" />
                {level} Risk
            </Badge>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Contract Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Automated compliance and risk assessment powered by AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!analysis && !analysisMutation.isPending && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertDescription>
                                Click "Run Analysis" to get AI-powered insights on contract compliance, risk factors, and suggested improvements.
                            </AlertDescription>
                        </Alert>
                    )}

                    {analysisMutation.isPending && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                            <p className="text-sm text-muted-foreground">Analyzing contract...</p>
                        </div>
                    )}

                    {analysis && (
                        <div className="space-y-4">
                            {/* Overall Risk */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Overall Risk Level</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {analysis.overallRisk || "MEDIUM"}
                                    </p>
                                </div>
                                {getRiskBadge(analysis.overallRisk || "MEDIUM")}
                            </div>

                            {/* Compliance Score */}
                            {analysis.complianceScore !== undefined && (
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Compliance Score</span>
                                        <span className="text-2xl font-bold">
                                            {analysis.complianceScore}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${analysis.complianceScore >= 80 ? 'bg-green-600' :
                                                analysis.complianceScore >= 60 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                                }`}
                                            data-score={analysis.complianceScore}
                                            style={{ width: `${Math.min(100, Math.max(0, analysis.complianceScore))}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Issues Found */}
                            {analysis.issues && analysis.issues.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-sm">Issues Identified</h3>
                                    <div className="space-y-2">
                                        {analysis.issues.map((issue: any, idx: number) => (
                                            <Alert key={idx} variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>{issue}</AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {analysis.recommendations && analysis.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-sm">Recommendations</h3>
                                    <ul className="space-y-2">
                                        {analysis.recommendations.map((rec: string, idx: number) => (
                                            <li key={idx} className="text-sm flex gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Summary */}
                            {analysis.summary && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-medium text-sm mb-2">AI Summary</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {analysis.summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    {!analysis && (
                        <Button
                            onClick={() => analysisMutation.mutate()}
                            disabled={analysisMutation.isPending}
                            className="gap-2"
                        >
                            {analysisMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Run Analysis
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
