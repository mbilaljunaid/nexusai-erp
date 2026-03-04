import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

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

    const { data: expTypes = [] } = useQuery<any[]>({
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
        mutationFn: async (rows: any[]) => {
            const promises = rows.map(data => {
                const payload = { ...data, scheduleId: selectedSchedule?.id };
                return fetch("/api/ppm/bill-rates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            });
            await Promise.all(promises);
            return {};
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Rates saved successfully" });
            queryClient.invalidateQueries({ queryKey: [`/api/ppm/bill-rate-schedules/${selectedSchedule?.id}/rates`] });
            setIsRateOpen(false);
        }
    });

    const handleSaveRates = (rows: any[]) => {
        rateMutation.mutate(rows);
    };

    const schColumns: SpreadsheetColumn<BillRateSchedule>[] = [
        {
            id: "name",
            header: "Schedule Name",
            width: "300px",
            cell: (item) => (
                <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    {item.name}
                </div>
            )
        },
        { id: "currencyCode", header: "Currency", width: "150px", cell: (item) => <span>{item.currencyCode}</span> },
        {
            id: "activeFlag",
            header: "Status",
            width: "150px",
            cell: (item) => <Badge variant={item.activeFlag ? "default" : "secondary"}>{item.activeFlag ? "Active" : "Inactive"}</Badge>
        },
        {
            id: "actions",
            header: "",
            width: "200px",
            cell: (item) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedSchedule(item)}>
                    Manage Rates <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    ];

    const handleAddRow = () => {
        const newRow = { id: `temp-${Date.now()}`, personId: "", jobTitle: "", expenditureTypeId: "", rate: "", startDate: new Date().toISOString().split('T')[0], endDate: "" };
        queryClient.setQueryData([`/api/ppm/bill-rate-schedules/${selectedSchedule?.id}/rates`], (old: any) => [...(old || []), newRow]);
    };

    const columns = [
        {
            id: "personId",
            header: "Person ID",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.personId || ""} onChange={e => updateRow("personId", e.target.value)} placeholder="Emp ID..." />
            )
        },
        {
            id: "jobTitle",
            header: "Job Title",
            width: "200px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.jobTitle || ""} onChange={e => updateRow("jobTitle", e.target.value)} placeholder="e.g. Senior Dev" />
            )
        },
        {
            id: "expenditureTypeId",
            header: "Expenditure Type",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.expenditureTypeId} onValueChange={(val) => updateRow("expenditureTypeId", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                        {expTypes.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "rate",
            header: "Rate *",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="number" className="h-9 w-full bg-transparent border-0 font-mono" value={row.rate || ""} onChange={e => updateRow("rate", e.target.value)} placeholder="0.00" />
            )
        },
        {
            id: "startDate",
            header: "Start Date *",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="date" className="h-9 w-full bg-transparent border-0" value={row.startDate ? new Date(row.startDate).toISOString().split('T')[0] : ""} onChange={e => updateRow("startDate", e.target.value)} />
            )
        },
        {
            id: "endDate",
            header: "End Date",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="date" className="h-9 w-full bg-transparent border-0" value={row.endDate ? new Date(row.endDate).toISOString().split('T')[0] : ""} onChange={e => updateRow("endDate", e.target.value)} />
            )
        }
    ];

    const expTypeOptions = expTypes.map(t => ({ label: t.name, value: t.id }));

    return (
        <StandardPage
            title="Bill Rate Manager"
            description="Manage client billing schedules and resource rates for projects and labor costing"
            actions={
                !selectedSchedule ? (
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
                ) : null
            }
        >
            <div className="space-y-6">
                {selectedSchedule ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => setSelectedSchedule(null)}>← Back to Schedules</Button>
                            <h3 className="text-xl font-semibold">{selectedSchedule.name}</h3>
                            <Badge variant="outline">{selectedSchedule.currencyCode}</Badge>
                        </div>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle>Schedule Rates</CardTitle>
                                    <CardDescription>Define Person, Job, or Expenditure Type specific bill rates</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleAddRow}><Plus className="w-4 h-4 mr-2" /> Add Rate</Button>
                                    <Button size="sm" onClick={() => handleSaveRates(rates || [])} disabled={rateMutation.isPending}>Save</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[500px] p-0 border-t">
                                <InteractiveSpreadsheet
                                    data={rates || []}
                                    columns={columns}
                                    onChange={(newData) => queryClient.setQueryData([`/api/ppm/bill-rate-schedules/${selectedSchedule?.id}/rates`], () => newData)}
                                    virtualized={true}
                                    containerHeight="500px"
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Rate Schedules</CardTitle>
                            <CardDescription>Schedules are linked to projects and tasks to determine revenue and inter-project billing</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            {loadingSch ? (
                                <div className="p-4 text-center">Loading...</div>
                            ) : (
                                <InteractiveSpreadsheet
                                    columns={schColumns}
                                    data={schedules || []}
                                    onChange={() => { }}
                                    containerHeight="100%"
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
