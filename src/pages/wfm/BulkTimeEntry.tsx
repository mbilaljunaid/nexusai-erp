import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export interface TimeEntryRow {
    id: number;
    date: string;
    hours: number;
    project: string;
    status: string;
}

export default function BulkTimeEntry() {
    const [entries, setEntries] = useState<TimeEntryRow[]>([
        { id: 1, date: "2026-02-10", hours: 8, project: "P001", status: "Pending" },
        { id: 2, date: "2026-02-11", hours: 7.5, project: "P001", status: "Pending" },
    ]);
    const { toast } = useToast();

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const rows = text.split('\n').filter(r => r.trim());
            const newLines = rows.map((row, i) => {
                const cols = row.split('\t');
                return {
                    id: entries.length + i + 1,
                    date: cols[0] || new Date().toISOString().split('T')[0],
                    project: cols[1] || "",
                    hours: Number(cols[2]) || 0,
                    status: "Pending"
                };
            });
            setEntries([...entries, ...newLines]);
            toast({ title: "Imported", description: `${newLines.length} lines pasted from clipboard` });
        } catch (err) {
            toast({ title: "Error", description: "Failed to read clipboard", variant: "destructive" });
        }
    };

    const columns: SpreadsheetColumn<TimeEntryRow>[] = [
        {
            id: "date",
            header: "Date",
            width: "150px",
            cell: (row, index, updateRow) => (
                <Input type="date" className="h-9 w-full" value={row.date} onChange={e => updateRow("date", e.target.value)} />
            )
        },
        {
            id: "project",
            header: "Project",
            width: "1fr",
            cell: (row, index, updateRow) => (
                <Input className="h-9 w-full" value={row.project} onChange={e => updateRow("project", e.target.value)} placeholder="Project Code" />
            )
        },
        {
            id: "hours",
            header: "Hours",
            width: "100px",
            headerClassName: "text-right",
            cell: (row, index, updateRow) => (
                <Input type="number" step="0.5" className="h-9 w-full text-right" value={row.hours} onChange={e => updateRow("hours", parseFloat(e.target.value) || 0)} />
            )
        },
        {
            id: "status",
            header: "Status",
            width: "120px",
            cell: (row) => (
                <div className="flex items-center h-full">
                    <Badge variant={row.status === 'Pending' ? 'secondary' : 'default'}>{row.status}</Badge>
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Bulk Time Entry</h1>
                    <p className="text-muted-foreground">Spreadsheet-style time entry with templates</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex-1 overflow-hidden min-h-[400px]">
                        <InteractiveSpreadsheet
                            data={entries}
                            columns={columns}
                            onChange={(newData) => setEntries(newData as TimeEntryRow[])}
                            virtualized={true}
                            rowHeight={45}
                            containerHeight="400px"
                            onPasteFromClipboard={handlePaste}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
