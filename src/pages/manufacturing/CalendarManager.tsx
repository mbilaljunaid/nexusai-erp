import { formatDate } from "@/lib/dateUtils";
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
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
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

const calendarSchema = z.object({
    calendarCode: z.string().min(1, "Calendar Code is required"),
    description: z.string().optional(),
    weekendDays: z.string().min(1, "Weekend Days are required"),
    status: z.enum(["active", "draft", "archived"]).default("active"),
});

interface Calendar {
    id: string;
    calendarCode: string;
    description: string;
    weekendDays: string;
    status: string;
    createdAt: string;
}

export default function CalendarManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const form = useForm<z.infer<typeof calendarSchema>>({
        resolver: zodResolver(calendarSchema),
        defaultValues: {
            calendarCode: "",
            description: "",
            weekendDays: "SAT,SUN",
            status: "active"
        }
    });

    const { data: calendars, isLoading } = useQuery<Calendar[]>({
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
            form.reset();
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

    const columns: SpreadsheetColumn<Calendar>[] = [
        {
            id: "calendarCode",
            header: "Calendar Code",
            width: "200px",
            cell: (row) => <div className="font-medium">{row.calendarCode}</div>
        },
        {
            id: "description",
            header: "Description",
            width: "250px",
            cell: (row) => <span>{row.description}</span>
        },
        {
            id: "weekendDays",
            header: "Weekend Days",
            width: "200px",
            cell: (row) => (
                <div className="flex gap-1">
                    {row.weekendDays.split(",").map((day: string) => (
                        <Badge key={day} variant="outline" className="text-xs">{day}</Badge>
                    ))}
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        },
        {
            id: "createdAt",
            header: "Created",
            width: "150px",
            cell: (row) => <span>{formatDate(row.createdAt)}</span>
        }
    ];

    const onSubmit = (values: z.infer<typeof calendarSchema>) => {
        createMutation.mutate(values);
    };

    return (
        <StandardPage
            title="Production Calendars"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Setup" }, { label: "Calendars" }]}
            actions={
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="calendarCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Calendar Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. FACTORY-MAIN-2026" {...field} />
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
                                                    <Input placeholder="Main shift calendar for assembly line" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="weekendDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weekend Policy</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="SAT,SUN">Saturday & Sunday</SelectItem>
                                                        <SelectItem value="SUN">Sunday Only</SelectItem>
                                                        <SelectItem value="FRI,SAT">Friday & Saturday</SelectItem>
                                                        <SelectItem value="NONE">No Weekends (24/7)</SelectItem>
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
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                        </Form>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="grid gap-6 md:grid-cols-3 mb-6">
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
                <CardContent className="h-[600px]">
                    {isLoading ? (
                        <div className="text-center p-4">Loading calendars...</div>
                    ) : (
                        <InteractiveSpreadsheet
                            data={calendars || []}
                            columns={columns}
                            onChange={() => { }}
                            containerHeight="100%"
                        />
                    )}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
