
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Loader2, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadFile } from "@/lib/utils";
import { DatePicker } from '@/components/ui/DatePicker';

interface ReportType {
    id: string;
    name: string;
    description: string;
}

export default function HRReports() {
    const [selectedType, setSelectedType] = useState<string>("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // Fetch Report Types
    const { data: reportTypes, isLoading: isLoadingTypes } = useQuery<ReportType[]>({
        queryKey: ["/api/hr/reports/types"],
        queryFn: () => fetch("/api/hr/reports/types").then(r => r.json())
    });

    // Fetch Report Data (Only when type is selected)
    const { data: reportData, isLoading: isLoadingData, refetch } = useQuery<any>({
        queryKey: ["/api/hr/reports/generate", selectedType, dateRange],
        queryFn: async () => {
            if (!selectedType) return [];
            const params = new URLSearchParams({
                type: selectedType,
                startDate: dateRange.start,
                endDate: dateRange.end
            });
            const res = await fetch(`/api/hr/reports/generate?${params}`);
            if (!res.ok) throw new Error("Failed to generate report");
            return res.json();
        },
        enabled: false // Trigger manually or on effective inputs change only if desired. Here we trigger on button click usually.
    });

    const handleGenerate = () => {
        if (selectedType) refetch();
    };

    const handleExport = () => {
        if (!reportData || reportData.length === 0) return;

        // Convert to CSV
        const headers = Object.keys(reportData[0]).join(",");
        const rows = reportData.map((row: any) => Object.values(row).map(v => JSON.stringify(v)).join(","));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `${selectedType}_${new Date().toISOString()}.csv`);
    };

    // Dynamic Columns based on data
    const allKeys = reportData && reportData.length > 0 ? Object.keys(reportData[0]) : [];
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    // Initialize visible columns when data loads
    if (reportData && reportData.length > 0 && visibleColumns.length === 0 && allKeys.length > 0) {
        setVisibleColumns(allKeys);
    }

    const columns = allKeys
        .filter(key => visibleColumns.includes(key))
        .map(key => ({
            id: key,
            header: key.replace(/([A-Z])/g, ' $1').trim(), // CamelCase to Title Case
            width: "200px",
            cell: (row: any) => <div className="px-2 h-full flex items-center">{row[key]}</div>
        }));

    return (
        <StandardPage
            title="HR Compliance Reports"
            description="Generate and export regulatory and operational reports"
        >

            <Card>
                <CardHeader><CardTitle>Report Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Report..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {reportTypes?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePicker value={dateRange.start} onChange={v => setDateRange({ ...dateRange, start: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <DatePicker value={dateRange.end} onChange={v => setDateRange({ ...dateRange, end: v })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={handleGenerate} disabled={!selectedType || isLoadingData}>
                            {isLoadingData ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Generate Preview
                        </Button>
                        <Button variant="outline" onClick={handleExport} disabled={!reportData || reportData.length === 0}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Table */}
            {reportData && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Report Preview: {reportTypes?.find(t => t.id === selectedType)?.name}</CardTitle>
                        {/* Column Selector */}
                        <div className="flex gap-2">
                            {allKeys.length > 0 && (
                                <Select onValueChange={(val) => {
                                    if (visibleColumns.includes(val)) {
                                        setVisibleColumns(visibleColumns.filter(c => c !== val));
                                    } else {
                                        setVisibleColumns([...visibleColumns, val]);
                                    }
                                }}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Toggle Columns" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allKeys.map(key => (
                                            <SelectItem key={key} value={key}>
                                                {visibleColumns.includes(key) ? "✅ " : "❌ "}
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[500px] p-0">
                        <InteractiveSpreadsheet
                            data={reportData}
                            columns={columns}
                            onChange={() => { }}
                            virtualized={true}
                            containerHeight="500px"
                        />
                        <div className="p-4 bg-muted/20 border-t">
                            <p className="text-xs text-muted-foreground">Showing max 500 records. Export to CSV for full results.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </StandardPage>
    );
}
