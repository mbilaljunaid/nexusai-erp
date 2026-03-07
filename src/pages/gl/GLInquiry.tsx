import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLedger } from "@/context/LedgerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, Loader2, ArrowRight, LayoutGrid } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";
import { format } from "date-fns";
import { StandardPage } from "@/components/layout/StandardPage";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { formatNumber } from '@/lib/formatters';
import { Link } from "wouter";

export default function GLInquiry() {
    const { currentLedgerId, activeLedger } = useLedger();

    const [periodId, setPeriodId] = useState("");
    const [ccid, setCcid] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [filterSource, setFilterSource] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterCurrency, setFilterCurrency] = useState("All");
    const [viewBy, setViewBy] = useState("line");

    const { data: periods } = useQuery<any[]>({
        queryKey: ["/api/gl/periods", { ledgerId: currentLedgerId }],
        enabled: !!currentLedgerId
    });

    const { data: inquiryData, isLoading, refetch } = useQuery<any>({
        queryKey: ["/api/gl/inquire", { ledgerId: currentLedgerId, periodId, ccid }],
        enabled: false, // Only manual trigger
    });

    const handleSearch = () => {
        if (!periodId || !ccid) return;
        setHasSearched(true);
        refetch();
    };

    const allLines = inquiryData?.transactionLines || [];

    const filteredLines = useMemo(() => {
        return allLines.filter((line: any) => {
            if (filterSource !== "All" && (line.journal?.source || 'Manual') !== filterSource) return false;
            if (filterCategory !== "All" && (line.journal?.category || 'Manual') !== filterCategory) return false;
            if (filterCurrency !== "All" && (line.currencyCode || activeLedger?.currencyCode || 'USD') !== filterCurrency) return false;
            return true;
        });
    }, [allLines, filterSource, filterCategory, filterCurrency, activeLedger]);

    const groupedLines = useMemo(() => {
        if (viewBy === "line") return null;
        const key = viewBy === "source" ? (l: any) => l.journal?.source || 'Manual'
            : viewBy === "category" ? (l: any) => l.journal?.category || 'Manual'
                : (l: any) => l.currencyCode || 'USD';
        const groups: Record<string, { label: string; debit: number; credit: number; count: number }> = {};
        filteredLines.forEach((l: any) => {
            const k = key(l);
            if (!groups[k]) groups[k] = { label: k, debit: 0, credit: 0, count: 0 };
            groups[k].debit += parseFloat(l.accountedDebit) || 0;
            groups[k].credit += parseFloat(l.accountedCredit) || 0;
            groups[k].count++;
        });
        return Object.values(groups);
    }, [filteredLines, viewBy]);

    const lines = filteredLines;
    const totalDebit = lines.reduce((acc: number, line: any) => acc + (parseFloat(line.accountedDebit) || 0), 0);
    const totalCredit = lines.reduce((acc: number, line: any) => acc + (parseFloat(line.accountedCredit) || 0), 0);
    const netChange = totalDebit - totalCredit;

    const uniqueSources = useMemo(() => ['All', ...Array.from(new Set(allLines.map((l: any) => l.journal?.source || 'Manual')))], [allLines]);
    const uniqueCategories = useMemo(() => ['All', ...Array.from(new Set(allLines.map((l: any) => l.journal?.category || 'Manual')))], [allLines]);
    const uniqueCurrencies = useMemo(() => ['All', ...Array.from(new Set(allLines.map((l: any) => l.currencyCode || activeLedger?.currencyCode || 'USD')))], [allLines, activeLedger]);

    return (
        <StandardPage
            title="Account Inquiry"
            breadcrumbs={[
                { label: "General Ledger", href: "/gl/journals" },
                { label: "Account Inquiry" },
            ]}
            description={<LedgerContextBadge />}
            className="animate-in fade-in duration-500"
        >
            <Card className="shadow-md border-t-4 border-t-indigo-500 mb-6">
                <CardHeader className="bg-muted/10 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Search className="h-5 w-5 text-indigo-500" />
                        Inquiry Parameters
                    </CardTitle>
                    <CardDescription>Select a period and account combination to view detailed balances and journal lines.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="col-span-1 md:col-span-3 space-y-2">
                            <Label>Accounting Period</Label>
                            <Select value={periodId} onValueChange={setPeriodId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods?.map((p) => (
                                        <SelectItem key={p.id} value={p.periodName || p.id}>
                                            {p.periodName || p.id}
                                        </SelectItem>
                                    ))}
                                    {(!periods || periods.length === 0) && (
                                        <SelectItem value="Jan-2026">Jan-2026</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1 md:col-span-7 space-y-2">
                            <Label>Account Combination</Label>
                            <CodeCombinationPicker value={ccid} onChange={setCcid} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={handleSearch}
                                disabled={!periodId || !ccid || isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                Inquire
                            </Button>
                        </div>
                    </div>
                    {hasSearched && (
                        <div className="flex flex-wrap items-end gap-4 pt-4 border-t mt-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Source</Label>
                                <Select value={filterSource} onValueChange={setFilterSource}>
                                    <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{uniqueSources.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Category</Label>
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{uniqueCategories.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Currency</Label>
                                <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{uniqueCurrencies.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1 ml-auto">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><LayoutGrid className="h-3 w-3" /> View By</Label>
                                <ToggleGroup type="single" value={viewBy} onValueChange={(v) => v && setViewBy(v)} className="border rounded-md">
                                    <ToggleGroupItem value="line" className="text-xs h-8 px-3">Line</ToggleGroupItem>
                                    <ToggleGroupItem value="source" className="text-xs h-8 px-3">Source</ToggleGroupItem>
                                    <ToggleGroupItem value="category" className="text-xs h-8 px-3">Category</ToggleGroupItem>
                                    <ToggleGroupItem value="currency" className="text-xs h-8 px-3">Currency</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {hasSearched && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="shadow-sm border-l-4 border-l-blue-500 bg-blue-500/10">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Period Debits</p>
                                <h3 className="text-3xl font-bold text-foreground dark:text-slate-200 font-mono">
                                    {formatNumber(totalDebit, 2)}
                                </h3>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-l-blue-500 bg-blue-500/10">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Period Credits</p>
                                <h3 className="text-3xl font-bold text-foreground dark:text-slate-200 font-mono">
                                    {formatNumber(totalCredit, 2)}
                                </h3>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-indigo-500/10">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-indigo-700 mb-1">Net Period Change</p>
                                <h3 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 font-mono">
                                    {formatNumber(netChange, 2)}
                                </h3>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-lg border-none">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-muted-foreground" />
                                        Transaction Drilldown
                                    </CardTitle>
                                    <CardDescription>Journal lines composing the period balance.</CardDescription>
                                </div>
                                <Badge variant="outline" className="font-mono">{inquiryData?.totalCount || 0} Lines</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-28 pl-6">Batch #</TableHead>
                                        <TableHead className="w-36">Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-28">Source</TableHead>
                                        <TableHead className="text-right w-36">Debit ({activeLedger?.currencyCode || 'USD'})</TableHead>
                                        <TableHead className="text-right w-36 pr-6">Credit ({activeLedger?.currencyCode || 'USD'})</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                Fetching transactions...
                                            </TableCell>
                                        </TableRow>
                                    ) : lines.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                No transactions found for this account in this period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lines.map((line: any, idx: number) => (
                                            <TableRow key={line.id || idx} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="pl-6 font-mono text-xs font-semibold text-indigo-600">
                                                    <Link href={`/finance/gl/journals/${line.journalId}`} className="hover:underline flex items-center gap-1">
                                                        {line.journal?.journalNumber || "JE-???"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {line.journal?.accountingDate ? format(new Date(line.journal.accountingDate), 'dd-MMM-yyyy') : '-'}
                                                </TableCell>
                                                <TableCell className="text-sm max-w-72 truncate">
                                                    {line.description || line.journal?.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <Badge variant="secondary" className="font-normal text-xs">{line.journal?.source || 'Manual'}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {line.accountedDebit ? formatNumber(parseFloat(line.accountedDebit), 2) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm pr-6">
                                                    {line.accountedCredit ? formatNumber(parseFloat(line.accountedCredit), 2) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </StandardPage>
    );
}
