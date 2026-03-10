import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Layers, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

// Oracle GL Balance Cube Inquiry - multi-dimensional pivot with drill-through

const DIMENSIONS = ["Account", "Cost Center", "Entity", "Period", "Currency", "Source"];
const PERIODS = ["Jan-2026", "Feb-2026", "Mar-2026", "Apr-2026", "May-2026", "Jun-2026"];

function generatePivotData(rowDim: string, colDim: string, filterPeriod: string, filterEntity: string) {
    const rowValues: Record<string, string[]> = {
        Account: ["1000 - Cash", "1200 - AR", "2000 - AP", "4000 - Revenue", "5000 - COGS", "6100 - Salaries"],
        "Cost Center": ["1100 Eng", "1200 Sales", "1300 Mktg", "1400 Ops"],
        Entity: ["US Corp", "EU Ltd", "SG Pte"],
        Period: filterPeriod ? [filterPeriod] : PERIODS.slice(0, 4),
        Currency: ["USD", "EUR", "GBP"],
        Source: ["Manual", "Payroll", "AR Module", "AP Module"],
    };
    const colValues: Record<string, string[]> = {
        Period: filterPeriod ? [filterPeriod] : PERIODS.slice(0, 3),
        Account: ["1000 - Cash", "4000 - Revenue", "5000 - COGS"],
        Currency: ["USD", "EUR", "GBP"],
        Source: ["Manual", "AP Module", "AR Module"],
        "Cost Center": ["1100 Eng", "1200 Sales"],
        Entity: ["US Corp", "EU Ltd"],
    };

    const rows = rowValues[rowDim] || rowValues["Account"];
    const cols = colValues[colDim] || colValues["Period"];

    return rows.map(row => {
        const cells: Record<string, number> = {};
        cols.forEach(col => {
            const seed = (row.charCodeAt(0) + col.charCodeAt(0)) * 1234;
            cells[col] = Math.round((Math.sin(seed) * 500000 + 600000) * 100) / 100;
        });
        const total = Object.values(cells).reduce((a, b) => a + b, 0);
        return { label: row, cells, total };
    });
}

export default function BalanceCubeInquiry() {
    const { toast } = useToast();
    const [rowDim, setRowDim] = useState("Account");
    const [colDim, setColDim] = useState("Period");
    const [filterPeriod, setFilterPeriod] = useState("");
    const [filterEntity, setFilterEntity] = useState("All");
    const [hasQueried, setHasQueried] = useState(false);
    const [highlightMode, setHighlightMode] = useState<"none" | "heatmap">("heatmap");

    const colValues = useMemo(() => {
        const map: Record<string, string[]> = {
            Period: filterPeriod ? [filterPeriod] : PERIODS.slice(0, 3),
            Account: ["1000 - Cash", "4000 - Revenue", "5000 - COGS"],
            Currency: ["USD", "EUR", "GBP"],
            Source: ["Manual", "AP Module", "AR Module"],
            "Cost Center": ["1100 Eng", "1200 Sales"],
            Entity: ["US Corp", "EU Ltd"],
        };
        return map[colDim] || PERIODS.slice(0, 3);
    }, [colDim, filterPeriod]);

    const pivotData = useMemo(() => {
        if (!hasQueried) return [];
        return generatePivotData(rowDim, colDim, filterPeriod, filterEntity);
    }, [hasQueried, rowDim, colDim, filterPeriod, filterEntity]);

    const maxVal = useMemo(() => Math.max(...pivotData.flatMap(r => Object.values(r.cells))), [pivotData]);
    const minVal = useMemo(() => Math.min(...pivotData.flatMap(r => Object.values(r.cells))), [pivotData]);

    const getCellStyle = (val: number) => {
        if (highlightMode !== "heatmap") return "";
        const range = maxVal - minVal || 1;
        const pct = (val - minVal) / range;
        if (pct > 0.75) return "bg-green-50 dark:bg-green-900/20 font-semibold";
        if (pct > 0.5) return "bg-blue-50 dark:bg-blue-900/10";
        if (pct < 0.25) return "bg-red-50 dark:bg-red-900/20";
        return "";
    };

    const grandTotal = useMemo(() => pivotData.reduce((s, r) => s + r.total, 0), [pivotData]);

    return (
        <StandardPage
            title="Balance Cube Inquiry"
            description="Real-time multi-dimensional pivot of GL account balances. Configure Row and Column dimensions, apply filters, and click any cell to drill through to journal lines."
            breadcrumbs={[
                { label: "General Ledger", href: "/finance/gl/journals" },
                { label: "Inquiries", href: "/finance/gl/inquiry" },
                { label: "Balance Cube Inquiry" },
            ]}
        >
            {/* Axis Selector Panel */}
            <Card className="mb-4">
                <CardContent className="p-4 flex flex-wrap gap-6 items-end">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Row Dimension</Label>
                        <Select value={rowDim} onValueChange={v => { setRowDim(v); setHasQueried(false); }}>
                            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>{DIMENSIONS.filter(d => d !== colDim).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Column Dimension</Label>
                        <Select value={colDim} onValueChange={v => { setColDim(v); setHasQueried(false); }}>
                            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>{DIMENSIONS.filter(d => d !== rowDim).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Filter: Period</Label>
                        <Select value={filterPeriod || "All"} onValueChange={v => setFilterPeriod(v === "All" ? "" : v)}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Periods</SelectItem>
                                {PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Filter: Entity</Label>
                        <Select value={filterEntity} onValueChange={setFilterEntity}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Entities</SelectItem>
                                <SelectItem value="US Corp">US Corp</SelectItem>
                                <SelectItem value="EU Ltd">EU Ltd</SelectItem>
                                <SelectItem value="SG Pte">SG Pte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Cell Highlight</Label>
                        <ToggleGroup type="single" value={highlightMode} onValueChange={v => v && setHighlightMode(v as any)} className="border rounded-md">
                            <ToggleGroupItem value="none" className="text-xs h-9 px-3">None</ToggleGroupItem>
                            <ToggleGroupItem value="heatmap" className="text-xs h-9 px-3">Heatmap</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <Button onClick={() => setHasQueried(true)} className="bg-primary">
                        <Search className="mr-2 h-4 w-4" /> Run Query
                    </Button>
                </CardContent>
            </Card>

            {/* Pivot Table */}
            {hasQueried ? (
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary" /> {rowDim} × {colDim} Pivot
                            </CardTitle>
                            <CardDescription>Click any cell to drill through to the underlying journal lines.</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                            Grand Total: {formatNumber(grandTotal)}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold min-w-[180px] sticky left-0 bg-muted/80">{rowDim}</TableHead>
                                    {colValues.map(col => (
                                        <TableHead key={col} className="text-right font-semibold min-w-[140px]">{col}</TableHead>
                                    ))}
                                    <TableHead className="text-right font-bold min-w-[140px] border-l">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pivotData.map((row, ri) => (
                                    <TableRow key={ri} className="hover:bg-muted/30">
                                        <TableCell className="font-medium sticky left-0 bg-background">{row.label}</TableCell>
                                        {colValues.map(col => (
                                            <TableCell
                                                key={col}
                                                className={`text-right font-mono text-sm cursor-pointer hover:bg-primary/10 transition-colors ${getCellStyle(row.cells[col] || 0)}`}
                                                onClick={() => toast({ title: `Drill-through: ${row.label} × ${col}`, description: `Balance: ${formatNumber(row.cells[col])} — Journal lines would open here` })}
                                            >
                                                {formatNumber(row.cells[col] || 0)}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-mono font-bold border-l">
                                            {formatNumber(row.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* Grand Total row */}
                                <TableRow className="bg-muted/50 font-bold border-t-2">
                                    <TableCell className="font-bold sticky left-0 bg-muted/50">Grand Total</TableCell>
                                    {colValues.map(col => {
                                        const colTotal = pivotData.reduce((s, r) => s + (r.cells[col] || 0), 0);
                                        return (
                                            <TableCell key={col} className="text-right font-mono font-bold">{formatNumber(colTotal)}</TableCell>
                                        );
                                    })}
                                    <TableCell className="text-right font-mono font-bold border-l text-primary">{formatNumber(grandTotal)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <Card className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Configure dimensions and click Run Query</p>
                        <p className="text-sm mt-1">Choose a Row and Column dimension, apply optional filters, then query the GL balance cube.</p>
                    </div>
                </Card>
            )}
        </StandardPage>
    );
}
