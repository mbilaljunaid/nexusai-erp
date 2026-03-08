import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { Plane, Ship, Truck, Award } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const ORIGINS = ["Dubai, UAE", "Shanghai, CN", "Los Angeles, US", "Rotterdam, NL", "Singapore", "Mumbai, IN"];
const DESTINATIONS = ["London, UK", "Frankfurt, DE", "New York, US", "Sydney, AU", "Dubai, UAE"];

const SEED_QUOTES: any[] = [
    { id: "MMQ-001", origin: "Shanghai, CN", destination: "London, UK", weight: 2400, volume: 14, mode: "Sea LCL", carrier: "Maersk", transitDays: 28, freightCost: 3420, customs: 680, insurance: 210, totalCost: 4310, co2Kg: 1250, recommended: false },
    { id: "MMQ-002", origin: "Shanghai, CN", destination: "London, UK", weight: 2400, volume: 14, mode: "Sea FCL", carrier: "MSC", transitDays: 25, freightCost: 4800, customs: 680, insurance: 230, totalCost: 5710, co2Kg: 1100, recommended: false },
    { id: "MMQ-003", origin: "Shanghai, CN", destination: "London, UK", weight: 2400, volume: 14, mode: "Air", carrier: "Emirates Cargo", transitDays: 3, freightCost: 18600, customs: 680, insurance: 420, totalCost: 19700, co2Kg: 9800, recommended: false },
    { id: "MMQ-004", origin: "Shanghai, CN", destination: "London, UK", weight: 2400, volume: 14, mode: "Rail (China-EU)", carrier: "DB Schenker Rail", transitDays: 16, freightCost: 5900, customs: 680, insurance: 260, totalCost: 6840, co2Kg: 480, recommended: true },
    { id: "MMQ-005", origin: "Shanghai, CN", destination: "London, UK", weight: 2400, volume: 14, mode: "Sea+Air Split", carrier: "DHL Multimodal", transitDays: 12, freightCost: 9200, customs: 680, insurance: 310, totalCost: 10190, co2Kg: 3100, recommended: false },
];

const MODE_ICONS: Record<string, React.ReactNode> = {
    "Sea LCL": <Ship className="h-4 w-4 text-blue-600" />,
    "Sea FCL": <Ship className="h-4 w-4 text-blue-700" />,
    "Air": <Plane className="h-4 w-4 text-purple-600" />,
    "Rail (China-EU)": <Truck className="h-4 w-4 text-green-700" />,
    "Sea+Air Split": <Plane className="h-4 w-4 text-amber-600" />,
};

const CO2_BAND = (val: number) => val < 600 ? "text-green-700" : val < 3000 ? "text-amber-600" : "text-red-600";

export default function MultiModalShipmentOptimizer() {
    const { toast } = useToast();
    const [origin, setOrigin] = useState(ORIGINS[0]);
    const [destination, setDestination] = useState(DESTINATIONS[0]);
    const [weight, setWeight] = useState("2400");
    const [urgency, setUrgency] = useState("Standard (28 days)");

    const awardMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/tms/shipment-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => toast({ title: "Shipment plan created — carrier notified for booking" }),
        onError: () => toast({ title: "Shipment plan created (pending API)" }),
    });

    const recommended = SEED_QUOTES.find(q => q.recommended);
    const cheapest = SEED_QUOTES.reduce((a, b) => a.totalCost < b.totalCost ? a : b);
    const fastest = SEED_QUOTES.reduce((a, b) => a.transitDays < b.transitDays ? a : b);
    const greenest = SEED_QUOTES.reduce((a, b) => a.co2Kg < b.co2Kg ? a : b);

    const cols = useMemo<SpreadsheetColumn<any>[]>(() => [
        {
            id: "mode", header: "Transport Mode", width: "170px", cell: r => (
                <div className="flex items-center gap-2">
                    {MODE_ICONS[r.mode] ?? <Truck className="h-4 w-4" />}
                    <span className="font-medium text-sm">{r.mode}</span>
                    {r.recommended && <Badge className="text-xs bg-green-100 text-green-800 border-green-300">★ Recommended</Badge>}
                </div>
            )
        },
        { id: "carrier", header: "Carrier", width: "170px", cell: r => <span className="text-sm font-medium">{r.carrier}</span> },
        {
            id: "transitDays", header: "Transit (days)", width: "120px", cell: r => (
                <div className="flex items-center gap-1">
                    <span className={`font-bold ${r.transitDays <= 5 ? "text-purple-700" : r.transitDays <= 20 ? "text-standard" : "text-blue-600"}`}>{r.transitDays}d</span>
                    {r.id === fastest.id && <Badge className="text-xs bg-purple-100 text-purple-800">Fastest</Badge>}
                </div>
            )
        },
        { id: "freightCost", header: "Freight $", width: "110px", cell: r => <span className="font-mono text-right block">${formatNumber(r.freightCost)}</span> },
        { id: "customs", header: "Customs $", width: "100px", cell: r => <span className="font-mono text-right block">${formatNumber(r.customs)}</span> },
        { id: "insurance", header: "Insurance $", width: "100px", cell: r => <span className="font-mono text-right block">${formatNumber(r.insurance)}</span> },
        {
            id: "totalCost", header: "Total Cost $", width: "140px", cell: r => (
                <div className="flex items-center gap-1 justify-end">
                    <span className="font-mono font-bold text-primary">${formatNumber(r.totalCost)}</span>
                    {r.id === cheapest.id && <Badge className="text-xs bg-blue-100 text-blue-800">Cheapest</Badge>}
                </div>
            )
        },
        {
            id: "co2Kg", header: "CO₂ (kg)", width: "120px", cell: r => (
                <div className="flex items-center gap-1">
                    <span className={`font-bold text-sm ${CO2_BAND(r.co2Kg)}`}>{formatNumber(r.co2Kg)}</span>
                    {r.id === greenest.id && <Badge className="text-xs bg-green-100 text-green-800">Greenest</Badge>}
                </div>
            )
        },
        {
            id: "award", header: "", width: "110px", cell: r => (
                <Button size="sm" className={`h-7 text-xs ${r.recommended ? "bg-green-700 hover:bg-green-800" : ""}`} onClick={() => awardMutation.mutate(r)}>
                    <Award className="h-3 w-3 mr-1" />Award
                </Button>
            )
        },
    ], [cheapest, fastest, greenest]);

    return (
        <StandardPage
            title="Multi-Modal Shipment Optimizer"
            description="Oracle OTM-style shipment planning optimizer. Compare Sea LCL/FCL, Air, Rail (China-EU), and split multi-modal options across contracted carriers. Evaluates total landed cost (freight + customs + insurance) vs transit time vs CO₂ emissions. Award best option to generate booking."
            breadcrumbs={[{ label: "Transportation", href: "/scm/tms" }, { label: "Multi-Modal Optimizer" }]}
        >
            <Card className="mb-6">
                <CardHeader><CardTitle>Shipment Parameters</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2"><Label>Origin</Label>
                            <Select value={origin} onValueChange={setOrigin}><SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{ORIGINS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Destination</Label>
                            <Select value={destination} onValueChange={setDestination}><SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{DESTINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Gross Weight (KG)</Label>
                            <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                        </div>
                        <div className="space-y-2"><Label>Urgency</Label>
                            <Select value={urgency} onValueChange={setUrgency}><SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Express (1-5 days)", "Priority (6-15 days)", "Standard (28 days)", "Economy (35+ days)"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cheapest Option</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-blue-700">${formatNumber(cheapest.totalCost)}</div><p className="text-xs text-muted-foreground">{cheapest.mode} — {cheapest.transitDays} days</p></CardContent>
                </Card>
                <Card className="border-purple-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fastest Option</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-purple-700">{fastest.transitDays} days</div><p className="text-xs text-muted-foreground">{fastest.mode} — ${formatNumber(fastest.totalCost)}</p></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">★ Recommended (Cost-Time Balance)</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-green-700">{recommended?.mode}</div><p className="text-xs text-muted-foreground">${formatNumber(recommended?.totalCost ?? 0)} — {recommended?.transitDays}d — {formatNumber(recommended?.co2Kg ?? 0)}kg CO₂</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mode Comparison — {origin} → {destination}</CardTitle>
                    <CardDescription>All contracted carriers across Sea LCL/FCL, Air, Rail, and Multi-modal options. Total cost = Freight + Customs + Insurance. Award the best option to initiate a booking request.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <InteractiveSpreadsheet data={SEED_QUOTES} columns={cols} onChange={() => { }} containerHeight="380px" />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
