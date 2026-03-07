import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Clock, XCircle} from"lucide-react";
import { Button} from"@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle} from"@/components/ui/card";
import { useMutation, useQueryClient} from"@tanstack/react-query";
import { useToast} from"@/hooks/use-toast";
import { apiRequest} from"@/lib/queryClient";

interface ApprovalTimelineProps {
    leaseId: string;
    status:"DRAFT" |"PENDING_APPROVAL" |"ACTIVE" |"REJECTED" |"TERMINATED" |"CLOSED";
    history?: any[]; // For future audit log enhancement
}

export function ApprovalTimeline({ leaseId, status}: ApprovalTimelineProps) {
    const { toast} = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (action:"submit" |"approve" |"reject") => {
            const res = await apiRequest("POST",`/api/lease/leases/${leaseId}/${action}`);
            return res.json();
       },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`lease`, leaseId]});
            toast({ title:"Status Updated", description:"Lease workflow status has been updated."});
       },
        onError: (err: any) => {
            toast({ title:"Action Failed", description: err.message, variant:"destructive"});
       }
   });

    const steps = [
        { status:"DRAFT", label:"Draft Creation", icon: Circle},
        { status:"PENDING_APPROVAL", label:"Pending Approval", icon: Clock},
        { status:"ACTIVE", label:"Active", icon: CheckCircle},
    ];

    const currentStepIndex = steps.findIndex(s => s.status === status);
    // Simple mapping for visual progress if status is REJECTED or other end states
    const activeIndex = status ==="REJECTED" ? 1 : (status ==="TERMINATED" || status ==="CLOSED") ? 3 : currentStepIndex;

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Approval Workflow</CardTitle>
                    <div className="space-x-2">
                        {status ==="DRAFT" && (
                            <Button size="sm" onClick={() => mutation.mutate("submit")} disabled={mutation.isPending}>
                                Submit for Approval
                            </Button>
                        )}
                        {status ==="PENDING_APPROVAL" && (
                            <>
                                <Button size="sm" variant="destructive" onClick={() => mutation.mutate("reject")} disabled={mutation.isPending}>
                                    Reject
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => mutation.mutate("approve")} disabled={mutation.isPending}>
                                    Approve
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative flex items-center justify-between w-full">
                    {/* Thread Line */}
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index <= activeIndex;
                        const isCurrent = index === activeIndex;

                        let iconColor ="text-gray-400 bg-white";
                        if (isActive) iconColor ="text-blue-600 bg-white";
                        if (status ==="REJECTED" && step.status ==="PENDING_APPROVAL") iconColor ="text-red-500 bg-white";

                        return (
                            <div key={step.status} className="flex flex-col items-center bg-white px-2">
                                <Icon className={cn(`h-8 w-8 ${iconColor} border-2 rounded-full p-1 transition-all duration-300 ${isCurrent ?'ring-4 ring-blue-100' :''}`)} />
                                <span className={cn(`text-xs font-medium mt-2 ${isActive ?'text-foreground' :'text-muted-foreground'}`)}>
                                    {step.label}
                                </span>
                            </div>
                        );
                   })}
                </div>
                {status ==="REJECTED" && (
                    <div className="mt-4 p-2 bg-red-500/10 text-red-800 text-sm rounded border border-red-200">
                        <strong>Status: Rejected.</strong> Please review terms and re-submit.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
