
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Settings, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    // Form States
    const [newPlan, setNewPlan] = useState({ name: "", type: "percentage_deal_value", rate: "" });
    const [assignment, setAssignment] = useState({ userId: "", planId: "" });

    // Fetch Plans
    const { data: plans, isLoading: isLoadingPlans } = useQuery<CommissionPlan[]>({
        queryKey: ["/api/crm/commissions/plans"],
    });

    // Fetch Users (for assignment) - Assuming we have a users endpoint or similar
    const { data: users } = useQuery<User[]>({
        queryKey: ["/api/users"], // Adjust endpoint if needed
    });

    // Mutations
    const createPlanMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/commissions/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/commissions/plans"] });
            setIsCreateOpen(false);
            toast({ title: "Plan Created", description: "New commission plan has been added." });
            setNewPlan({ name: "", type: "percentage_deal_value", rate: "" });
        }
    });

    const assignPlanMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/commissions/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            setIsAssignOpen(false);
            toast({ title: "Plan Assigned", description: "User has been assigned to the new plan." });
            setAssignment({ userId: "", planId: "" });
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Commission Management</h1>
                    <p className="text-muted-foreground mt-2">Manage compensation plans and assign them to sales representatives.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
                        <Users className="mr-2 h-4 w-4" /> Assign to User
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Plan
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Commission Plans</CardTitle>
                    <CardDescription>Active compensation structures available for assignment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Rate / Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingPlans ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Loading plans...</TableCell>
                                </TableRow>
                            ) : plans?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No plans defined. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans?.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {plan.type === 'percentage_deal_value' ? '% Deal Value' : 'Flat Rate'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {plan.type === 'percentage_deal_value' ? `${plan.rate}%` : `$${plan.rate}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={plan.isActive ? "default" : "secondary"}>
                                                {plan.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Plan Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Commission Plan</DialogTitle>
                        <DialogDescription>Define a new compensation structure.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Plan Name</Label>
                            <Input
                                placeholder="e.g. Q4 Accelerator"
                                value={newPlan.name}
                                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={newPlan.type}
                                    onValueChange={(val) => setNewPlan({ ...newPlan, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage_deal_value">% of Deal Value</SelectItem>
                                        <SelectItem value="flat_rate">Flat Rate per Deal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Rate / Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 10"
                                    value={newPlan.rate}
                                    onChange={(e) => setNewPlan({ ...newPlan, rate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createPlanMutation.mutate(newPlan)} disabled={!newPlan.name || !newPlan.rate}>
                            Create Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Plan Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Plan to User</DialogTitle>
                        <DialogDescription>Select a sales representative and a plan.</DialogDescription>
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
                                    <SelectValue placeholder="Select Plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans?.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.rate}{p.type === 'flat_rate' ? '$' : '%'})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                        <Button onClick={() => assignPlanMutation.mutate(assignment)} disabled={!assignment.userId || !assignment.planId}>
                            Assign Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
