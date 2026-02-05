
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileWarning, CheckSquare, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// --- Permits Section ---
export function PermitsSection({ workOrderId }: { workOrderId: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [permitType, setPermitType] = useState("HOT_WORK");

    const { data: permits } = useQuery({
        queryKey: ["/api/maintenance/permits", workOrderId],
        queryFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}/permits`).then(r => r.json())
    });

    const createPermitMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/maintenance/work-orders/${workOrderId}/permits`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/permits", workOrderId] });
            toast({ title: "Permit Generated" });
            setOpen(false);
        }
    });

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileWarning className="h-4 w-4 text-orange-600" />
                    Safety Permits
                </h3>
                <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-3 w-3 mr-1" /> New Permit</Button>
            </div>

            <div className="space-y-2">
                {permits?.map((p: any) => (
                    <div key={p.id} className="p-3 border rounded-md bg-orange-50/50 flex justify-between items-center">
                        <div>
                            <div className="text-sm font-bold text-orange-800">{p.type}</div>
                            <div className="text-xs text-muted-foreground">#{p.permitNumber} • {p.status}</div>
                            <div className="text-xs mt-1">Valid: {new Date(p.validFrom).toLocaleDateString()} - {new Date(p.validTo).toLocaleDateString()}</div>
                        </div>
                        {p.status === "ACTIVE" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    </div>
                ))}
                {permits?.length === 0 && <div className="text-xs text-muted-foreground">No active permits required.</div>}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Generate Safety Permit</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <label className="text-sm font-medium">Permit Type</label>
                        <Select value={permitType} onValueChange={setPermitType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HOT_WORK">Hot Work (Welding/Cutting)</SelectItem>
                                <SelectItem value="COLD_WORK">Cold Work</SelectItem>
                                <SelectItem value="CONFINED_SPACE">Confined Space Entry</SelectItem>
                                <SelectItem value="ELECTRICAL_ISOLATION">Electrical Isolation (LOTO)</SelectItem>
                                <SelectItem value="WORKING_AT_HEIGHT">Working at Height</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            This will generate a permit document valid for 24 hours. Physical signature required on site.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => createPermitMutation.mutate({
                            type: permitType,
                            validFrom: new Date(),
                            validTo: new Date(Date.now() + 24 * 60 * 60 * 1000)
                        })}>Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- Inspections Section ---
export function InspectionsSection({ workOrderId }: { workOrderId: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [runnerOpen, setRunnerOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [activeInspection, setActiveInspection] = useState<any>(null);

    const { data: inspections } = useQuery({
        queryKey: ["/api/maintenance/inspections", workOrderId],
        queryFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}/inspections`).then(r => r.json())
    });

    const { data: templates } = useQuery({
        queryKey: ["/api/maintenance/templates"],
        queryFn: () => fetch("/api/maintenance/quality/templates").then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: (tmplId: string) => fetch(`/api/maintenance/quality/inspections`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId: tmplId, workOrderId })
        }).then(r => r.json()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/inspections", workOrderId] });
            setActiveInspection({ ...data, definition: templates.find((t: any) => t.id === selectedTemplate) }); // Hydrate definition for runner
            setRunnerOpen(true);
        }
    });

    const submitMutation = useMutation({
        mutationFn: ({ id, results }: any) => fetch(`/api/maintenance/quality/inspections/${id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ results, status: "PASS" }) // Assuming pass for now, add logic later
        }).then(r => r.json()),
        onSuccess: () => {
            toast({ title: "Inspection Submitted" });
            setRunnerOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/inspections", workOrderId] });
        }
    });

    return (
        <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                    Quality Inspections
                </h3>
                <div className="flex gap-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Add Inspection..." /></SelectTrigger>
                        <SelectContent>
                            {templates?.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button size="sm" disabled={!selectedTemplate} onClick={() => createMutation.mutate(selectedTemplate)}>
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {inspections?.map((i: any) => (
                    <div key={i.id} className="p-3 border rounded-md flex justify-between items-center bg-card">
                        <div>
                            <div className="text-sm font-medium">{i.definition?.name}</div>
                            <div className="text-xs text-muted-foreground">Status: {i.status}</div>
                        </div>
                        {i.status === "PASS" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {i.status === "PENDING" && (
                            <Button size="sm" variant="secondary" onClick={() => { setActiveInspection(i); setRunnerOpen(true); }}>
                                Perform
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Inspection Runner Modal */}
            <Dialog open={runnerOpen} onOpenChange={setRunnerOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{activeInspection?.definition?.name || "Inspection"}</DialogTitle>
                        <DialogDescription>Complete the checklist to verify compliance.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {activeInspection?.definition?.questions?.map((q: any) => (
                            <div key={q.id} className="space-y-2 pb-2 border-b">
                                <label className="text-sm font-medium">{q.text}</label>
                                {q.type === "YES_NO" && (
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm"><input type="radio" name={q.id} /> Yes</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="radio" name={q.id} /> No</label>
                                    </div>
                                )}
                                {q.type === "NUMBER" && <Input type="number" placeholder="Reading..." className="h-8" />}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => submitMutation.mutate({ id: activeInspection.id, results: [] })}>Submit Results</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
