import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle, Truck, RefreshCw, Radio, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_EDI_EVENTS: any[] = [
    { id: "EDI-001", shipmentRef: "SHIP-2026-0441", carrier: "FedEx", proNumber: "PRO-8001234567", ediType: "214", statusCode: "D1", statusDesc: "Delivered", eventDate: "2026-03-08 09:45 AM", location: "Dubai, UAE", receivedAt: "2026-03-08 09:50 AM", applied: true },
    { id: "EDI-002", shipmentRef: "SHIP-2026-0441", carrier: "FedEx", proNumber: "PRO-8001234567", ediType: "214", statusCode: "X6", statusDesc: "In Transit — Out for Delivery", eventDate: "2026-03-08 06:12 AM", location: "DXB Airport", receivedAt: "2026-03-08 06:20 AM", applied: true },
    { id: "EDI-003", shipmentRef: "SHIP-2026-0438", carrier: "DHL", proNumber: "PRO-JD00123456780", ediType: "214", statusCode: "P2", statusDesc: "Picked Up from Shipper", eventDate: "2026-03-07 14:00 PM", location: "London, UK", receivedAt: "2026-03-07 14:10 PM", applied: true },
    { id: "EDI-004", shipmentRef: "SHIP-2026-0440", carrier: "UPS", proNumber: "1Z9999W99999999999", ediType: "214", statusCode: "X3", statusDesc: "Exception — Address Correction Required", eventDate: "2026-03-07 10:30 AM", location: "Sharjah FC", receivedAt: "2026-03-07 10:40 AM", applied: false },
    { id: "EDI-005", shipmentRef: "SHIP-2026-0435", carrier: "Aramex", proNumber: "IWB-2026-00345", ediType: "214", statusCode: "D1", statusDesc: "Delivered", eventDate: "2026-03-05 16:30 PM", location: "Abu Dhabi, UAE", receivedAt: "2026-03-05 16:45 PM", applied: true },
];

const SEED_CARRIERS: any[] = [
    { id: "FedEx", carrier: "FedEx", ediEnabled: true, connectionType: "AS2 / SFTP", lastHeartbeat: "2026-03-08 09:55 AM", eventsToday: 2, status: "Connected" },
    { id: "DHL", carrier: "DHL", ediEnabled: true, connectionType: "SFTP", lastHeartbeat: "2026-03-08 08:10 AM", eventsToday: 1, status: "Connected" },
    { id: "UPS", carrier: "UPS", ediEnabled: true, connectionType: "AS2", lastHeartbeat: "2026-03-07 22:00 PM", eventsToday: 1, status: "Stale — >8h" },
    { id: "Aramex", carrier: "Aramex", ediEnabled: true, connectionType: "REST API", lastHeartbeat: "2026-03-08 06:00 AM", eventsToday: 0, status: "Connected" },
    { id: "DPD", carrier: "DPD", ediEnabled: false, connectionType: "Manual Track", lastHeartbeat: "—", eventsToday: 0, status: "Not Configured" },
];

const STATUS_CODE_MAP: Record<string, string> = { D1: "Delivered", X6: "Out for Delivery", P2: "Picked Up", X3: "Exception", AF: "Airport Arrival", AD: "At Destination" };

export default function EDI214EventLog() {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const filtered = SEED_EDI_EVENTS.filter(e => {
        const matchFilter = filter === "All" || (filter === "Exceptions" && e.statusCode === "X3") || (filter === "Delivered" && e.statusCode === "D1") || (filter === "Unapplied" && !e.applied);
        const matchSearch = search === "" || e.shipmentRef.toLowerCase().includes(search.toLowerCase()) || e.carrier.toLowerCase().includes(search.toLowerCase()) || e.proNumber.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const eventCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "shipmentRef", header: "Shipment Ref", width: "160px", cell: r => <span className="font-mono text-xs text-blue-600">{r.shipmentRef}</span> },
        { id: "carrier", header: "Carrier", width: "100px", cell: r => <Badge variant="outline" className="text-xs font-semibold">{r.carrier}</Badge> },
        { id: "proNumber", header: "PRO / Tracking #", width: "200px", cell: r => <span className="font-mono text-xs">{r.proNumber}</span> },
        { id: "ediType", header: "EDI Type", width: "90px", cell: r => <Badge variant="secondary" className="text-xs font-mono">EDI {r.ediType}</Badge> },
        { id: "statusCode", header: "Code", width: "80px", cell: r => <span className={`text-center block font-bold text-xs ${r.statusCode === "D1" ? "text-green-700" : r.statusCode.startsWith("X") ? "text-red-600" : "text-blue-600"}`}>{r.statusCode}</span> },
        {
            id: "statusDesc", header: "Status Description", width: "250px", cell: r => (
                <span className={`text-sm flex items-center gap-1.5 ${r.statusCode === "D1" ? "text-green-700 font-medium" : r.statusCode.startsWith("X") ? "text-red-600 font-medium" : ""}`}>
                    {r.statusCode === "D1" ? <CheckCircle className="h-3.5 w-3.5" /> : r.statusCode.startsWith("X") ? <AlertTriangle className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
                    {r.statusDesc}
                </span>
            )
        },
        { id: "eventDate", header: "Event Time (Carrier)", width: "175px", cell: r => <span className="text-xs">{r.eventDate}</span> },
        { id: "location", header: "Location", width: "150px", cell: r => <span className="text-xs text-muted-foreground">{r.location}</span> },
        { id: "applied", header: "Applied", width: "90px", cell: r => r.applied ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-amber-500 mx-auto" /> },
        { id: "actions", header: "", width: "90px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedEvent(r)}>View</Button> },
    ], []);

    const carrierCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "carrier", header: "Carrier", width: "130px", cell: r => <span className="font-semibold">{r.carrier}</span> },
        { id: "ediEnabled", header: "EDI 214", width: "100px", cell: r => r.ediEnabled ? <span className="flex items-center gap-1 text-xs text-green-700 font-medium"><CheckCircle className="h-3.5 w-3.5" />Enabled</span> : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3.5 w-3.5" />Not Set</span> },
        { id: "connectionType", header: "Connection Type", width: "180px", cell: r => <Badge variant="outline" className="text-xs">{r.connectionType}</Badge> },
        { id: "lastHeartbeat", header: "Last Heartbeat", width: "180px", cell: r => <span className={`text-xs ${r.status === "Stale — >8h" ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>{r.lastHeartbeat}</span> },
        { id: "eventsToday", header: "Events Today", width: "120px", cell: r => <span className="text-center block font-bold">{r.eventsToday}</span> },
        { id: "status", header: "Status", width: "160px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const exceptions = SEED_EDI_EVENTS.filter(e => e.statusCode.startsWith("X")).length;
    const unapplied = SEED_EDI_EVENTS.filter(e => !e.applied).length;

    return (
        <StandardPage
            title="EDI 214 — Carrier Status Events"
            description="Receives and applies EDI 214 (Transportation Carrier Shipment Status Message) events from carriers to automatically update shipment track & trace records in real time."
            breadcrumbs={[{ label: "Transportation", href: "/transportation" }, { label: "EDI Events" }]}
            actions={<Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Re-poll Carriers</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Truck className="h-4 w-4 text-blue-500" />Events Today</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_EDI_EVENTS.length}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-red-500" />Exceptions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{exceptions}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unapplied Events</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{unapplied}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Radio className="h-4 w-4 text-green-600" />Carriers Connected</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{SEED_CARRIERS.filter(c => c.status === "Connected").length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="events">
                <TabsList className="mb-4"><TabsTrigger value="events">EDI 214 Event Log</TabsTrigger><TabsTrigger value="carriers">Carrier Connections ({SEED_CARRIERS.length})</TabsTrigger></TabsList>
                <TabsContent value="events">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div><CardTitle>Carrier Status Events</CardTitle><CardDescription>EDI 214 status messages are automatically applied to Shipment Tracking records upon receipt.</CardDescription></div>
                                <div className="flex gap-2">
                                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Shipment, PRO, carrier…" className="w-48" />
                                    <Select value={filter} onValueChange={setFilter}>
                                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Delivered">Delivered</SelectItem><SelectItem value="Exceptions">Exceptions</SelectItem><SelectItem value="Unapplied">Unapplied</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={filtered} columns={eventCols} onChange={() => { }} containerHeight="420px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="carriers">
                    <Card><CardHeader><CardTitle>EDI Carrier Connections</CardTitle><CardDescription>Heartbeat shows the last received message from each carrier. Stale connections should be investigated.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_CARRIERS} columns={carrierCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedEvent} onOpenChange={o => !o && setSelectedEvent(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>EDI 214 Event Detail</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-3 text-sm py-3">
                        {[["Shipment Ref", selectedEvent?.shipmentRef], ["Carrier", selectedEvent?.carrier], ["PRO / Tracking #", selectedEvent?.proNumber], ["Status Code", selectedEvent?.statusCode], ["Status Description", selectedEvent?.statusDesc], ["Event Time (Carrier)", selectedEvent?.eventDate], ["Received At NexusAI", selectedEvent?.receivedAt], ["Location", selectedEvent?.location], ["Applied to Shipment", selectedEvent?.applied ? "Yes" : "Pending"]].map(([l, v]) => (
                            <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v as string}</p></div>
                        ))}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
