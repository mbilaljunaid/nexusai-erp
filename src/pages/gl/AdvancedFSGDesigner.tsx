import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
    Plus,
    Save,
    Play,
    Trash2,
    Copy,
    Download,
    Eye,
    Settings,
    Calculator,
    TrendingUp
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface FSGRow {
    id: string;
    sequence: number;
    label: string;
    rowType: 'ACCOUNT' | 'FORMULA' | 'HEADER' | 'TOTAL';
    accountRange?: string;
    formula?: string;
    isBold?: boolean;
    isUnderline?: boolean;
    indent?: number;
    conditionalFormat?: ConditionalFormat;
}

interface FSGColumn {
    id: string;
    sequence: number;
    name: string;
    type: 'PERIOD' | 'YTD' | 'BUDGET' | 'VARIANCE' | 'FORMULA';
    periodName?: string;
    formula?: string;
    format?: string;
    drillDown?: boolean;
}

interface ConditionalFormat {
    condition: 'GT' | 'LT' | 'EQ' | 'BETWEEN';
    value1: number;
    value2?: number;
    color: string;
    backgroundColor?: string;
}

interface FSGReport {
    id: number;
    name: string;
    description: string;
    rows: FSGRow[];
    columns: FSGColumn[];
    ledgerId?: number;
    isActive: boolean;
}

export default function AdvancedFSGDesigner() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedReport, setSelectedReport] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("rows");

    // Report state
    const [reportName, setReportName] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [rows, setRows] = useState<FSGRow[]>([]);
    const [columns, setColumns] = useState<FSGColumn[]>([]);

    // Row editor state
    const [editingRow, setEditingRow] = useState<FSGRow | null>(null);
    const [columnEditor, setColumnEditor] = useState<FSGColumn | null>(null);

    // Fetch FSG reports
    const { data: reports, isLoading } = useQuery({
        queryKey: ["/api/gl/fsg-reports"],
        queryFn: () => apiRequest("/api/gl/fsg-reports"),
    });

    // Fetch single report
    const { data: reportData } = useQuery({
        queryKey: ["/api/gl/fsg-reports", selectedReport],
        queryFn: () => apiRequest(`/api/gl/fsg-reports/${selectedReport}`),
        enabled: !!selectedReport,
    });

    // Save report mutation
    const saveMutation = useMutation({
        mutationFn: (data: Partial<FSGReport>) =>
            selectedReport
                ? apiRequest(`/api/gl/fsg-reports/${selectedReport}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                })
                : apiRequest("/api/gl/fsg-reports", {
                    method: "POST",
                    body: JSON.stringify(data),
                }),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "FSG report saved successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/gl/fsg-reports"] });
        },
    });

    // Run report mutation
    const runMutation = useMutation({
        mutationFn: (reportId: number) =>
            apiRequest(`/api/gl/fsg-reports/${reportId}/run`, { method: "POST" }),
        onSuccess: (data) => {
            toast({
                title: "Report Generated",
                description: "Report execution completed successfully",
            });
            // Handle report output display or download
        },
    });

    // Delete report mutation
    const deleteMutation = useMutation({
        mutationFn: (reportId: number) =>
            apiRequest(`/api/gl/fsg-reports/${reportId}`, { method: "DELETE" }),
        onSuccess: () => {
            toast({
                title: "Deleted",
                description: "Report deleted successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/gl/fsg-reports"] });
            setSelectedReport(null);
        },
    });

    const addRow = () => {
        const newRow: FSGRow = {
            id: `row-${Date.now()}`,
            sequence: rows.length + 1,
            label: "New Row",
            rowType: "ACCOUNT",
            indent: 0,
        };
        setRows([...rows, newRow]);
        setEditingRow(newRow);
    };

    const addColumn = () => {
        const newColumn: FSGColumn = {
            id: `col-${Date.now()}`,
            sequence: columns.length + 1,
            name: "New Column",
            type: "PERIOD",
            format: "#,##0.00",
        };
        setColumns([...columns, newColumn]);
        setColumnEditor(newColumn);
    };

    const updateRow = (rowId: string, updates: Partial<FSGRow>) => {
        setRows(rows.map(row => row.id === rowId ? { ...row, ...updates } : row));
    };

    const updateColumn = (colId: string, updates: Partial<FSGColumn>) => {
        setColumns(columns.map(col => col.id === colId ? { ...col, ...updates } : col));
    };

    const deleteRow = (rowId: string) => {
        setRows(rows.filter(row => row.id !== rowId));
        if (editingRow?.id === rowId) setEditingRow(null);
    };

    const deleteColumn = (colId: string) => {
        setColumns(columns.filter(col => col.id !== colId));
        if (columnEditor?.id === colId) setColumnEditor(null);
    };

    const saveReport = () => {
        saveMutation.mutate({
            name: reportName,
            description: reportDescription,
            rows,
            columns,
            isActive: true,
        });
    };

    const runReport = () => {
        if (selectedReport) {
            runMutation.mutate(selectedReport);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Advanced FSG Designer</h1>
                    <p className="text-muted-foreground">
                        Create financial statement generators with formulas and conditional formatting
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedReport(null);
                            setReportName("");
                            setReportDescription("");
                            setRows([]);
                            setColumns([]);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Report
                    </Button>
                    <Button onClick={saveReport} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    <Button onClick={runReport} disabled={!selectedReport || runMutation.isPending}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Report List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Saved Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {reports?.map((report: FSGReport) => (
                            <div
                                key={report.id}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedReport === report.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-accent"
                                    }`}
                                onClick={() => {
                                    setSelectedReport(report.id);
                                    setReportName(report.name);
                                    setReportDescription(report.description);
                                    setRows(report.rows || []);
                                    setColumns(report.columns || []);
                                }}
                            >
                                <div className="font-medium">{report.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {report.rows?.length || 0} rows, {report.columns?.length || 0} cols
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Designer Area */}
                <Card className="col-span-9">
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Report Name</Label>
                                    <Input
                                        value={reportName}
                                        onChange={(e) => setReportName(e.target.value)}
                                        placeholder="e.g., Balance Sheet - Detailed"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={reportDescription}
                                        onChange={(e) => setReportDescription(e.target.value)}
                                        placeholder="Report purpose and notes"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="rows">Rows ({rows.length})</TabsTrigger>
                                <TabsTrigger value="columns">Columns ({columns.length})</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>

                            {/* Rows Tab */}
                            <TabsContent value="rows" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Row Definitions</h3>
                                    <Button onClick={addRow} size="sm">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Row
                                    </Button>
                                </div>

                                <div className="border rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-2 w-8">#</th>
                                                <th className="text-left p-2">Label</th>
                                                <th className="text-left p-2">Type</th>
                                                <th className="text-left p-2">Definition</th>
                                                <th className="text-left p-2 w-24">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row) => (
                                                <tr key={row.id} className="border-t hover:bg-accent">
                                                    <td className="p-2">{row.sequence}</td>
                                                    <td className="p-2">
                                                        <Input
                                                            value={row.label}
                                                            onChange={(e) =>
                                                                updateRow(row.id, { label: e.target.value })
                                                            }
                                                            className="h-8"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Select
                                                            value={row.rowType}
                                                            onValueChange={(value: any) =>
                                                                updateRow(row.id, { rowType: value })
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ACCOUNT">Account</SelectItem>
                                                                <SelectItem value="FORMULA">Formula</SelectItem>
                                                                <SelectItem value="HEADER">Header</SelectItem>
                                                                <SelectItem value="TOTAL">Total</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-2">
                                                        {row.rowType === "ACCOUNT" && (
                                                            <Input
                                                                placeholder="e.g., 1000..1999"
                                                                value={row.accountRange || ""}
                                                                onChange={(e) =>
                                                                    updateRow(row.id, { accountRange: e.target.value })
                                                                }
                                                                className="h-8"
                                                            />
                                                        )}
                                                        {row.rowType === "FORMULA" && (
                                                            <Input
                                                                placeholder="e.g., R1 + R2 - R3"
                                                                value={row.formula || ""}
                                                                onChange={(e) =>
                                                                    updateRow(row.id, { formula: e.target.value })
                                                                }
                                                                className="h-8"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setEditingRow(row)}
                                                            >
                                                                <Settings className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => deleteRow(row.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Columns Tab */}
                            <TabsContent value="columns" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Column Definitions</h3>
                                    <Button onClick={addColumn} size="sm">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Column
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {columns.map((col) => (
                                        <Card key={col.id}>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <Label>Name</Label>
                                                        <Input
                                                            value={col.name}
                                                            onChange={(e) =>
                                                                updateColumn(col.id, { name: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Type</Label>
                                                        <Select
                                                            value={col.type}
                                                            onValueChange={(value: any) =>
                                                                updateColumn(col.id, { type: value })
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PERIOD">Period</SelectItem>
                                                                <SelectItem value="YTD">YTD</SelectItem>
                                                                <SelectItem value="BUDGET">Budget</SelectItem>
                                                                <SelectItem value="VARIANCE">Variance</SelectItem>
                                                                <SelectItem value="FORMULA">Formula</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Format</Label>
                                                        <Input
                                                            value={col.format || ""}
                                                            onChange={(e) =>
                                                                updateColumn(col.id, { format: e.target.value })
                                                            }
                                                            placeholder="e.g., #,##0.00"
                                                        />
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                checked={col.drillDown}
                                                                onCheckedChange={(checked) =>
                                                                    updateColumn(col.id, { drillDown: checked })
                                                                }
                                                            />
                                                            <Label>Drill-Down</Label>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteColumn(col.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {col.type === "FORMULA" && (
                                                    <div className="mt-4">
                                                        <Label>Formula</Label>
                                                        <Input
                                                            value={col.formula || ""}
                                                            onChange={(e) =>
                                                                updateColumn(col.id, { formula: e.target.value })
                                                            }
                                                            placeholder="e.g., C1 - C2"
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Preview Tab */}
                            <TabsContent value="preview">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Report Preview</h3>
                                        <Button size="sm" variant="outline">
                                            <Download className="h-4 w-4 mr-1" />
                                            Export to Excel
                                        </Button>
                                    </div>
                                    <div className="border rounded-lg overflow-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-2 border-r">Account</th>
                                                    {columns.map((col) => (
                                                        <th key={col.id} className="text-right p-2 border-r">
                                                            {col.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className={`border-t ${row.rowType === "HEADER" ? "font-semibold bg-muted/50" : ""
                                                            } ${row.rowType === "TOTAL" ? "font-bold border-t-2" : ""}`}
                                                    >
                                                        <td
                                                            className="p-2 border-r"
                                                            style={{ paddingLeft: `${(row.indent || 0) * 20 + 8}px` }}
                                                        >
                                                            {row.label}
                                                        </td>
                                                        {columns.map((col) => (
                                                            <td key={col.id} className="text-right p-2 border-r">
                                                                {row.rowType === "FORMULA" ? (
                                                                    <span className="text-muted-foreground italic">
                                                                        {row.formula}
                                                                    </span>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Row Editor Dialog */}
            {editingRow && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>Row Properties: {editingRow.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Indent Level</Label>
                                    <Input
                                        type="number"
                                        value={editingRow.indent || 0}
                                        onChange={(e) =>
                                            setEditingRow({
                                                ...editingRow,
                                                indent: parseInt(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={editingRow.isBold}
                                            onCheckedChange={(checked) =>
                                                setEditingRow({ ...editingRow, isBold: checked })
                                            }
                                        />
                                        <Label>Bold</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={editingRow.isUnderline}
                                            onCheckedChange={(checked) =>
                                                setEditingRow({ ...editingRow, isUnderline: checked })
                                            }
                                        />
                                        <Label>Underline</Label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Conditional Formatting</Label>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <Select
                                        value={editingRow.conditionalFormat?.condition}
                                        onValueChange={(value: any) =>
                                            setEditingRow({
                                                ...editingRow,
                                                conditionalFormat: {
                                                    ...editingRow.conditionalFormat,
                                                    condition: value,
                                                } as ConditionalFormat,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GT">Greater Than</SelectItem>
                                            <SelectItem value="LT">Less Than</SelectItem>
                                            <SelectItem value="EQ">Equal To</SelectItem>
                                            <SelectItem value="BETWEEN">Between</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        placeholder="Value"
                                        value={editingRow.conditionalFormat?.value1 || ""}
                                        onChange={(e) =>
                                            setEditingRow({
                                                ...editingRow,
                                                conditionalFormat: {
                                                    ...editingRow.conditionalFormat,
                                                    value1: parseFloat(e.target.value),
                                                } as ConditionalFormat,
                                            })
                                        }
                                    />
                                    <Input
                                        type="color"
                                        value={editingRow.conditionalFormat?.color || "#000000"}
                                        onChange={(e) =>
                                            setEditingRow({
                                                ...editingRow,
                                                conditionalFormat: {
                                                    ...editingRow.conditionalFormat,
                                                    color: e.target.value,
                                                } as ConditionalFormat,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingRow(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        updateRow(editingRow.id, editingRow);
                                        setEditingRow(null);
                                    }}
                                >
                                    Apply
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
