import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function APWithholdingTax() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [isRateOpen, setIsRateOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const [newGroup, setNewGroup] = useState({ groupName: "", description: "" });
    const [newRate, setNewRate] = useState({ taxRateName: "", ratePercent: "", priority: "1" });

    const { data: groups, isLoading: groupsLoading } = useQuery<any>({
        queryKey: ["/api/ap/wht-groups"],
        queryFn: () => fetch("/api/ap/wht-groups").then((res) => res.json()),
    });

    const { data: rates, isLoading: ratesLoading } = useQuery<any>({
        queryKey: ["/api/ap/wht-groups", selectedGroupId, "rates"],
        queryFn: () => fetch(`/api/ap/wht-groups/${selectedGroupId}/rates`).then((res) => res.json()),
        enabled: !!selectedGroupId,
    });

    const createGroupMutation = useMutation({
        mutationFn: (data: typeof newGroup) =>
            fetch("/api/ap/wht-groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to create group");
                return res.json();
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/wht-groups"] });
            setNewGroup({ groupName: "", description: "" });
            setIsGroupOpen(false);
            toast({ title: "Tax Group created successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const createRateMutation = useMutation({
        mutationFn: (data: typeof newRate) =>
            fetch(`/api/ap/wht-groups/${selectedGroupId}/rates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to create rate");
                return res.json();
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/wht-groups", selectedGroupId, "rates"] });
            setNewRate({ taxRateName: "", ratePercent: "", priority: "1" });
            setIsRateOpen(false);
            toast({ title: "Tax Rate added successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    return (
        <StandardPage
            title="Withholding Tax (WHT) Groups"
            description="Manage multi-tier withholding tax groups and calculate priority-based cascading rates."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Tax Groups</CardTitle>
                            <CardDescription>Logical groupings for supplier WHT rates</CardDescription>
                        </div>
                        <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Add Group
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create WHT Group</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="groupName">Group Name</Label>
                                        <Input
                                            id="groupName"
                                            placeholder="e.g. US BACKUP WHT, FR PROFESSIONAL"
                                            value={newGroup.groupName}
                                            onChange={(e) => setNewGroup({ ...newGroup, groupName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={newGroup.description}
                                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsGroupOpen(false)}>Cancel</Button>
                                    <Button onClick={() => createGroupMutation.mutate(newGroup)}>Create Group</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Group Name</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groups?.map((g: any) => (
                                    <TableRow
                                        key={g.id}
                                        className={cn(`cursor-pointer ${selectedGroupId === g.id ? 'bg-muted' : ''}`)}
                                        onClick={() => setSelectedGroupId(g.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                    >
                                        <TableCell className="font-medium">{g.groupName}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={g.enabledFlag ? 'Enabled' : 'Disabled'} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!groups?.length && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                                            No tax groups configured.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Priority-Based Rates</CardTitle>
                            <CardDescription>Multi-tier brackets for the selected group</CardDescription>
                        </div>
                        <Dialog open={isRateOpen} onOpenChange={setIsRateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" disabled={!selectedGroupId}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Rate Bracket
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Tax Rate</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="taxRateName">Rate Name</Label>
                                        <Input
                                            id="taxRateName"
                                            placeholder="e.g. Standard 20%, State 5%"
                                            value={newRate.taxRateName}
                                            onChange={(e) => setNewRate({ ...newRate, taxRateName: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ratePercent">Rate (%)</Label>
                                            <Input
                                                id="ratePercent"
                                                type="number"
                                                step="0.01"
                                                placeholder="20.00"
                                                value={newRate.ratePercent}
                                                onChange={(e) => setNewRate({ ...newRate, ratePercent: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Evaluation Priority</Label>
                                            <Input
                                                id="priority"
                                                type="number"
                                                min="1"
                                                value={newRate.priority}
                                                onChange={(e) => setNewRate({ ...newRate, priority: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Priority defines the order of distribution calculations (1 is highest priority).
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsRateOpen(false)}>Cancel</Button>
                                    <Button onClick={() => createRateMutation.mutate(newRate)}>Add Rate</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {selectedGroupId ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Rate Name</TableHead>
                                        <TableHead className="text-right">Rate (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rates?.map((r: any) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium text-blue-600">Step {r.priority}</TableCell>
                                            <TableCell>{r.taxRateName}</TableCell>
                                            <TableCell className="text-right">{Number(r.ratePercent).toFixed(2)}%</TableCell>
                                        </TableRow>
                                    ))}
                                    {!rates?.length && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                No rates configured for this group.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-500/10 border rounded-md">
                                <p className="text-muted-foreground">Select a tax group on the left to manage its rates.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
