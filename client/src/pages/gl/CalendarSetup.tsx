import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, Loader2, CheckCircle2, XCircle, AlertTriangle, Play } from "lucide-react";
import { format } from "date-fns";

export default function CalendarSetup() {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: periods, isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/periods"],
    });

    const updatePeriodMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/gl/periods/tasks/${id}`, { // Using generic task update for now if direct period status update isn't ready
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update period");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/periods"] });
            toast({ title: "Period Updated", description: "Calendar status has been successfully modified." });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "OPEN": return "bg-green-100 text-green-800 border-green-200";
            case "CLOSED": return "bg-gray-100 text-gray-800 border-gray-200";
            case "FUTURE": return "bg-blue-100 text-blue-800 border-blue-200";
            case "PERMANENTLY CLOSED": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-amber-100 text-amber-800 border-amber-200";
        }
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <CalendarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Accounting Calendars</h1>
                        <p className="text-muted-foreground italic">Oracle Foundation: Supported Period Statuses (Never Opened, Future, Open, Closed)</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Play className="h-4 w-4" /> Open Next Period
                    </Button>
                    <Button onClick={() => setIsGenerating(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4" /> Generate New Year
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">FY2026</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Jan-26</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Periods Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1/12</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Quarter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Q1</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-lg">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle>Calendar Periods</CardTitle>
                    <CardDescription>Manage status and fiscal controls for the active ledger calendar.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6">Period Name</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Quarter</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periods?.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((period) => (
                                <TableRow key={period.id} className="hover:bg-muted/20 transition-colors group">
                                    <TableCell className="pl-6 font-semibold text-primary">{period.periodName}</TableCell>
                                    <TableCell>{format(new Date(period.startDate), "dd-MMM-yyyy")}</TableCell>
                                    <TableCell>{format(new Date(period.endDate), "dd-MMM-yyyy")}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">Q{Math.floor(new Date(period.startDate).getMonth() / 3) + 1}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(period.status)}>
                                            {period.status || "NEVER OPENED"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            {period.status === "OPEN" ? (
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    Close Period
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700">
                                                    Open Period
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
