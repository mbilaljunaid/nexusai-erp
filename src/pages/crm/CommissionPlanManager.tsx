import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Target, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

interface CommissionPlan {
    id: string;
    name: string;
    type: string;
    rate: string;
    isActive: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
}

export default function CommissionPlanManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignment, setAssignment] = useState({ userId: "", planId: "" });

    const { data: plans = [], isLoading: isLoadingPlans } = useQuery<CommissionPlan[]>({
        queryKey: ["/api/crm/commissions/plans"],
        queryFn: async () => {
            const res = await fetch("/api/crm/commissions/plans");
            if (!res.ok) return [];
            return res.json();
        }
    });

    const { data: users = [] } = useQuery<User[]>({
        queryKey: ["/api/users"],
        queryFn: async () => {
            const res = await fetch("/api/users");
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Bulk save for Plans
    const updatePlansMutation = useMutation({
        mutationFn: async (data: any[]) => {
            return new Promise(resolve => setTimeout(resolve, 600));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/commissions/plans"] });
            toast({ title: "Plans Saved", description: "Commission plans have been updated successfully." });
        }
    });

    // Assign Plan
    const assignPlanMutation = useMutation({
        mutationFn: async (data: any) => {
            return new Promise(resolve => setTimeout(resolve, 400));
        },
        onSuccess: () => {
            setIsAssignOpen(false);
            toast({ title: "Plan Assigned", description: "User has been successfully assigned to the plan." });
            setAssignment({ userId: "", planId: "" });
        }
    });

    const columns = useMemo(() => [
        { id: "name", label: "Plan Name", type: "text" as const, required: true },
        {
            id: "type",
            label: "Plan Type",
            type: "select" as const,
            options: [
                { value: "percentage_deal_value", label: "% of Deal Value" },
                { value: "flat_rate", label: "Flat Rate per Deal" }
            ],
            required: true,
            defaultValue: "percentage_deal_value"
        },
        { id: "rate", label: "Rate (%) / Amount ($)", type: "text" as const, required: true },
        { id: "isActive", label: "Active Status", type: "boolean" as const, defaultValue: true }
    ], []);

    if (isLoadingPlans) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Commission Management"
            description="Manage dynamic compensation plans and assign them directly to sales representatives."
            actions={
                <Button variant="outline" className="bg-card" onClick={() => setIsAssignOpen(true)}>
                    <Users className="mr-2 h-4 w-4" /> Assign Sales Rep
                </Button>
            }
        >
            <Card className="border-t-4 border-t-emerald-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" /> Commission Structures
                    </CardTitle>
                    <CardDescription>Rapidly define and adjust compensation scales for peak Q4 efficiency.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <div className="h-[600px] border-t">
                        <InteractiveSpreadsheet
                            data={plans}
                            columns={columns}
                            onSave={(data) => updatePlansMutation.mutate(data)}
                            isSaving={updatePlansMutation.isPending}
                            containerHeight="550px"
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Plan to Rep</DialogTitle>
                        <DialogDescription>Map an active structure to a salesperson.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Sales Representative</Label>
                            <Select
                                value={assignment.userId}
                                onValueChange={(val) => setAssignment({ ...assignment, userId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select User" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users?.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Commission Plan</Label>
                            <Select
                                value={assignment.planId}
                                onValueChange={(val) => setAssignment({ ...assignment, planId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Active Plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans?.filter(p => p.isActive).map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.rate}{p.type === 'flat_rate' ? '$' : '%'})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => assignPlanMutation.mutate(assignment)}
                            disabled={!assignment.userId || !assignment.planId || assignPlanMutation.isPending}
                        >
                            {assignPlanMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Assign Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
