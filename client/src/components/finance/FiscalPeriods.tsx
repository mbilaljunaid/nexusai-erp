import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Edit2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GlPeriod, InsertGlPeriod } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGlPeriodSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

export function FiscalPeriods() {
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: periods = [], isLoading } = useQuery<GlPeriod[]>({
        queryKey: ["/api/gl/periods"],
        queryFn: () => fetch("/api/gl/periods").then(res => res.json())
    });

    const form = useForm<InsertGlPeriod>({
        resolver: zodResolver(insertGlPeriodSchema),
        defaultValues: {
            periodName: "",
            fiscalYear: new Date().getFullYear(),
            startDate: new Date(),
            endDate: new Date(),
            status: "Open"
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: InsertGlPeriod) => fetch("/api/gl/periods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/periods"] });
            setIsAddOpen(false);
            form.reset();
            toast({ title: "Period created successfully" });
        }
    });

    const closeMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/gl/periods/${id}/close`, { method: "POST" }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/periods"] });
            toast({ title: "Period closed" });
        }
    });

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Fiscal Periods Management
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Open New Period</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Open New Fiscal Period</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                                <FormField control={form.control} name="periodName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Period Name</FormLabel>
                                        <FormControl><Input placeholder="e.g. Jan-2026" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="fiscalYear" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fiscal Year</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="status" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "Open"}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Open">Open</SelectItem>
                                                    <SelectItem value="Closed">Closed</SelectItem>
                                                    <SelectItem value="Future-Entry">Future Entry</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="startDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl><Input type="date" value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="endDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl><Input type="date" value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createMutation.isPending}>Create Period</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period Name</TableHead>
                                <TableHead>Fiscal Year</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : periods.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No periods found</TableCell></TableRow>
                            ) : (
                                periods.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.periodName}</TableCell>
                                        <TableCell>{p.fiscalYear}</TableCell>
                                        <TableCell>{format(new Date(p.startDate), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>{format(new Date(p.endDate), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={p.status === "Open" ? "default" : "secondary"}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            {p.status === "Open" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => closeMutation.mutate(p.id)}
                                                    disabled={closeMutation.isPending}
                                                >
                                                    Close Period
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
