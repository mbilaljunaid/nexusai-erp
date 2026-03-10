import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Play, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface VatReturnLine {
    id: string;
    boxNumber: string;
    description: string;
    value: number;
}

const MOCK_MTD_LINES: VatReturnLine[] = [
    { id: "1", boxNumber: "Box 1", description: "VAT due in this period on sales and other outputs", value: 48320.00 },
    { id: "2", boxNumber: "Box 2", description: "VAT due in this period on acquisitions from other EU Member States", value: 0.00 },
    { id: "3", boxNumber: "Box 3", description: "Total VAT due (= Sum of Box 1 and Box 2)", value: 48320.00 },
    { id: "4", boxNumber: "Box 4", description: "VAT reclaimed in this period on purchases and other inputs (including acquisitions from the EU)", value: 28540.50 },
    { id: "5", boxNumber: "Box 5", description: "Net VAT to be paid or reclaimed (= Difference between Box 3 and Box 4)", value: 19779.50 },
    { id: "6", boxNumber: "Box 6", description: "Total value of sales and all other outputs excluding any VAT (whole pounds only)", value: 241600.00 },
    { id: "7", boxNumber: "Box 7", description: "Total value of purchases and all inputs excluding any VAT (whole pounds only)", value: 142702.50 },
    { id: "8", boxNumber: "Box 8", description: "Total value of all supplies of goods and related costs to EU Member States", value: 0.00 },
    { id: "9", boxNumber: "Box 9", description: "Total value of all acquisitions of goods and related costs from EU Member States", value: 0.00 },
];

type ReturnStatus = "Draft" | "Submitted" | "Accepted" | "Error";

interface VatReturn {
    id: string;
    period: string;
    dueDate: string;
    regime: string;
    netPayable: number;
    status: ReturnStatus;
}

const MOCK_RETURNS: VatReturn[] = [
    { id: "VAT-2026-Q1", period: "Jan – Mar 2026", dueDate: "2026-05-07", regime: "MTD GB", netPayable: 19779.50, status: "Draft" },
    { id: "VAT-2025-Q4", period: "Oct – Dec 2025", dueDate: "2026-02-07", regime: "MTD GB", netPayable: 22140.00, status: "Accepted" },
    { id: "VAT-2025-Q3", period: "Jul – Sep 2025", dueDate: "2025-11-07", regime: "MTD GB", netPayable: 18870.00, status: "Accepted" },
];

const statusColors: Record<ReturnStatus, string> = {
    Draft: "secondary",
    Submitted: "outline",
    Accepted: "default",
    Error: "destructive",
};

export default function VatReturnOutput() {
    const { toast } = useToast();
    const [selectedPeriod, setSelectedPeriod] = useState("2026-Q1");
    const [selectedRegime, setSelectedRegime] = useState("MTD-GB");
    const [returns, setReturns] = useState<VatReturn[]>(MOCK_RETURNS);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    const returnColumns: SpreadsheetColumn<VatReturn>[] = useMemo(() => [
        { id: "id", header: "Return ID", width: "130px", cellClassName: "font-mono text-sm font-medium", cell: (r) => r.id },
        { id: "period", header: "VAT Period", width: "170px", cell: (r) => r.period },
        { id: "regime", header: "Regime", width: "110px", cell: (r) => <Badge variant="outline">{r.regime}</Badge> },
        { id: "dueDate", header: "Due Date", width: "120px", cellClassName: "font-mono text-sm", cell: (r) => r.dueDate },
        { id: "netPayable", header: "Net Payable (£)", width: "150px", cellClassName: "text-right font-mono font-medium", cell: (r) => formatNumber(r.netPayable) },
        { id: "status", header: "Status", width: "120px", cell: (r) => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "200px",
            cell: (r) => (
                <div className="flex gap-1">
                    {r.status === "Draft" && (
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setConfirmSubmit(true)}>
                            <Play className="mr-1 h-3 w-3" /> Submit MTD
                        </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast({ title: "Downloading XML", description: `${r.id} VAT return XML exported.` })}>
                        <Download className="h-3 w-3" />
                    </Button>
                </div>
            ),
        },
    ], []);

    const lineColumns: SpreadsheetColumn<VatReturnLine>[] = useMemo(() => [
        { id: "boxNumber", header: "Box", width: "80px", cellClassName: "font-bold text-sm", cell: (r) => r.boxNumber },
        { id: "description", header: "Description", width: "520px", cellClassName: "text-sm text-muted-foreground", cell: (r) => r.description },
        {
            id: "value", header: "Value (£)", width: "140px",
            cellClassName: "text-right font-mono font-medium",
            cell: (r) => (
                <span className={r.boxNumber === "Box 5" ? "text-primary font-bold" : ""}>
                    {formatNumber(r.value)}
                </span>
            ),
        },
    ], []);

    return (
        <StandardPage
            title="VAT Return Output"
            description="Generate country-specific VAT returns for MTD (UK), XML (EU), and other regimes. Submit directly to HMRC via Making Tax Digital API."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Tax Management", href: "/finance/tax" },
                { label: "VAT Return Output" },
            ]}
        >
            <Tabs defaultValue="returns">
                <TabsList className="mb-4">
                    <TabsTrigger value="returns">VAT Return History</TabsTrigger>
                    <TabsTrigger value="current">Current Return (2026 Q1)</TabsTrigger>
                </TabsList>

                <TabsContent value="returns">
                    <InteractiveSpreadsheet<VatReturn>
                        data={returns}
                        columns={returnColumns}
                        onChange={() => { }}
                        containerHeight="380px"
                    />
                </TabsContent>

                <TabsContent value="current">
                    <Card className="mb-4">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>VAT Return — January to March 2026</CardTitle>
                                    <CardDescription>Regime: Making Tax Digital (MTD GB) · Due: 7 May 2026</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => toast({ title: "XML exported", description: "VAT100 XML file downloaded." })}>
                                        <Download className="mr-2 h-4 w-4" /> Export XML
                                    </Button>
                                    <Button size="sm" onClick={() => setConfirmSubmit(true)}>
                                        <Play className="mr-2 h-4 w-4" /> Submit to HMRC
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <InteractiveSpreadsheet<VatReturnLine>
                        data={MOCK_MTD_LINES}
                        columns={lineColumns}
                        onChange={() => { }}
                        containerHeight="340px"
                    />

                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                        <strong>Oracle Parity:</strong> This MTD return has been automatically compiled from tax transactions posted to the Tax Management subledger during the return period. Submission uses the HMRC MTD VAT API v1.0.
                    </div>
                </TabsContent>
            </Tabs>

            {/* Submit Confirmation */}
            <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit VAT Return to HMRC</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to electronically submit the <strong>2026 Q1</strong> VAT return via Making Tax Digital (MTD).
                            Net VAT payable: <strong>£{formatNumber(19779.50)}</strong>. This action cannot be undone once HMRC accepts the submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setReturns(prev => prev.map(r => r.id === "VAT-2026-Q1" ? { ...r, status: "Submitted" as ReturnStatus } : r));
                            setConfirmSubmit(false);
                            toast({ title: "VAT Return Submitted", description: "2026 Q1 return submitted to HMRC via MTD API. Awaiting confirmation." });
                        }}>
                            Confirm Submission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
