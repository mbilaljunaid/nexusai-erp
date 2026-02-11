import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLcmCostComponentSchema } from "@shared/schema/lcm";
import { useToast } from "@/hooks/use-toast";

export default function CostComponents() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { data: components, isLoading } = useQuery({
        queryKey: ["/api/lcm/components"],
        queryFn: async () => {
            const res = await fetch("/api/lcm/components");
            if (!res.ok) throw new Error("Failed to fetch cost components");
            return res.json();
        }
    });

    const form = useForm({
        resolver: zodResolver(insertLcmCostComponentSchema),
        defaultValues: {
            name: "",
            description: "",
            componentType: "FREIGHT",
            allocationBasis: "VALUE",
            isActive: true,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/lcm/components", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create component");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/lcm/components"] });
            toast({ title: "Cost Component Created", description: "Successfully added new component." });
            setIsSheetOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            toast({ 
                title: "Error", 
                description: error.message,
                variant: "destructive"
            });
        }
    });

    function onSubmit(data: any) {
        createMutation.mutate(data);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cost Components</h1>
                    <p className="text-muted-foreground">Manage Landed Cost elements and their allocation rules.</p>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Component
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px]">
                        <SheetHeader>
                            <SheetTitle>Add Cost Component</SheetTitle>
                            <SheetDescription>
                                Define a new cost element for landed cost calculations.
                            </SheetDescription>
                        </SheetHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Component Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Ocean Freight" {...field} />
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
                                                <Input placeholder="Brief details about the component" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="componentType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="FREIGHT">Freight</SelectItem>
                                                        <SelectItem value="INSURANCE">Insurance</SelectItem>
                                                        <SelectItem value="DUTY">Duty / Tax</SelectItem>
                                                        <SelectItem value="OTHERS">Others</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="allocationBasis"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Allocation Basis</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select basis" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="VALUE">Item Value</SelectItem>
                                                        <SelectItem value="QUANTITY">Quantity</SelectItem>
                                                        <SelectItem value="WEIGHT">Weight</SelectItem>
                                                        <SelectItem value="VOLUME">Volume</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <SheetFooter className="pt-4">
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Creating..." : "Create Component"}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Master Data</CardTitle>
                            <CardDescription>Definitions for all cost components used in trade operations.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter components..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Component Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Allocation Basis</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground italic">
                                            Loading components...
                                        </TableCell>
                                    </TableRow>
                                ) : !components || components.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground italic">
                                            No cost components defined.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    components.map((c: any) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{c.name}</span>
                                                    <span className="text-xs text-muted-foreground">{c.description || "No description"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase">{c.componentType}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{c.allocationBasis}</TableCell>
                                            <TableCell>
                                                {c.isActive ? (
                                                    <div className="flex items-center text-green-600 text-xs gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-muted-foreground text-xs gap-1">
                                                        <XCircle className="h-3 w-3" /> Inactive
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
