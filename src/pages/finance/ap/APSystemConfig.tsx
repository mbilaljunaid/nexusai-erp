import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Calendar, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function APSystemConfig() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [distSetDialogOpen, setDistSetDialogOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [distSetForm, setDistSetForm] = useState({
        businessUnitId: "",
        name: "",
        description: "",
        defaultAccount: ""
    });

    // System Parameters
    const { data: systemParams, isLoading: paramsLoading } = useQuery({
        queryKey: ["/api/ap/system-parameters"],
        queryFn: () => fetch("/api/ap/system-parameters").then(r => r.json())
    });

    const [params, setParams] = useState({
        defaultBusinessUnit: systemParams?.defaultBusinessUnit || "BU_US",
        defaultPaymentTerms: systemParams?.defaultPaymentTerms || "Net 30",
        autoValidation: systemParams?.autoValidation || false,
        requirePOMatch: systemParams?.requirePOMatch || false,
        allowPrepayments: systemParams?.allowPrepayments || true
    });

    const updateParamsMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/system-parameters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/system-parameters"] });
            toast({ title: "System parameters updated" });
        }
    });

    // Distribution Sets
    const { data: distSets, isLoading: distSetsLoading } = useQuery({
        queryKey: ["/api/ap/distribution-sets"],
        queryFn: () => fetch("/api/ap/distribution-sets").then(r => r.json())
    });

    const createDistSetMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/distribution-sets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/distribution-sets"] });
            setDistSetDialogOpen(false);
            toast({ title: "Distribution set created" });
        }
    });

    // AP Periods
    const { data: periods, isLoading: periodsLoading } = useQuery({
        queryKey: ["/api/ap/periods"],
        queryFn: () => fetch("/api/ap/periods").then(r => r.json())
    });

    const closePeriodMutation = useMutation({
        mutationFn: (periodId: string) =>
            fetch(`/api/ap/periods/${periodId}/close`, {
                method: "POST"
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/periods"] });
            toast({ title: "Period closed successfully" });
        }
    });

    const distSetColumns: Column<any>[] = [
        { header: "BU", accessorKey: "businessUnitId", className: "text-muted-foreground font-mono text-xs w-20", cell: (row) => row.businessUnitId || "Default" },
        { header: "Name", accessorKey: "name", className: "font-medium" },
        { header: "Description", accessorKey: "description" },
        { header: "Default Account", accessorKey: "defaultAccount", className: "font-mono" }
    ];

    const periodColumns: Column<any>[] = [
        { header: "Period Name", accessorKey: "periodName", className: "font-medium" },
        {
            header: "Start Date",
            accessorKey: "startDate",
            cell: (row) => new Date(row.startDate).toLocaleDateString()
        },
        {
            header: "End Date",
            accessorKey: "endDate",
            cell: (row) => new Date(row.endDate).toLocaleDateString()
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <Badge variant={row.status === "Open" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: (row) => (
                row.status === "Open" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            closePeriodMutation.mutate(row.id);
                        }}
                    >
                        <Lock className="h-4 w-4 mr-1" />
                        Close Period
                    </Button>
                )
            )
        }
    ];

    return (
        <StandardPage
            title="AP System Configuration"
            description="System parameters, distribution sets, and period control"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Configuration" }
            ]}
        >
            <Tabs defaultValue="parameters" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="parameters">System Parameters</TabsTrigger>
                    <TabsTrigger value="distribution">Distribution Sets</TabsTrigger>
                    <TabsTrigger value="periods">Period Control</TabsTrigger>
                </TabsList>

                {/* System Parameters Tab */}
                <TabsContent value="parameters">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Parameters</CardTitle>
                            <CardDescription>Configure AP module defaults and behaviors</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="defaultBusinessUnit">Default Business Unit</Label>
                                    <Select value={params.defaultBusinessUnit} onValueChange={(v) => setParams({ ...params, defaultBusinessUnit: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Default BU" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BU_US">US Operations</SelectItem>
                                            <SelectItem value="BU_EU">EU Operations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
                                    <Input
                                        id="defaultPaymentTerms"
                                        value={params.defaultPaymentTerms}
                                        onChange={(e) => setParams({ ...params, defaultPaymentTerms: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="autoValidation">Auto-Validation</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="autoValidation"
                                            checked={params.autoValidation}
                                            onChange={(e) => setParams({ ...params, autoValidation: e.target.checked })}
                                            className="h-4 w-4"
                                            title="Auto-validation setting"
                                        />
                                        <span className="text-sm">Enable automatic invoice validation</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="requirePOMatch">Require PO Match</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="requirePOMatch"
                                            checked={params.requirePOMatch}
                                            onChange={(e) => setParams({ ...params, requirePOMatch: e.target.checked })}
                                            className="h-4 w-4"
                                            title="Require PO match setting"
                                        />
                                        <span className="text-sm">Require PO matching for approval</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="allowPrepayments">Allow Prepayments</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="allowPrepayments"
                                            checked={params.allowPrepayments}
                                            onChange={(e) => setParams({ ...params, allowPrepayments: e.target.checked })}
                                            className="h-4 w-4"
                                            title="Allow prepayments setting"
                                        />
                                        <span className="text-sm">Enable prepayment functionality</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => updateParamsMutation.mutate(params)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Save Parameters
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Distribution Sets Tab */}
                <TabsContent value="distribution">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Distribution Sets</CardTitle>
                                    <CardDescription>Accounting distribution templates</CardDescription>
                                </div>
                                <Button onClick={() => setDistSetDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Set
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={distSets || []}
                                columns={distSetColumns}
                                totalItems={distSets?.length || 0}
                                page={page}
                                onPageChange={setPage}
                                pageSize={pageSize}
                                isLoading={distSetsLoading}
                                filterColumn="name"
                                filterPlaceholder="Search sets..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Period Control Tab */}
                <TabsContent value="periods">
                    <Card>
                        <CardHeader>
                            <CardTitle>AP Period Control</CardTitle>
                            <CardDescription>Manage accounting periods and period close</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={periods || []}
                                columns={periodColumns}
                                totalItems={periods?.length || 0}
                                page={1}
                                onPageChange={() => { }}
                                pageSize={100}
                                isLoading={periodsLoading}
                                filterColumn="periodName"
                                filterPlaceholder="Search periods..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Distribution Set Dialog */}
            <Dialog open={distSetDialogOpen} onOpenChange={setDistSetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Distribution Set</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessUnit">Business Unit *</Label>
                            <Select value={distSetForm.businessUnitId} onValueChange={(v) => setDistSetForm({ ...distSetForm, businessUnitId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Business Unit" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BU_US">US Operations</SelectItem>
                                    <SelectItem value="BU_EU">EU Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={distSetForm.name}
                                onChange={(e) => setDistSetForm({ ...distSetForm, name: e.target.value })}
                                placeholder="Standard Distribution"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={distSetForm.description}
                                onChange={(e) => setDistSetForm({ ...distSetForm, description: e.target.value })}
                                placeholder="Default accounting distribution"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defaultAccount">Default Account</Label>
                            <Input
                                id="defaultAccount"
                                value={distSetForm.defaultAccount}
                                onChange={(e) => setDistSetForm({ ...distSetForm, defaultAccount: e.target.value })}
                                placeholder="2000-000-0000"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDistSetDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => createDistSetMutation.mutate(distSetForm)}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
