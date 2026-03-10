import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface ToleranceLine {
    id: string;
    category: string;
    matchType: "2-Way" | "3-Way" | "4-Way";
    qtyVariancePct: number;
    amtVariancePct: number;
    amtVarianceAbs: number;
    holdCode: string;
    action: "Hold" | "Warn" | "Pass";
}

interface InspectionRule {
    id: string;
    description: string;
    triggerCondition: string;
    holdCode: string;
    requiresGRN: boolean;
    requiresInspection: boolean;
    autoRelease: boolean;
    status: "Active" | "Inactive";
}

const HOLD_CODES = ["MATCH_AMT", "MATCH_QTY", "INSP_REQUIRED", "PRICE_DIFF", "PO_VARIANCE", "PRICE_TOLERANCE"];

const MOCK_TOLERANCES: ToleranceLine[] = [
    { id: "T01", category: "Goods", matchType: "4-Way", qtyVariancePct: 3, amtVariancePct: 2, amtVarianceAbs: 500, holdCode: "MATCH_AMT", action: "Hold" },
    { id: "T02", category: "Goods", matchType: "3-Way", qtyVariancePct: 5, amtVariancePct: 3, amtVarianceAbs: 1000, holdCode: "MATCH_QTY", action: "Hold" },
    { id: "T03", category: "Services", matchType: "2-Way", qtyVariancePct: 0, amtVariancePct: 5, amtVarianceAbs: 2500, holdCode: "PRICE_TOLERANCE", action: "Warn" },
    { id: "T04", category: "Capital Goods", matchType: "4-Way", qtyVariancePct: 1, amtVariancePct: 1, amtVarianceAbs: 250, holdCode: "PO_VARIANCE", action: "Hold" },
];

const MOCK_RULES: InspectionRule[] = [
    { id: "IR01", description: "Received items above $25,000 require physical inspection before AP release", triggerCondition: "PO Line Received Amount > 25000", holdCode: "INSP_REQUIRED", requiresGRN: true, requiresInspection: true, autoRelease: false, status: "Active" },
    { id: "IR02", description: "Perishable goods must be inspected within 48 hours of receipt", triggerCondition: "Item Category = Perishable AND Receipt Date + 2 days <= Today", holdCode: "INSP_REQUIRED", requiresGRN: true, requiresInspection: true, autoRelease: false, status: "Active" },
    { id: "IR03", description: "Capital equipment — inspection report mandatory before PO closure", triggerCondition: "PO Type = Capital AND PO Amount > 50000", holdCode: "INSP_REQUIRED", requiresGRN: true, requiresInspection: true, autoRelease: false, status: "Active" },
    { id: "IR04", description: "Direct-ship to customer — bypass inspection, auto-release on GRN confirmation", triggerCondition: "Ship-to Party = Customer AND Fulfillment Method = Direct Ship", holdCode: "MATCH_QTY", requiresGRN: true, requiresInspection: false, autoRelease: true, status: "Inactive" },
];

const actionBadge: Record<"Hold" | "Warn" | "Pass", string> = { Hold: "destructive", Warn: "outline", Pass: "default" };
const matchBadge: Record<"2-Way" | "3-Way" | "4-Way", string> = { "2-Way": "secondary", "3-Way": "outline", "4-Way": "destructive" };

export default function FourWayMatchConfig() {
    const { toast } = useToast();
    const [tolerances, setTolerances] = useState<ToleranceLine[]>(MOCK_TOLERANCES);
    const [rules, setRules] = useState<InspectionRule[]>(MOCK_RULES);
    const [editTol, setEditTol] = useState<ToleranceLine | null>(null);
    const [tolOpen, setTolOpen] = useState(false);

    // Tolerance edit form state
    const [fQty, setFQty] = useState("");
    const [fAmt, setFAmt] = useState("");
    const [fAmtAbs, setFAmtAbs] = useState("");
    const [fAction, setFAction] = useState<"Hold" | "Warn" | "Pass">("Hold");
    const [fHold, setFHold] = useState(HOLD_CODES[0]);

    const openTol = (t: ToleranceLine) => {
        setEditTol(t);
        setFQty(String(t.qtyVariancePct));
        setFAmt(String(t.amtVariancePct));
        setFAmtAbs(String(t.amtVarianceAbs));
        setFAction(t.action);
        setFHold(t.holdCode);
        setTolOpen(true);
    };

    const saveTol = () => {
        if (!editTol) return;
        setTolerances(prev => prev.map(t => t.id === editTol.id ? {
            ...t, qtyVariancePct: parseFloat(fQty), amtVariancePct: parseFloat(fAmt),
            amtVarianceAbs: parseFloat(fAmtAbs), action: fAction, holdCode: fHold,
        } : t));
        toast({ title: "Tolerance Updated", description: `${editTol.matchType} tolerance for ${editTol.category} saved.` });
        setTolOpen(false);
    };

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r));
        const rule = rules.find(r => r.id === id);
        toast({ title: `Inspection Rule ${rule?.status === "Active" ? "Deactivated" : "Activated"}` });
    };

    const tolColumns: SpreadsheetColumn<ToleranceLine>[] = useMemo(() => [
        { id: "category", header: "Item Category", width: "140px", cellClassName: "font-medium text-sm", cell: r => r.category },
        { id: "matchType", header: "Match Type", width: "90px", cell: r => <Badge variant={matchBadge[r.matchType] as any}>{r.matchType}</Badge> },
        { id: "qty", header: "Qty Variance", width: "120px", cellClassName: "font-mono text-center", cell: r => r.qtyVariancePct > 0 ? `±${r.qtyVariancePct}%` : "N/A" },
        { id: "amt", header: "Amt Variance", width: "120px", cellClassName: "font-mono text-center", cell: r => `±${r.amtVariancePct}%` },
        { id: "amtAbs", header: "Abs Tolerance", width: "130px", cellClassName: "font-mono text-center", cell: r => `USD ${formatNumber(r.amtVarianceAbs)}` },
        { id: "holdCode", header: "Hold Code", width: "130px", cellClassName: "font-mono text-xs text-muted-foreground", cell: r => r.holdCode },
        { id: "action", header: "Breach Action", width: "110px", cell: r => <Badge variant={actionBadge[r.action] as any}>{r.action}</Badge> },
        { id: "actions", header: "", width: "80px", cell: r => <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openTol(r)}>Edit</Button> },
    ], []);

    const ruleColumns: SpreadsheetColumn<InspectionRule>[] = useMemo(() => [
        { id: "desc", header: "Rule Description", width: "280px", cellClassName: "text-sm", cell: r => r.description },
        { id: "trigger", header: "Trigger Condition", width: "250px", cellClassName: "font-mono text-xs text-muted-foreground", cell: r => r.triggerCondition },
        { id: "grn", header: "GRN Required", width: "110px", cell: r => <Badge variant={r.requiresGRN ? "default" : "secondary"}>{r.requiresGRN ? "Yes" : "No"}</Badge> },
        { id: "insp", header: "Inspection Req", width: "120px", cell: r => <Badge variant={r.requiresInspection ? "destructive" : "secondary"}>{r.requiresInspection ? "Yes" : "No"}</Badge> },
        { id: "auto", header: "Auto-Release", width: "110px", cell: r => <Badge variant={r.autoRelease ? "default" : "outline"}>{r.autoRelease ? "Yes" : "No"}</Badge> },
        { id: "status", header: "Status", width: "90px", cell: r => <Badge variant={r.status === "Active" ? "default" : "secondary"}>{r.status}</Badge> },
        {
            id: "actions", header: "", width: "100px",
            cell: r => (
                <Button size="sm" variant={r.status === "Active" ? "outline" : "default"} className="h-7 px-2 text-xs"
                    onClick={() => toggleRule(r.id)}>
                    {r.status === "Active" ? "Deactivate" : "Activate"}
                </Button>
            ),
        },
    ], [rules]);

    return (
        <StandardPage
            title="4-Way Match & Inspection Hold Configuration"
            description="Define tolerance thresholds that drive the 2-Way, 3-Way, and 4-Way matching engine. Configure inspection hold rules that block AP invoice payment until a GRN inspection is confirmed."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "4-Way Match Config" },
            ]}
            actions={<Button size="sm" variant="outline"><Settings className="mr-2 h-4 w-4" /> Global Defaults</Button>}
        >
            <div className="mb-4 grid grid-cols-3 gap-3">
                {[
                    { label: "2-Way Match", desc: "PO ↔ Invoice", note: "Price & quantity check", color: "border-l-secondary" },
                    { label: "3-Way Match", desc: "PO ↔ Receipt ↔ Invoice", note: "Adds GRN confirmation", color: "border-l-primary" },
                    { label: "4-Way Match", desc: "PO ↔ Receipt ↔ Inspection ↔ Invoice", note: "Adds inspection clearance", color: "border-l-destructive" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm">{m.label}</CardTitle>
                            <CardDescription className="text-xs">{m.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <p className="text-xs text-muted-foreground">{m.note}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="tolerances">
                <TabsList className="mb-3">
                    <TabsTrigger value="tolerances">Tolerance Thresholds</TabsTrigger>
                    <TabsTrigger value="inspection">Inspection Hold Rules</TabsTrigger>
                </TabsList>
                <TabsContent value="tolerances">
                    <div className="mb-2 p-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        When an invoice breaches the configured tolerance, the system applies the specified hold code and either holds, warns, or auto-passes based on the breach action setting.
                    </div>
                    <InteractiveSpreadsheet<ToleranceLine> data={tolerances} columns={tolColumns} onChange={() => { }} containerHeight="340px" />
                </TabsContent>
                <TabsContent value="inspection">
                    <div className="mb-2 p-2.5 bg-muted/30 border rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                        Inspection rules add a 4th gate to the matching process. Invoices matching a trigger condition are held until the purchasing team confirms inspection clearance. Auto-Release rules bypass this for low-risk scenarios.
                    </div>
                    <InteractiveSpreadsheet<InspectionRule> data={rules} columns={ruleColumns} onChange={() => { }} containerHeight="340px" />
                </TabsContent>
            </Tabs>

            {/* Tolerance Edit Dialog */}
            <Dialog open={tolOpen} onOpenChange={setTolOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Tolerance — {editTol?.matchType} | {editTol?.category}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            {editTol?.qtyVariancePct !== undefined && (
                                <div className="space-y-1">
                                    <Label>Qty Variance % ±</Label>
                                    <Input type="number" step="0.1" className="font-mono" value={fQty} onChange={e => setFQty(e.target.value)} />
                                </div>
                            )}
                            <div className="space-y-1">
                                <Label>Amount Variance % ±</Label>
                                <Input type="number" step="0.1" className="font-mono" value={fAmt} onChange={e => setFAmt(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Absolute Tolerance (USD)</Label>
                                <Input type="number" step="100" className="font-mono" value={fAmtAbs} onChange={e => setFAmtAbs(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Breach Action</Label>
                                <Select value={fAction} onValueChange={v => setFAction(v as typeof fAction)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hold">Hold (blocks payment)</SelectItem>
                                        <SelectItem value="Warn">Warn (displays alert)</SelectItem>
                                        <SelectItem value="Pass">Pass (auto-approve)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label>Hold Code</Label>
                                <Select value={fHold} onValueChange={setFHold}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{HOLD_CODES.map(h => <SelectItem key={h} value={h} className="font-mono">{h}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTolOpen(false)}>Cancel</Button>
                        <Button onClick={saveTol}>Save Tolerance</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
