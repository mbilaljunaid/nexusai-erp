import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Plus, Eye } from "lucide-react";

export default function ReferenceDataList() {
    const [location, setLocation] = useLocation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Lookup Types
    const { data: lookupTypes = [], isLoading } = useQuery({
        queryKey: ["/api/mdm/lookups"],
    });

    // Table Columns
    const columns = [
        { header: "Lookup Type", accessorKey: "lookupType", sortable: true },
        { header: "Display Name", accessorKey: "userLookupName", sortable: true },
        {
            header: "Level", accessorKey: "customizationLevel", cell: (row: any) => (
                <span className={`px-2 py-1 rounded text-xs ${row.customizationLevel === 'S' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {row.customizationLevel === 'S' ? 'System' : 'User'}
                </span>
            )
        },
        { header: "Description", accessorKey: "description" },
        {
            header: "Actions", id: "actions", cell: (row: any) => (
                <Button variant="ghost" size="sm" onClick={() => setLocation(`/mdm/reference-data/${row.id}`)}>
                    <Eye className="h-4 w-4 mr-2" /> View Values
                </Button>
            )
        }
    ];

    // Create Mutation
    const [newType, setNewType] = useState({ lookupType: "", userLookupName: "", description: "", customizationLevel: "U" });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/mdm/lookups/types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/lookups"] });
            setIsSheetOpen(false);
            setNewType({ lookupType: "", userLookupName: "", description: "", customizationLevel: "U" });
            toast({ title: "Success", description: "Lookup Type created successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleCreate = () => {
        if (!newType.lookupType || !newType.userLookupName) {
            toast({ title: "Validation Error", description: "Code and Name are required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newType);
    };

    return (
        <StandardPage
            title="Reference Data Management"
            description="Manage System Lookups, Value Sets, and Codes"
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Reference Data" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Lookup Type</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create Lookup Type</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                            <div>
                                <Label>Lookup Type Code</Label>
                                <Input
                                    placeholder="e.g. HZ_PARTY_TYPE"
                                    value={newType.lookupType}
                                    onChange={(e) => setNewType({ ...newType, lookupType: e.target.value.toUpperCase() })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Unique system identifier (Upper Case)</p>
                            </div>
                            <div>
                                <Label>Display Name</Label>
                                <Input
                                    placeholder="e.g. Party Types"
                                    value={newType.userLookupName}
                                    onChange={(e) => setNewType({ ...newType, userLookupName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Customization Level</Label>
                                <Select
                                    value={newType.customizationLevel}
                                    onValueChange={(val) => setNewType({ ...newType, customizationLevel: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="U">User (Editable)</SelectItem>
                                        <SelectItem value="S">System (Locked)</SelectItem>
                                        <SelectItem value="E">Extensible (Add Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={newType.description}
                                    onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                {createMutation.isPending ? "Creating..." : "Create Lookup Type"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <Card>
                <CardContent className="p-0">
                    <StandardTable
                        data={lookupTypes}
                        columns={columns}
                        loading={isLoading}
                        filterColumn="userLookupName"
                        filterPlaceholder="Search lookup types..."
                    />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
