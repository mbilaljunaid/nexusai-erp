import React, { useState } from 'react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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


const wcSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    capacity: z.coerce.number().min(0, "Capacity must be positive"),
    calendarId: z.string().optional(),
    status: z.enum(["active", "inactive", "maintenance"]).default("active")
});

export default function WorkCenterManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState<Partial<WorkCenter> | null>(null);


    const form = useForm<z.infer<typeof wcSchema>>({
        resolver: zodResolver(wcSchema),
        defaultValues: {
            name: "",
            description: "",
            capacity: 0,
            calendarId: undefined, // undefined vs "" depending on select
            status: "active"
        }
    });

    // We can prefill when edit
    React.useEffect(() => {
        if (editingCenter) {
            form.reset({
                name: editingCenter.name || "",
                description: editingCenter.description || "",
                capacity: editingCenter.capacity || 0,
                calendarId: editingCenter.calendarId || undefined,
                status: editingCenter.status || "active"
            });
        } else {
            form.reset({
                name: "", description: "", capacity: 0, calendarId: undefined, status: "active"
            });
        }
    }, [editingCenter, form]);

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

    const columns: SpreadsheetColumn<WorkCenter>[] = [
        {
            header: "Name",
            id: "name", width: "150px",
            cell: (row: WorkCenter) => <span className="font-semibold">{row.name}</span>
        },
        {
            header: "Description",
            id: "description", width: "150px",
        },
        {
            header: "Capacity",
            id: "capacity", width: "150px",
            cell: (row: WorkCenter) => <span className="font-mono">{row.capacity} units/day</span>
        },
        {
            header: "Status",
            id: "status", width: "150px",
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

    const onSubmit = (data: z.infer<typeof wcSchema>) => {
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Work Center Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Capacity (units/day)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="calendarId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Production Calendar</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select calendar..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {calendars.map((cal) => (
                                                        <SelectItem key={cal.id} value={cal.id}>
                                                            {cal.calendarCode}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Save Work Center"}
                                </Button>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            }
        >
            <InteractiveSpreadsheet
                data={centers}
                columns={columns}
                isLoading={isLoading}
                onChange={() => { }} containerHeight="600px" />
        </StandardPage>
    );
}
