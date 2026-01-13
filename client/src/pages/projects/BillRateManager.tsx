import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Users, Briefcase, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BillRateSchedule {
    id: string;
    name: string;
    currencyCode: string;
    description: string;
    activeFlag: boolean;
}

interface BillRate {
    id: string;
    scheduleId: string;
    personId?: string;
    jobTitle?: string;
    expenditureType?: string;
    expenditureTypeId?: string;
    rate: string;
    startDate: string;
    endDate?: string;
}

export default function BillRateManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSchedule, setSelectedSchedule] = useState<BillRateSchedule | null>(null);
    const [isSchOpen, setIsSchOpen] = useState(false);
    const [isRateOpen, setIsRateOpen] = useState(false);

    // Form states
    const [schForm, setSchForm] = useState({ name: "", currencyCode: "USD", description: "" });
    const [rateForm, setRateForm] = useState({
        jobTitle: "",
        expenditureTypeId: "",
        rate: "",
        startDate: new Date().toISOString().split('T')[0]
    });

    const { data: schedules, isLoading: loadingSch } = useQuery<BillRateSchedule[]>({
        queryKey: ['/api/ppm/bill-rate-schedules'],
    });

    const { data: rates, isLoading: loadingRates } = useQuery<BillRate[]>({
        queryKey: [`/api/ppm/bill-rate-schedules/${selectedSchedule?.id}/rates`],
        enabled: !!selectedSchedule,
    });

    const { data: expTypes } = useQuery<any[]>({
        queryKey: ['/api/ppm/expenditure-types'],
    });

    const schMutation = useMutation({
        mutationFn: async (data: typeof schForm) => {
            const res = await fetch("/api/ppm/bill-rate-schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Schedule created" });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/bill-rate-schedules'] });
            setIsSchOpen(false);
            setSchForm({ name: "", currencyCode: "USD", description: "" });
        }
    });

    const rateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/ppm/bill-rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, scheduleId: selectedSchedule?.id })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Rate added" });
            queryClient.invalidateQueries({ queryKey: [`/api/ppm/bill-rate-schedules/${selectedSchedule?.id}/rates`] });
            setIsRateOpen(false);
            setRateForm({ jobTitle: "", expenditureTypeId: "", rate: "", startDate: new Date().toISOString().split('T')[0] });
        }
    });

    const schColumns: Column<BillRateSchedule>[] = [
        {
            header: "Schedule Name",
            accessorKey: "name",
            cell: (item) => (
                <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    {item.name}
                </div>
            )
        },
        { header: "Currency", accessorKey: "currencyCode" },
        {
            header: "Status",
            accessorKey: "activeFlag",
            cell: (item) => <Badge variant={item.activeFlag ? "default" : "secondary"}>{item.activeFlag ? "Active" : "Inactive"}</Badge>
        },
        {
            header: "",
            accessorKey: "id",
            cell: (item) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedSchedule(item)}>
                    Manage Rates <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    ];

    const rateColumns: Column<BillRate>[] = [
        {
            header: "Type",
            accessorKey: "id",
            cell: (item) => {
                if (item.personId) return <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Person</div>;
                if (item.jobTitle) return <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Job</div>;
                return <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Expenditure Type</div>;
            }
        },
        {
            header: "Criteria",
            accessorKey: "jobTitle",
            cell: (item) => item.jobTitle || item.expenditureType || "N/A"
        },
        { header: "Rate", accessorKey: "rate", cell: (item) => <span className="font-mono font-bold">${parseFloat(item.rate).toFixed(2)}</span> },
        { header: "Start Date", accessorKey: "startDate", cell: (item) => new Date(item.startDate).toLocaleDateString() },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bill Rate Manager</h2>
                    <p className="text-muted-foreground">Manage revenue rates for projects and labor costing</p>
                </div>
                {!selectedSchedule && (
                    <Dialog open={isSchOpen} onOpenChange={setIsSchOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" /> New Schedule
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Bill Rate Schedule</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Schedule Name</Label>
                                    <Input placeholder="e.g. 2026 Global Standard" value={schForm.name} onChange={(e) => setSchForm({ ...schForm, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={schForm.description} onChange={(e) => setSchForm({ ...schForm, description: e.target.value })} />
                                </div>
                                <Button className="w-full" onClick={() => schMutation.mutate(schForm)}>Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {selectedSchedule ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedSchedule(null)}>← Back to Schedules</Button>
                        <h3 className="text-xl font-semibold">{selectedSchedule.name}</h3>
                        <Badge variant="outline">{selectedSchedule.currencyCode}</Badge>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Schedule Rates</CardTitle>
                                <CardDescription>Define Person, Job, or Expenditure Type specific bill rates</CardDescription>
                            </div>
                            <Dialog open={isRateOpen} onOpenChange={setIsRateOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Rate</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add Bill Rate</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Job Title Override</Label>
                                            <Input placeholder="e.g. Senior Architect" value={rateForm.jobTitle} onChange={(e) => setRateForm({ ...rateForm, jobTitle: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 text-center text-xs text-muted-foreground">-- OR --</div>
                                        <div className="space-y-2">
                                            <Label>Expenditure Type Override</Label>
                                            <Select value={rateForm.expenditureTypeId} onValueChange={(v) => setRateForm({ ...rateForm, expenditureTypeId: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                                <SelectContent>
                                                    {expTypes?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Rate ({selectedSchedule.currencyCode})</Label>
                                                <Input type="number" placeholder="0.00" value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Start Date</Label>
                                                <Input type="date" value={rateForm.startDate} onChange={(e) => setRateForm({ ...rateForm, startDate: e.target.value })} />
                                            </div>
                                        </div>
                                        <Button className="w-full" onClick={() => rateMutation.mutate(rateForm)}>Add Rate</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <StandardTable data={rates || []} columns={rateColumns} isLoading={loadingRates} pageSize={10} />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Bill Rate Schedules</CardTitle>
                        <CardDescription>Schedules are linked to projects and tasks to determine revenue and inter-project billing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StandardTable data={schedules || []} columns={schColumns} isLoading={loadingSch} pageSize={10} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
