
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StandardPage } from "@/components/layout/StandardPage";


export default function ReportScheduler() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newItem, setNewItem] = useState({ reportType: "", cronExpression: "0 9 * * 1", recipients: "" });

    const { data: reportTypes } = useQuery({
        queryKey: ["/api/hr/reports/types"],
        queryFn: () => fetch("/api/hr/reports/types").then(r => r.json())
    });

    const { data: schedules = [], isLoading } = useQuery({
        queryKey: ["/api/hr/config/schedules"],
        queryFn: () => fetch("/api/hr/config/schedules").then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/hr/config/schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/config/schedules"] });
            toast({ title: "Schedule Created" });
            setIsDialogOpen(false);
            setNewItem({ reportType: "", cronExpression: "0 9 * * 1", recipients: "" });
        }
    });

    const handleCreate = () => {
        // Parse emails
        const recipientList = newItem.recipients.split(",").map(e => e.trim()).filter(e => e);
        createMutation.mutate({ ...newItem, recipients: recipientList });
    };

    const columns: SpreadsheetColumn<any>[] = [
        { id: "reportType", header: "Report", width: "200px", cell: (r) => <div className="p-2">{r.reportType}</div> },
        { id: "cronExpression", header: "Schedule (Cron)", width: "150px", cell: (r) => <div className="p-2">{r.cronExpression}</div> },
        { id: "recipients", header: "Recipients", width: "300px", cell: (r) => <div className="p-2">{(r.recipients as string[]).join(", ")}</div> },
        { id: "isActive", header: "Active", width: "100px", cell: (r) => <div className="p-2">{r.isActive ? "Yes" : "No"}</div> }
    ];

    return (
        <StandardPage title="Report Scheduling">
            <div>
                
                <p className="text-muted-foreground text-sm mt-1">Automate compliance report delivery.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Active Schedules</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Schedule</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Schedule</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Report Type</Label>
                                    <Select
                                        value={newItem.reportType}
                                        onValueChange={(v) => setNewItem({ ...newItem, reportType: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Report..." /></SelectTrigger>
                                        <SelectContent>
                                            {reportTypes?.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select
                                        value={newItem.cronExpression}
                                        onValueChange={(v) => setNewItem({ ...newItem, cronExpression: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0 9 * * 1">Weekly (Monday 9AM)</SelectItem>
                                            <SelectItem value="0 9 1 * *">Monthly (1st 9AM)</SelectItem>
                                            <SelectItem value="0 8 * * *">Daily (8AM)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Recipients (Comma separated)</Label>
                                    <Input
                                        placeholder="hr@example.com, manager@example.com"
                                        value={newItem.recipients}
                                        onChange={(e) => setNewItem({ ...newItem, recipients: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleCreate} disabled={!newItem.reportType || createMutation.isPending} className="w-full">
                                    Create Schedule
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <InteractiveSpreadsheet data={schedules} columns={columns} onChange={() => { }} virtualized={true} containerHeight="400px" />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
