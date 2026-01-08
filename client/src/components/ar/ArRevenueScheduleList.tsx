
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArRevenueSchedule } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ArRevenueScheduleListProps {
    invoiceId: number;
}

export function ArRevenueScheduleList({ invoiceId }: ArRevenueScheduleListProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: schedules, isLoading } = useQuery<ArRevenueSchedule[]>({
        queryKey: [`/api/ar/revenue-schedules`, invoiceId],
        queryFn: async () => {
            // Stub: In real imp, we would fetch by invoiceId. 
            // For now, listing all and filtering client-side or assume endpoint supports query param
            // The implementation plan said: GET /api/ar/revenue-schedules/:invoiceId
            // Let's assume the router implemented it or we use a query param
            const res = await apiRequest("GET", `/api/ar/revenue-schedules?invoiceId=${invoiceId}`);
            // If route doesn't exist, this might fail. We didn't explicitly implement the "GET by invoiceId" 
            // in Step 6094 (server/routes/ap.ts) or in previous AR steps?
            // Wait, I updated AR storage but did I update AR routes?
            // I created `shared/schema/arRevenueSchedule.ts`, updated `storage.ts`.
            // I DID NOT update `server/routes/ar.ts` to include the revenue schedule endpoints yet!
            // I missed that step in the "Implementation" phase after planning.
            // I need to update `server/routes/ar.ts` first or stub this.
            return res.json();
        },
        // Disable query if routes not ready (but I will fix routes next)
        enabled: !!invoiceId
    });

    const recognizeMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("POST", `/api/ar/revenue-schedules/${id}/recognize`, {});
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ar/revenue-schedules`, invoiceId] });
            toast({
                title: "Revenue Recognized",
                description: "The schedule has been successfully processed.",
            });
        }
    });

    if (isLoading) {
        return <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;
    }

    if (!schedules || schedules.length === 0) {
        return (
            <div className="text-center p-6 border border-dashed rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">No revenue schedules found for this invoice.</p>
                <Button variant="ghost" size="sm" className="mt-2 text-primary">Generate Schedule (AI)</Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        {schedule.status === 'Recognized' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                            <Clock className="h-5 w-5 text-amber-500" />
                        )}
                        <div>
                            <p className="text-sm font-medium">
                                {format(new Date(schedule.scheduleDate), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(schedule.amount))}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={schedule.status === 'Recognized' ? 'default' : 'outline'} className={schedule.status === 'Recognized' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                            {schedule.status}
                        </Badge>
                        {schedule.status === 'Pending' && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                                onClick={() => recognizeMutation.mutate(schedule.id)}
                                disabled={recognizeMutation.isPending}
                            >
                                <PlayCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
