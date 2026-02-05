import {
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RiskAnalysis {
    score: number;
    level: "low" | "medium" | "high" | "critical";
    justification: string[];
}

interface RiskIndicatorProps {
    analysis: RiskAnalysis | null;
    isLoading?: boolean;
    className?: string;
}

export function RiskIndicator({ analysis, isLoading, className }: RiskIndicatorProps) {
    if (isLoading) {
        return (
            <div className={cn("p-4 rounded-xl border bg-slate-50 animate-pulse flex items-center gap-3", className)}>
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className={cn("p-4 rounded-xl border border-dashed bg-slate-50 flex items-center gap-3 text-muted-foreground", className)}>
                <ShieldQuestion className="h-5 w-5" />
                <span className="text-sm">Initiate risk analysis to preview compliance impact.</span>
            </div>
        );
    }

    const config = {
        low: {
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
            icon: ShieldCheck,
            barColor: "bg-green-500",
            label: "Low Risk"
        },
        medium: {
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-100",
            icon: Info,
            barColor: "bg-yellow-500",
            label: "Medium Risk"
        },
        high: {
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100",
            icon: AlertTriangle,
            barColor: "bg-orange-500",
            label: "High Risk"
        },
        critical: {
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
            icon: ShieldAlert,
            barColor: "bg-red-500",
            label: "Critical Risk"
        }
    };

    const { color, bg, border, icon: Icon, barColor, label } = config[analysis.level];

    return (
        <div className={cn("rounded-xl border shadow-sm overflow-hidden bg-white", className)}>
            <div className={cn("px-4 py-3 flex items-center justify-between border-b", bg, border)}>
                <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", color)} />
                    <span className={cn("font-bold text-sm uppercase tracking-wider", color)}>
                        {label}
                    </span>
                </div>
                <Badge variant="outline" className={cn("font-mono bg-white/50", color)}>
                    Score: {analysis.score}/100
                </Badge>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Compliance Confidence</span>
                        <span>{100 - analysis.score}%</span>
                    </div>
                    <Progress value={100 - analysis.score} className="h-2" indicatorClassName={barColor} />
                </div>

                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                        Risk Justification
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-[10px] max-w-[200px]">These factors contribute to the overall compliance risk score based on heuristic analysis.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4 italic">
                        {analysis.justification.map((j, i) => (
                            <li key={i} className="text-xs text-slate-600 leading-relaxed">
                                {j}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
