import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Search, Calendar, Clock, MoreHorizontal,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, type ColumnDef } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CalendarManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        calendarCode: "",
        description: "",
        weekendDays: "SAT,SUN",
        status: "active"
    });

    const { data: calendars, isLoading } = useQuery({
        queryKey: ["/api/manufacturing/calendars"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/calendars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/calendars"] });
            setIsSheetOpen(false);
            setFormData({ calendarCode: "", description: "", weekendDays: "SAT,SUN", status: "active" });
            toast({ title: "Success", description: "Production Calendar created successfully." });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const columns: ColumnDef<any>[] = [
        {
            header: "Calendar Code",
            accessorKey: "calendarCode",
            cell: (row) => <div className="font-medium">{row.calendarCode}</div>
        },
        {
            header: "Description",
            accessorKey: "description",
        },
        {
            header: "Weekend Days",
            accessorKey: "weekendDays",
            cell: (row) => (
                <div className="flex gap-1">
                    {row.weekendDays.split(",").map((day: string) => (
                        <Badge key={day} variant="outline" className="text-xs">{day}</Badge>
                    ))}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Created",
            accessorKey: "createdAt",
            cell: (row) => new Date(row.createdAt).toLocaleDateString()
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Production Calendars</h1>
                    <p className="text-muted-foreground mt-2">
                        Define factory working days, weekend policies, and exception schedules.
                    </p>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Calendar
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px]">
                        <SheetHeader>
                            <SheetTitle>Create Production Calendar</SheetTitle>
                            <SheetDescription>
                                Establish a new working calendar for resources and work centers.
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Calendar Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g. FACTORY-MAIN-2026"
                                        value={formData.calendarCode}
                                        onChange={(e) => setFormData({ ...formData, calendarCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input
                                        id="desc"
                                        placeholder="Main shift calendar for assembly line"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="weekends">Weekend Policy</Label>
                                    <Select
                                        value={formData.weekendDays}
                                        onValueChange={(val) => setFormData({ ...formData, weekendDays: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SAT,SUN">Saturday & Sunday</SelectItem>
                                            <SelectItem value="SUN">Sunday Only</SelectItem>
                                            <SelectItem value="FRI,SAT">Friday & Saturday</SelectItem>
                                            <SelectItem value="NONE">No Weekends (24/7)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create Calendar"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Calendars</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{calendars?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Used by 12 Work Centers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Across all calendars</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search calendars..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={calendars || []}
                        columns={columns}
                        isLoading={isLoading}
                        page={page}
                        pageSize={10}
                        totalItems={calendars?.length || 0}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
