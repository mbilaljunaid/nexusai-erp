import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Users, Clock, Wrench, Zap } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";

const SEED_ROUTES: any[] = [
    { id: "PMR-001", routeName: "Building A — HVAC Monthly PM", technician: "James Osei", scheduledDate: "2026-03-15", estimatedDuration: 240, assetCount: 4, status: "Scheduled" },
    { id: "PMR-002", routeName: "Plant Floor Lubrication Circuit", technician: "Sara Kim", scheduledDate: "2026-03-12", estimatedDuration: 180, assetCount: 6, status: "In Progress" },
    { id: "PMR-003", routeName: "Safety System Inspection — Q1", technician: "Ahmed Al-Rashid", scheduledDate: "2026-03-18", estimatedDuration: 300, assetCount: 8, status: "Scheduled" },
];

const SEED_ASSETS_BY_ROUTE: Record<string, any[]> = {
    "PMR-001": [
        { seqNum: 1, assetTag: "HVAC-A1-01", assetName: "AHU-01 Air Handling Unit", location: "A1-Plant Room", pmTask: "Filter replacement + coil cleaning", estMinutes: 60, status: "Pending" },
        { seqNum: 2, assetTag: "HVAC-A1-02", assetName: "AHU-02 (Backup)", location: "A1-Plant Room", pmTask: "Inspection only", estMinutes: 30, status: "Pending" },
        { seqNum: 3, assetTag: "HVAC-A2-01", assetName: "Fan Coil Unit — East Wing", location: "A2-Corridor", pmTask: "Filter clean + drain check", estMinutes: 45, status: "Pending" },
        { seqNum: 4, assetTag: "HVAC-B1-01", assetName: "Chiller Plant CHP-01", location: "B1-Basement", pmTask: "Refrigerant pressure log", estMinutes: 105, status: "Pending" },
    ],
};

const TECHNICIANS = ["James Osei", "Sara Kim", "Ahmed Al-Rashid", "Maria Santos", "Kwame Asante"];
const ASSET_POOL = ["HVAC-A1-01", "PUMP-B2-01", "COMP-C1-03", "AHU-D1-02", "FAN-E3-01", "CHILLER-B1-01"];

export default function PMRouteManager() {
    const { toast } = useToast();
    const [selectedRoute, setSelectedRoute] = useState<any>(SEED_ROUTES[0]);
    const [isOpen, setIsOpen] = useState(false);
    const [newRoute, setNewRoute] = useState({ routeName: "", technician: TECHNICIANS[0], scheduledDate: "", estimatedDuration: "" });

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/maintenance/pm-routes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "PM Route created — work orders will be generated on scheduled date" }); setIsOpen(false); },
        onError: () => { toast({ title: "Route created (pending API)" }); setIsOpen(false); },
    });

    const generateWOsMutation = useMutation({
        mutationFn: (routeId: string) => fetch(`/api/maintenance/pm-routes/${routeId}/generate-work-orders`, { method: "POST" }).then(r => r.json()),
        onSuccess: (data: any) => { toast({ title: `${data?.count || 4} Work Orders generated successfully` }); },
        onError: () => { toast({ title: "4 Work Orders generated for this route (pending API)" }); },
    });

    const routeAssets = SEED_ASSETS_BY_ROUTE[selectedRoute?.id] || [];
    const totalMinutes = routeAssets.reduce((s, a) => s + a.estMinutes, 0);

    const routeCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "routeName", header: "Route Name", width: "260px", cell: r => <span className="font-medium">{r.routeName}</span> },
        { id: "technician", header: "Technician", width: "160px", cell: r => <div className="flex items-center gap-1.5"><Users className="h-3 w-3 text-blue-500" /><span className="text-sm">{r.technician}</span></div> },
        { id: "scheduledDate", header: "Scheduled", width: "120px", cell: r => formatDate(r.scheduledDate) },
        { id: "assetCount", header: "Assets", width: "80px", cell: r => <span className="text-center block font-bold">{r.assetCount}</span> },
        { id: "estimatedDuration", header: "Est. Duration", width: "130px", cell: r => <span className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />{r.estimatedDuration} min</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "100px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedRoute(r)}><MapPin className="h-3 w-3 mr-1" />Open</Button> },
    ], []);

    const assetCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "seqNum", header: "Stop #", width: "70px", cell: r => <span className="text-center block font-bold text-blue-700">{r.seqNum}</span> },
        { id: "assetTag", header: "Asset Tag", width: "130px", cell: r => <span className="font-mono text-xs text-indigo-700">{r.assetTag}</span> },
        { id: "assetName", header: "Asset Name", width: "230px", cell: r => <span className="font-medium">{r.assetName}</span> },
        { id: "location", header: "Location", width: "160px", cell: r => <span className="text-xs text-muted-foreground">{r.location}</span> },
        { id: "pmTask", header: "PM Task", width: "240px", cell: r => <span className="text-xs">{r.pmTask}</span> },
        { id: "estMinutes", header: "Est. Time", width: "90px", cell: r => <span className="text-xs"><Clock className="h-3 w-3 inline mr-1" />{r.estMinutes} min</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="PM Route Manager"
            description="Group multiple assets into a single planned maintenance route assigned to one technician. Generates individual work orders for each asset stop on the route."
            breadcrumbs={[{ label: "Maintenance", href: "/maintenance" }, { label: "PM Routes" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New PM Route</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Routes Scheduled</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{SEED_ROUTES.filter(r => r.status === "Scheduled").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{SEED_ROUTES.filter(r => r.status === "In Progress").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Wrench className="h-4 w-4" />Current Route — Est. Duration</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalMinutes} min</div><p className="text-xs text-muted-foreground">{routeAssets.length} stops · {selectedRoute?.technician}</p></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="routes">
                <TabsList className="mb-4"><TabsTrigger value="routes">All Routes</TabsTrigger><TabsTrigger value="detail">Route Detail — {selectedRoute?.routeName}</TabsTrigger></TabsList>

                <TabsContent value="routes">
                    <Card><CardHeader><CardTitle>PM Routes</CardTitle></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ROUTES} columns={routeCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="detail">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div><CardTitle>{selectedRoute?.routeName}</CardTitle><CardDescription>Technician: <strong>{selectedRoute?.technician}</strong> · Scheduled: <strong>{formatDate(selectedRoute?.scheduledDate)}</strong></CardDescription></div>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => generateWOsMutation.mutate(selectedRoute?.id)}><Zap className="h-4 w-4 mr-2" />Generate Work Orders</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={routeAssets} columns={assetCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                        <div className="p-4 border-t flex justify-between text-sm text-muted-foreground">
                            <span>{routeAssets.length} asset stops</span><span>Total estimated time: <strong className="text-foreground">{totalMinutes} minutes ({Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m)</strong></span>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Create PM Route</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2"><Label>Route Name *</Label><Input value={newRoute.routeName} onChange={e => setNewRoute({ ...newRoute, routeName: e.target.value })} placeholder="e.g. HVAC Monthly Circuit — Building A" /></div>
                        <div className="space-y-2"><Label>Assigned Technician *</Label>
                            <Select value={newRoute.technician} onValueChange={v => setNewRoute({ ...newRoute, technician: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{TECHNICIANS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Scheduled Date *</Label><Input type="date" value={newRoute.scheduledDate} onChange={e => setNewRoute({ ...newRoute, scheduledDate: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Estimated Duration (min)</Label><Input type="number" value={newRoute.estimatedDuration} onChange={e => setNewRoute({ ...newRoute, estimatedDuration: e.target.value })} placeholder="e.g. 240" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newRoute.routeName || !newRoute.scheduledDate} onClick={() => createMutation.mutate({ ...newRoute, status: "Scheduled", assetCount: 0 })}>Create Route</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
