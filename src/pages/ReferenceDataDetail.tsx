import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { Plus, ArrowLeft } from "lucide-react";

export default function ReferenceDataDetail() {
    const [, params] = useRoute("/mdm/reference-data/:id");
    const typeId = (params as any)?.id;
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Lookup Type Header
    const { data: lookupType, isLoading: isHeaderLoading } = useQuery<any>({
        queryKey: [`/api/mdm/lookups/types/${typeId}`],
        enabled: !!typeId
    });

    // Fetch Lookup Values
    const { data: lookupValues = [], isLoading: isValuesLoading } = useQuery<any[]>({
        queryKey: [`/api/mdm/lookups/${lookupType?.lookupType}`],
        enabled: !!lookupType?.lookupType
    });

    const isLoading = isHeaderLoading || isValuesLoading;

    // Table Columns
    const columns = [
        { header: "Code", accessorKey: "lookupCode", sortable: true, cell: (row: any) => <span className="font-mono">{row.lookupCode}</span> },
        { header: "Meaning", accessorKey: "meaning", sortable: true },
        { header: "Description", accessorKey: "description" },
        {
            header: "Enabled", accessorKey: "enabledFlag", cell: (row: any) => (
                <Badge variant={row.enabledFlag ? 'default' : 'secondary'}>
                    {row.enabledFlag ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        { header: "Order", accessorKey: "sortOrder" },
    ];

    // Create Mutation
    const [newValue, setNewValue] = useState({ lookupCode: "", meaning: "", description: "", enabledFlag: true, sortOrder: 10 });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = { ...data, lookupTypeId: typeId };
            const res = await fetch("/api/mdm/lookups/values", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/mdm/lookups/${lookupType?.lookupType}`] });
            setIsSheetOpen(false);
            setNewValue({ lookupCode: "", meaning: "", description: "", enabledFlag: true, sortOrder: 10 });
            toast({ title: "Success", description: "Lookup Value created successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleCreate = () => {
        if (!newValue.lookupCode || !newValue.meaning) {
            toast({ title: "Validation Error", description: "Code and Meaning are required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newValue);
    };

    if (isLoading || !lookupType) {
        return <StandardPage title="Loading..." description=""><div className="p-10 text-center">Loading Reference Data...</div></StandardPage>;
    }

    return (
        <StandardPage
            title={lookupType.userLookupName}
            description={`${lookupType.lookupType} (${lookupType.customizationLevel === 'S' ? 'System' : 'User'})`}
            breadcrumbs={[
                { label: "MDM", href: "/mdm/governance" },
                { label: "Reference Data", href: "/mdm/reference-data" },
                { label: lookupType.lookupType }
            ]}
            actions={
                <div className="flex gap-2">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Value</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Add Lookup Value</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                                <div>
                                    <Label>Code</Label>
                                    <Input
                                        placeholder="e.g. VALUE_CODE"
                                        value={newValue.lookupCode}
                                        onChange={(e) => setNewValue({ ...newValue, lookupCode: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <Label>Meaning</Label>
                                    <Input
                                        placeholder="Display Value"
                                        value={newValue.meaning}
                                        onChange={(e) => setNewValue({ ...newValue, meaning: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={newValue.description}
                                        onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={newValue.enabledFlag}
                                        onCheckedChange={(checked) => setNewValue({ ...newValue, enabledFlag: checked })}
                                    />
                                    <Label>Enabled</Label>
                                </div>
                                <div>
                                    <Label>Sort Order</Label>
                                    <Input
                                        type="number"
                                        value={newValue.sortOrder}
                                        onChange={(e) => setNewValue({ ...newValue, sortOrder: parseInt(e.target.value) })}
                                    />
                                </div>
                                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                    {createMutation.isPending ? "Creating..." : "Create Value"}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Type ID</Label>
                            <p className="font-mono text-sm">{lookupType.id}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Application ID</Label>
                            <p className="text-sm">{lookupType.applicationId || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-muted-foreground">Description</Label>
                            <p className="text-sm">{lookupType.description || 'No description provided.'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Lookup Values</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <StandardTable
                            data={lookupValues}
                            columns={columns}
                            isLoading={isLoading}
                            filterColumn="meaning"
                            filterPlaceholder="Search values..."
                        />
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
