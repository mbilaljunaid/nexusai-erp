import React from "react";
import { CheckCircle2, Circle, AlertCircle, Clock, MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Milestone {
    id: string;
    eventName: string;
    eventCode: string;
    status: "PLANNED" | "COMPLETED" | "EXCEPTION";
    plannedDate: string | null;
    actualDate: string | null;
    location?: string;
    description?: string;
}

interface MilestoneTimelineProps {
    milestones: Milestone[];
    className?: string;
}

export function MilestoneTimeline({ milestones, className }: MilestoneTimelineProps) {
    return (
        <div className={cn("space-y-8 relative", className)}>
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted-foreground/20" />

            {milestones.map((milestone, index) => {
                const isCompleted = milestone.status === "COMPLETED";
                const isException = milestone.status === "EXCEPTION";
                const isCurrent = !isCompleted && !isException && (index === 0 || milestones[index - 1].status === "COMPLETED");

                return (
                    <div key={milestone.id} className="relative pl-10">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center bg-background border-2 z-10",
                            isCompleted ? "border-emerald-500 text-emerald-500" :
                                isException ? "border-amber-500 text-amber-500" :
                                    isCurrent ? "border-blue-500 text-blue-500 animate-pulse" : "border-muted-foreground/30 text-muted-foreground/30"
                        )}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> :
                                isException ? <AlertCircle className="h-4 w-4" /> :
                                    isCurrent ? <Clock className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <h4 className={cn("font-semibold text-sm", isCurrent ? "text-blue-600" : "text-foreground")}>
                                    {milestone.eventName}
                                </h4>
                                {milestone.actualDate ? (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {new Date(milestone.actualDate).toLocaleString()}
                                    </span>
                                ) : milestone.plannedDate && (
                                    <span className="text-[10px] text-muted-foreground font-mono italic">
                                        Planned: {new Date(milestone.plannedDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 overflow-hidden">
                                {milestone.location && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {milestone.location}
                                    </div>
                                )}
                                {isException && (
                                    <Badge variant="warning" className="text-[10px] h-4">Exception Detected</Badge>
                                )}
                            </div>

                            {milestone.description && (
                                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded mt-1">
                                    {milestone.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
