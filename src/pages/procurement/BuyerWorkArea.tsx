import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { AlertTriangle, Clock, ShoppingCart, TrendingUp, CheckCircle, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";
import { useLocation } from "wouter";

const SEED_UNMATCHED_PRS: any[] = [
    { id: "PR-0042", description: "Ergonomic chairs x10", requester: "Emma Garcia", urgency: "High", amount: 3800, neededBy: "2026-03-15", daysPending: 8, status: "Pending Sourcing" },
    { id: "PR-0038", description: "AWS Marketplace credits", requester: "IT Dept", urgency: "Medium", amount: 12000, neededBy: "2026-03-20", daysPending: 12, status: "Awaiting Buyer" },
    { id: "PR-0033", description: "Lab chemicals — Batch Q1", requester: "R&D Lab", urgency: "Critical", amount: 5600, neededBy: "2026-03-10", daysPending: 18, status: "Overdue" },
];

const SEED_OVERDUE_PO: any[] = [
    { id: "PO-2026-1142", supplier: "Industrial Parts Co", description: "Hydraulic valves x50", expectedDate: "2026-02-28", daysPastDue: 9, amount: 14500, status: "Overdue" },
    { id: "PO-2026-1098", supplier: "Acme Office Supplies", description: "Q1 Stationery Pack", expectedDate: "2026-03-01", daysPastDue: 7, amount: 2800, status: "Overdue" },
    { id: "PO-2026-1071", supplier: "Tech Hardware Inc", description: "Dell monitors x20", expectedDate: "2026-03-04", daysPastDue: 4, amount: 18000, status: "At Risk" },
];

const SEED_PRICE_ALERTS: any[] = [
    { id: "PA-001", item: "Aluminium Sheet 2mm", supplier: "MetalsCo", agreedPrice: 3.50, quotedPrice: 4.20, variance: "+20%", impact: 2100, alert: "Price Increase" },
    { id: "PA-002", item: "A4 Paper (Pallet)", supplier: "PaperWorld", agreedPrice: 320.00, quotedPrice: 298.00, variance: "-6.9%", impact: -220, alert: "Savings Opportunity" },
];

const SEED_PENDING_APPROVALS: any[] = [
    { id: "PR-0044", description: "Marketing Event Equipment", requester: "Mark Johnson", amount: 25000, submittedDate: "2026-03-06", daysWaiting: 2, approver: "Sarah Chen", status: "Pending" },
    { id: "PR-0041", description: "Software Licences — Annual", requester: "IT Admin", amount: 48000, submittedDate: "2026-03-04", daysWaiting: 4, approver: "Sarah Chen", status: "Pending" },
    { id: "PO-AMEND-099", description: "PO Amendment — extra qty", requester: "Warehouse Mgr", amount: 5800, submittedDate: "2026-03-05", daysWaiting: 3, approver: "VP Operations", status: "Escalated" },
];

export default function BuyerWorkArea() {
    const [, setLocation] = useLocation();

    const prColumns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "PR #", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "description", header: "Description", width: "240px", cell: r => <span className="font-medium">{r.description}</span> },
        { id: "requester", header: "Requester", width: "140px" },
        { id: "urgency", header: "Urgency", width: "100px", cell: r => <Badge variant={r.urgency === "Critical" ? "destructive" : r.urgency === "High" ? "default" : "outline"} className="text-xs">{r.urgency}</Badge> },
        { id: "amount", header: "Amount", width: "110px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.amount)}</span> },
        { id: "neededBy", header: "Needed By", width: "110px", cell: r => <span className={r.status === "Overdue" ? "text-red-600 font-semibold" : ""}>{formatDate(r.neededBy)}</span> },
        { id: "daysPending", header: "Days Pending", width: "110px", cell: r => <span className={`text-center block font-bold ${r.daysPending > 14 ? "text-red-600" : r.daysPending > 7 ? "text-amber-600" : "text-muted-foreground"}`}>{r.daysPending}</span> },
        { id: "status", header: "Status", width: "150px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "110px", cell: () => <Button size="sm" variant="outline" className="h-7 text-xs">Create PO <ChevronRight className="h-3 w-3" /></Button> },
    ], []);

    const poColumns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "PO #", width: "130px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "supplier", header: "Supplier", width: "180px", cell: r => <span className="font-medium">{r.supplier}</span> },
        { id: "description", header: "Description", width: "220px" },
        { id: "expectedDate", header: "Expected Date", width: "130px", cell: r => <span className="text-red-600 font-semibold">{formatDate(r.expectedDate)}</span> },
        { id: "daysPastDue", header: "Days Past Due", width: "120px", cell: r => <span className={`text-center block font-bold ${r.daysPastDue > 7 ? "text-red-600" : "text-amber-600"}`}>{r.daysPastDue}</span> },
        { id: "amount", header: "PO Value", width: "110px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.amount)}</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "130px", cell: () => <Button size="sm" variant="outline" className="h-7 text-xs">Contact Supplier</Button> },
    ], []);

    const alertColumns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "item", header: "Item", width: "200px", cell: r => <span className="font-medium">{r.item}</span> },
        { id: "supplier", header: "Supplier", width: "150px" },
        { id: "agreedPrice", header: "BPA Price", width: "110px", cell: r => <span className="text-right block">${formatNumber(r.agreedPrice)}</span> },
        { id: "quotedPrice", header: "Quoted Price", width: "120px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.quotedPrice)}</span> },
        { id: "variance", header: "Variance", width: "100px", cell: r => <Badge variant={r.variance.startsWith("+") ? "destructive" : "outline"} className="text-xs">{r.variance}</Badge> },
        { id: "impact", header: "$ Impact", width: "110px", cell: r => <span className={`text-right block font-bold ${r.impact > 0 ? "text-red-600" : "text-green-700"}`}>{r.impact > 0 ? "+" : ""}{formatNumber(r.impact)}</span> },
        { id: "alert", header: "Alert Type", width: "160px", cell: r => <Badge variant={r.alert === "Price Increase" ? "destructive" : "secondary"} className="text-xs">{r.alert}</Badge> },
    ], []);

    const approvalColumns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Ref #", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "description", header: "Description", width: "240px", cell: r => <span className="font-medium">{r.description}</span> },
        { id: "requester", header: "Requester", width: "140px" },
        { id: "amount", header: "Amount", width: "110px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.amount)}</span> },
        { id: "daysWaiting", header: "Days Waiting", width: "110px", cell: r => <span className={`text-center block font-bold ${r.daysWaiting >= 4 ? "text-red-600" : "text-amber-600"}`}>{r.daysWaiting}</span> },
        { id: "approver", header: "Approver", width: "130px" },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "140px", cell: () => <Button size="sm" variant="outline" className="h-7 text-xs">Remind Approver</Button> },
    ], []);

    return (
        <StandardPage
            title="Buyer Work Area"
            description="Exception-based procurement dashboard. Manage unfulfilled PRs, overdue POs, price anomalies, and pending approvals in one view."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Procurement", href: "/scm/procurement" }, { label: "Buyer Work Area" }]}
        >
            {/* Exception KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-700 dark:text-amber-400 flex gap-2 items-center"><ShoppingCart className="h-4 w-4" />Unmatched PRs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{SEED_UNMATCHED_PRS.length}</div><p className="text-xs text-muted-foreground">Awaiting buyer action</p></CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400 flex gap-2 items-center"><Clock className="h-4 w-4" />Overdue POs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-700 dark:text-red-400">{SEED_OVERDUE_PO.length}</div><p className="text-xs text-muted-foreground">Past expected receipt</p></CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700 dark:text-orange-400 flex gap-2 items-center"><AlertTriangle className="h-4 w-4" />Price Alerts</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{SEED_PRICE_ALERTS.length}</div><p className="text-xs text-muted-foreground">Price deviations found</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4" />Pending Approvals</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_PENDING_APPROVALS.length}</div><p className="text-xs text-muted-foreground">Awaiting approval</p></CardContent>
                </Card>
            </div>

            <Card>
                <Tabs defaultValue="unmatched-prs">
                    <CardHeader>
                        <CardTitle>Buyer Exceptions</CardTitle>
                        <TabsList className="mt-2">
                            <TabsTrigger value="unmatched-prs">Unmatched PRs ({SEED_UNMATCHED_PRS.length})</TabsTrigger>
                            <TabsTrigger value="overdue-pos">Overdue POs ({SEED_OVERDUE_PO.length})</TabsTrigger>
                            <TabsTrigger value="price-alerts">Price Alerts ({SEED_PRICE_ALERTS.length})</TabsTrigger>
                            <TabsTrigger value="approvals">Pending Approvals ({SEED_PENDING_APPROVALS.length})</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TabsContent value="unmatched-prs" className="mt-0">
                            <InteractiveSpreadsheet data={SEED_UNMATCHED_PRS} columns={prColumns} onChange={() => { }} containerHeight="380px" />
                        </TabsContent>
                        <TabsContent value="overdue-pos" className="mt-0">
                            <InteractiveSpreadsheet data={SEED_OVERDUE_PO} columns={poColumns} onChange={() => { }} containerHeight="380px" />
                        </TabsContent>
                        <TabsContent value="price-alerts" className="mt-0">
                            <InteractiveSpreadsheet data={SEED_PRICE_ALERTS} columns={alertColumns} onChange={() => { }} containerHeight="380px" />
                        </TabsContent>
                        <TabsContent value="approvals" className="mt-0">
                            <InteractiveSpreadsheet data={SEED_PENDING_APPROVALS} columns={approvalColumns} onChange={() => { }} containerHeight="380px" />
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </StandardPage>
    );
}
