import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WorkCenter {
    id: string;
    name: string;
    description: string;
    capacity: number;
    calendarId?: string; // L8 Integration
    status: "active" | "inactive" | "maintenance";
}

interface Calendar {
    id: string;
    calendarCode: string;
    description?: string;
}

export default function WorkCenterManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState<Partial<WorkCenter> | null>(null);

    const { data: centers = [], isLoading } = useQuery<WorkCenter[]>({
        queryKey: ["/api/manufacturing/work-centers"],
    });

    const { data: calendars = [] } = useQuery<Calendar[]>({
        queryKey: ["/api/manufacturing/calendars"],
    });

    const mutation = useMutation({
        mutationFn: async (data: Partial<WorkCenter>) => {
            const res = await fetch("/api/manufacturing/work-centers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save work center");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/work-centers"] });
            setIsSheetOpen(false);
            setEditingCenter(null);
            toast({ title: "Success", description: "Work center saved successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const columns: Column<WorkCenter>[] = [
        {
            header: "Name",
            accessorKey: "name",
            cell: (row: WorkCenter) => <span className="font-semibold">{row.name}</span>
        },
        {
            header: "Description",
            accessorKey: "description",
        },
        {
            header: "Capacity",
            accessorKey: "capacity",
            cell: (row: WorkCenter) => <span className="font-mono">{row.capacity} units/day</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: WorkCenter) => {
                const colors = {
                    active: "default",
                    inactive: "secondary",
                    maintenance: "destructive"
                } as const;
                return <Badge variant={colors[row.status] || "secondary"} className="capitalize">{row.status}</Badge>;
            }
        },
        {
            header: "Actions",
            cell: (row: WorkCenter) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                        setEditingCenter(row);
                        setIsSheetOpen(true);
                    }}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            capacity: parseInt(formData.get("capacity") as string),
            calendarId: formData.get("calendarId") as string,
            status: formData.get("status") as any || "active"
        };
        mutation.mutate(data);
    };

    return (
        <StandardPage
            title="Work Center Management"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Setup" }, { label: "Work Centers" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setEditingCenter(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Work Center
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{editingCenter ? 'Edit' : 'Add'} Work Center</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Work Center Name</Label>
                                <Input id="name" name="name" defaultValue={editingCenter?.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" defaultValue={editingCenter?.description} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity (units/day)</Label>
                                <Input id="capacity" name="capacity" type="number" defaultValue={editingCenter?.capacity} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="calendarId">Production Calendar</Label>
                                <Select name="calendarId" defaultValue={editingCenter?.calendarId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select calendar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {calendars.map((cal) => (
                                            <SelectItem key={cal.id} value={cal.id}>
                                                {cal.calendarCode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? "Saving..." : "Save Work Center"}
                            </Button>
                        </form>
                    </SheetContent>
                </Sheet>
            }
        >
            <StandardTable
                data={centers}
                columns={columns}
                isLoading={isLoading}
                keyExtractor={(item) => item.id}
                filterColumn="name"
                filterPlaceholder="Filter by work center name..."
            />
        </StandardPage>
    );
}
