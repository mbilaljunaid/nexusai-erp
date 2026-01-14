
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardTable, type ColumnDef } from "@/components/ui/StandardTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RevenueRuleManager() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Dialog States
    const [isIdDialogOpen, setIsIdDialogOpen] = useState(false);
    const [isPobDialogOpen, setIsPobDialogOpen] = useState(false);

    // Form States
    const [newIdRule, setNewIdRule] = useState({ name: "", description: "", priority: "1", groupingCriteria: "[]" });
    const [newPobRule, setNewPobRule] = useState({
        name: "", description: "", priority: "1",
        attributeName: "", attributeValue: "",
        pobName: "", satisfactionMethod: "Ratable", defaultDurationMonths: "12"
    });

    // --- Queries ---
    const { data: idRules, isLoading: idLoading } = useQuery({
        queryKey: ["revenueIdRules"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/rules/identification");
            if (!res.ok) throw new Error("Failed to fetch ID rules");
            return res.json();
        }
    });

    const { data: pobRules, isLoading: pobLoading } = useQuery({
        queryKey: ["revenuePobRules"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/rules/pob");
            if (!res.ok) throw new Error("Failed to fetch POB rules");
            return res.json();
        }
    });

    // --- Mutations ---
    const createIdRuleMutation = useMutation({
        mutationFn: async (data: typeof newIdRule) => {
            const res = await fetch("/api/revenue/rules/identification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    groupingCriteria: JSON.parse(data.groupingCriteria || "[]")
                })
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Identification Rule created." });
            queryClient.invalidateQueries({ queryKey: ["revenueIdRules"] });
            setIsIdDialogOpen(false);
            setNewIdRule({ name: "", description: "", priority: "1", groupingCriteria: "[]" });
        },
        onError: () => toast({ title: "Error", description: "Failed to create rule", variant: "destructive" })
    });

    const createPobRuleMutation = useMutation({
        mutationFn: async (data: typeof newPobRule) => {
            const res = await fetch("/api/revenue/rules/pob", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "POB Rule created." });
            queryClient.invalidateQueries({ queryKey: ["revenuePobRules"] });
            setIsPobDialogOpen(false);
            setNewPobRule({
                name: "", description: "", priority: "1",
                attributeName: "", attributeValue: "",
                pobName: "", satisfactionMethod: "Ratable", defaultDurationMonths: "12"
            });
        },
        onError: () => toast({ title: "Error", description: "Failed to create rule", variant: "destructive" })
    });

    // --- Columns ---
    const idRuleColumns: ColumnDef<any>[] = [
        { header: "Name", accessorKey: "name", cell: (info) => <span className="font-medium">{info.getValue()}</span> },
        { header: "Priority", accessorKey: "priority" },
        {
            header: "Grouping Criteria",
            accessorKey: "groupingCriteria",
            cell: (info) => (
                <div className="flex gap-1">
                    {(info.getValue() as string[]).map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                </div>
            )
        },
        { header: "Status", accessorKey: "status", cell: (info) => <Badge>{info.getValue()}</Badge> }
    ];

    const pobRuleColumns: ColumnDef<any>[] = [
        { header: "Name", accessorKey: "name", cell: (info) => <span className="font-medium">{info.getValue()}</span> },
        { header: "Condition", cell: (info) => <span>If {info.row.original.attributeName} = {info.row.original.attributeValue}</span> },
        { header: "POB Name", accessorKey: "pobName" },
        { header: "Method", accessorKey: "satisfactionMethod" },
        { header: "Duration", accessorKey: "defaultDurationMonths", cell: (info) => `${info.getValue()} mo` },
        { header: "Priority", accessorKey: "priority" }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Rules</h1>
                    <p className="text-muted-foreground mt-1">Configure Contract Identification and Performance Obligation rules.</p>
                </div>
            </div>

            <Tabs defaultValue="pob" className="w-full">
                <TabsList>
                    <TabsTrigger value="pob">POB Identification</TabsTrigger>
                    <TabsTrigger value="identification">Contract Identification</TabsTrigger>
                </TabsList>

                {/* POB Rules Tab */}
                <TabsContent value="pob" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isPobDialogOpen} onOpenChange={setIsPobDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> New POB Rule</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create POB Rule</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label>Rule Name</Label>
                                        <Input value={newPobRule.name} onChange={(e) => setNewPobRule({ ...newPobRule, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>If Attribute Name</Label>
                                        <Input value={newPobRule.attributeName} onChange={(e) => setNewPobRule({ ...newPobRule, attributeName: e.target.value })} placeholder="e.g. itemType" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Equals Value</Label>
                                        <Input value={newPobRule.attributeValue} onChange={(e) => setNewPobRule({ ...newPobRule, attributeValue: e.target.value })} placeholder="e.g. Service" />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Then Use POB Name</Label>
                                        <Input value={newPobRule.pobName} onChange={(e) => setNewPobRule({ ...newPobRule, pobName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Satisfaction Method</Label>
                                        <Input value={newPobRule.satisfactionMethod} onChange={(e) => setNewPobRule({ ...newPobRule, satisfactionMethod: e.target.value })} placeholder="Ratable" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (Months)</Label>
                                        <Input type="number" value={newPobRule.defaultDurationMonths} onChange={(e) => setNewPobRule({ ...newPobRule, defaultDurationMonths: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Input type="number" value={newPobRule.priority} onChange={(e) => setNewPobRule({ ...newPobRule, priority: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={() => createPobRuleMutation.mutate(newPobRule)}>Create Rule</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>POB Identification Rules</CardTitle>
                            <CardDescription>Rules to determine Performance Obligations from source lines.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pobLoading ? <Skeleton className="h-48" /> : <StandardTable data={pobRules || []} columns={pobRuleColumns} />}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Identification Rules Tab */}
                <TabsContent value="identification" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isIdDialogOpen} onOpenChange={setIsIdDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> New ID Rule</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Identification Rule</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Rule Name</Label>
                                        <Input value={newIdRule.name} onChange={(e) => setNewIdRule({ ...newIdRule, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grouping Criteria (JSON Array)</Label>
                                        <Input value={newIdRule.groupingCriteria} onChange={(e) => setNewIdRule({ ...newIdRule, groupingCriteria: e.target.value })} placeholder='["customerId", "referenceNumber"]' />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Input type="number" value={newIdRule.priority} onChange={(e) => setNewIdRule({ ...newIdRule, priority: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={() => createIdRuleMutation.mutate(newIdRule)}>Create Rule</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Identification Rules</CardTitle>
                            <CardDescription>Rules to group source events into contracts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {idLoading ? <Skeleton className="h-48" /> : <StandardTable data={idRules || []} columns={idRuleColumns} />}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
