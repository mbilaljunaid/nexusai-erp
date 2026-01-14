import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Resource {
    id: string;
    resourceCode: string;
    name: string;
    type: "LABOR" | "MACHINE" | "TOOL";
    status: "active" | "inactive";
    capacityPerHour: number;
    costPerHour: number;
}

export default function ResourceManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);

    const { data: resources = [], isLoading } = useQuery<Resource[]>({
        queryKey: ["/api/manufacturing/resources"],
    });

    const mutation = useMutation({
        mutationFn: async (data: Partial<Resource>) => {
            const res = await fetch("/api/manufacturing/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save resource");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/resources"] });
            setIsSheetOpen(false);
            toast({ title: "Success", description: "Resource saved successfully" });
        }
    });

    const columns: Column<Resource>[] = [
        {
            header: "Code",
            accessorKey: "resourceCode",
            cell: (row: Resource) => <span className="font-mono font-bold text-blue-600">{row.resourceCode}</span>
        },
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Type",
            accessorKey: "type",
            cell: (row: Resource) => <Badge variant="outline">{row.type}</Badge>
        },
        {
            header: "Cost/Hr",
            accessorKey: "costPerHour",
            cell: (row: Resource) => <span>${Number(row.costPerHour).toLocaleString()}</span>
        },
        {
            header: "Capacity",
            accessorKey: "capacityPerHour",
            cell: (row: Resource) => <span>{row.capacityPerHour} units/hr</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: Resource) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data: Partial<Resource> = {
            resourceCode: formData.get("resourceCode") as string,
            name: formData.get("name") as string,
            type: formData.get("type") as Resource["type"],
            capacityPerHour: parseFloat(formData.get("capacity") as string),
            costPerHour: parseFloat(formData.get("cost") as string),
            status: "active"
        };
        mutation.mutate(data);
    };

    return (
        <StandardPage
            title="Manufacturing Resources"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Setup" }, { label: "Resources" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setEditingResource(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Resource
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add Manufacturing Resource</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="resourceCode">Resource Code</Label>
                                <Input id="resourceCode" name="resourceCode" placeholder="LABOR-01" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="Skilled Assembly Tech" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select name="type" defaultValue="LABOR">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LABOR">Labor</SelectItem>
                                        <SelectItem value="MACHINE">Machine</SelectItem>
                                        <SelectItem value="TOOL">Tool</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity (units/hr)</Label>
                                    <Input id="capacity" name="capacity" type="number" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Cost ($/hr)</Label>
                                    <Input id="cost" name="cost" type="number" step="0.01" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? "Saving..." : "Save Resource"}
                            </Button>
                        </form>
                    </SheetContent>
                </Sheet>
            }
        >
            <StandardTable
                data={resources}
                columns={columns}
                isLoading={isLoading}
                keyExtractor={(item) => item.id}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
            />
        </StandardPage>
    );
}
