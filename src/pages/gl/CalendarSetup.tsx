import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, Loader2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CalendarSetup() {
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        periodType: "Monthly"
    });

    const { data: calendars, isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/config/calendars"],
    });

    const createCalendarMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/gl/config/calendars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create calendar");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/config/calendars"] });
            toast({ title: "Success", description: "Accounting calendar created successfully." });
            setIsCreating(false);
            setFormData({ name: "", description: "", periodType: "Monthly" });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleSubmit = () => {
        if (!formData.name) {
            toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
            return;
        }
        createCalendarMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Accounting Calendars"
            description="Oracle Foundation: Define fiscal years and period types"
            actions={
                <Button onClick={() => setIsCreating(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4" /> New Calendar
                </Button>
            }
        >

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Accounting Calendar</DialogTitle>
                        <DialogDescription>
                            Define a new accounting calendar to group periods.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Calendar Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. FY2026 Monthly"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Period Type</Label>
                            <Select
                                value={formData.periodType}
                                onValueChange={(val) => setFormData(f => ({ ...f, periodType: val }))}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    <SelectItem value="Yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createCalendarMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {createCalendarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Calendar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="border-none shadow-lg">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                        Defined Calendars
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {calendars?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                            <CalendarIcon className="h-10 w-10 opacity-20" />
                            <p>No accounting calendars defined. Click "New Calendar" to create one.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Period Type</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calendars?.map((cal) => (
                                    <TableRow key={cal.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="pl-6 font-semibold text-primary">{cal.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{cal.description || "-"}</TableCell>
                                        <TableCell>{cal.periodType}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(cal.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
