import React, { useState } from 'react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface Resource {
    id: string;
    resourceCode: string;
    name: string;
    type: "LABOR" | "MACHINE" | "TOOL";
    status: "active" | "inactive";
    capacityPerHour: number;
    costPerHour: number;
}

const resourceSchema = z.object({
    resourceCode: z.string().min(1, "Resource Code is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["LABOR", "MACHINE", "TOOL"]),
    capacityPerHour: z.coerce.number().min(0, "Capacity must be positive"),
    costPerHour: z.coerce.number().min(0, "Cost must be positive"),
});

export default function ResourceManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);

    const form = useForm<z.infer<typeof resourceSchema>>({
        resolver: zodResolver(resourceSchema),
        defaultValues: {
            resourceCode: "",
            name: "",
            type: "LABOR",
            capacityPerHour: 0,
            costPerHour: 0,
        }
    });

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
            form.reset();
            toast({ title: "Success", description: "Resource saved successfully" });
        }
    });

    const columns: SpreadsheetColumn<Resource>[] = [
        {
            id: "resourceCode",
            header: "Code",
            width: "150px",
            cell: (row: Resource) => <span className="font-mono font-bold text-blue-600">{row.resourceCode}</span>
        },
        {
            id: "name",
            header: "Name",
            width: "250px",
            cell: (row: Resource) => <span>{row.name}</span>
        },
        {
            id: "type",
            header: "Type",
            width: "150px",
            cell: (row: Resource) => <Badge variant="outline">{row.type}</Badge>
        },
        {
            id: "costPerHour",
            header: "Cost/Hr",
            width: "150px",
            cell: (row: Resource) => <span>${Number(row.costPerHour).toLocaleString()}</span>
        },
        {
            id: "capacityPerHour",
            header: "Capacity",
            width: "150px",
            cell: (row: Resource) => <span>{row.capacityPerHour} units/hr</span>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: Resource) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        }
    ];

    const onSubmit = (values: z.infer<typeof resourceSchema>) => {
        mutation.mutate({
            ...values,
            status: "active"
        });
    };

    return (
        <StandardPage
            title="Manufacturing Resources"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Setup" }, { label: "Resources" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={(open) => {
                    setIsSheetOpen(open);
                    if (!open) { setEditingResource(null); form.reset(); }
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={() => {
                            setEditingResource(null);
                            form.reset({ resourceCode: "", name: "", type: "LABOR", capacityPerHour: 0, costPerHour: 0 });
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Resource
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add Manufacturing Resource</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="resourceCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Resource Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="LABOR-01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Skilled Assembly Tech" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="LABOR">Labor</SelectItem>
                                                        <SelectItem value="MACHINE">Machine</SelectItem>
                                                        <SelectItem value="TOOL">Tool</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="capacityPerHour"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Capacity (units/hr)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="costPerHour"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cost ($/hr)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                        {mutation.isPending ? "Saving..." : "Save Resource"}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="h-[600px]">
                {isLoading ? (
                    <div className="p-4 text-center">Loading resources...</div>
                ) : (
                    <InteractiveSpreadsheet
                        columns={columns}
                        data={resources}
                        onChange={() => { }}
                        containerHeight="100%"
                    />
                )}
            </div>
        </StandardPage>
    );
}
