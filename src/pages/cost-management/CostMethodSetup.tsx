import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { Settings, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const COST_METHOD_INFO: Record<string, { description: string; pros: string; cons: string }> = {
    "Standard": { description: "Items valued at a fixed standard cost set at the beginning of each period. Variances are tracked against actual costs.", pros: "Cost stability, variance analysis, simple reporting", cons: "Requires periodic rollup, variances must be investigated" },
    "Average": { description: "Item cost is recalculated as a running weighted average after each receipt. No frozen periods required.", pros: "No periodic freeze required, self-adjusting", cons: "Cost fluctuates with each receipt, harder to forecast" },
    "FIFO": { description: "First-In, First-Out. Each unit is valued at its actual purchase cost, consumed in the order received.", pros: "Accurate cost matching, GAAP/IFRS preferred", cons: "Requires full cost-layer tracking, complex for high-volume orgs" },
    "LIFO": { description: "Last-In, First-Out. Most recently received units are consumed first in the cost flow.", pros: "Tax advantages in inflationary environments", cons: "Not permitted under IFRS, may understate inventory value" },
    "Periodic Average": { description: "Average cost calculated once per period across all receipts in that period (PAC).", pros: "Controlled cost updates, used for month-end close", cons: "Requires month-end processor run" },
};

const SEED_ORGS: any[] = [
    { id: "OC-001", orgCode: "M1", orgName: "US Main Warehouse", costMethod: "Standard", costGroup: "CG_US_STD", effectiveDate: "2026-01-01", lastRollup: "2026-01-31", currency: "USD", status: "Active" },
    { id: "OC-002", orgCode: "W1", orgName: "US West Warehouse", costMethod: "Average", costGroup: "CG_US_AVG", effectiveDate: "2026-01-01", lastRollup: "N/A", currency: "USD", status: "Active" },
    { id: "OC-003", orgCode: "EU1", orgName: "EU Distribution Centre", costMethod: "FIFO", costGroup: "CG_EU_FIFO", effectiveDate: "2026-01-01", lastRollup: "N/A", currency: "EUR", status: "Active" },
];

export default function CostMethodSetup() {
    const { toast } = useToast();
    const [selectedMethod, setSelectedMethod] = useState("Standard");
    const info = COST_METHOD_INFO[selectedMethod];

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "orgCode", header: "Org Code", width: "100px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.orgCode}</Badge> },
        { id: "orgName", header: "Organization", width: "220px", cell: r => <span className="font-medium">{r.orgName}</span> },
        { id: "costMethod", header: "Cost Method", width: "150px", cell: r => <Badge variant="secondary" className="text-xs">{r.costMethod}</Badge> },
        { id: "costGroup", header: "Cost Group", width: "160px", cell: r => <span className="font-mono text-xs">{r.costGroup}</span> },
        { id: "currency", header: "Currency", width: "90px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.currency}</Badge> },
        { id: "effectiveDate", header: "Effective From", width: "130px" },
        { id: "lastRollup", header: "Last Rollup", width: "130px", cell: r => <span className={r.lastRollup === "N/A" ? "text-muted-foreground text-xs" : "text-sm"}>{r.lastRollup}</span> },
        { id: "status", header: "Status", width: "110px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "110px", cell: () => <Button size="sm" variant="outline" className="h-7 text-xs"><Settings className="h-3 w-3 mr-1" />Edit</Button> },
    ], []);

    return (
        <StandardPage
            title="Cost Method Setup"
            description="Configure the inventory valuation method per organization. Supports Standard, Average, FIFO, LIFO, and Periodic Average Costing."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Cost Management", href: "/scm/cost" }, { label: "Cost Method Setup" }]}
        >
            {/* Method reference card */}
            <Card className="mb-6 border-blue-200 bg-blue-50/40 dark:bg-blue-950/20">
                <CardHeader><CardTitle className="text-sm">Method Reference</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-3 mb-4 flex-wrap">
                        {Object.keys(COST_METHOD_INFO).map(m => (
                            <Button key={m} size="sm" variant={selectedMethod === m ? "default" : "outline"} className="text-xs" onClick={() => setSelectedMethod(m)}>{m}</Button>
                        ))}
                    </div>
                    {info && (
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div><p className="font-semibold text-muted-foreground text-xs mb-1">DESCRIPTION</p><p>{info.description}</p></div>
                            <div><p className="font-semibold text-green-700 text-xs mb-1">ADVANTAGES</p><p className="text-muted-foreground">{info.pros}</p></div>
                            <div><p className="font-semibold text-red-600 text-xs mb-1">LIMITATIONS</p><p className="text-muted-foreground">{info.cons}</p></div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Cost Method by Organization</CardTitle><CardDescription>Each inventory organization can have a different cost method. Changing cost method requires a complete period close first.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ORGS} columns={columns} onChange={() => { }} containerHeight="380px" /></CardContent>
            </Card>
        </StandardPage>
    );
}
