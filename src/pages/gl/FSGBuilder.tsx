
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLedger } from "@/context/LedgerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, FileText, TableProperties, Columns, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FSGBuilder() {
    const { toast } = useToast();
    const { currentLedgerId } = useLedger();
    const [activeTab, setActiveTab] = useState("definitions");

    // --- State ---
    const [selectedRowSet, setSelectedRowSet] = useState<any>(null);
    const [selectedColSet, setSelectedColSet] = useState<any>(null);

    // Create Forms
    const [newRowSet, setNewRowSet] = useState({ name: "", description: "" });
    const [newColSet, setNewColSet] = useState({ name: "", description: "" });
    const [newReport, setNewReport] = useState({ name: "", description: "", rowSetId: "", columnSetId: "" });

    // Child Item Forms
    const [newRow, setNewRow] = useState({ rowNumber: 10, description: "", rowType: "DETAIL" });
    const [newCol, setNewCol] = useState({ columnNumber: 10, header: "", type: "AMOUNT", amountType: "PTD" });

    // --- Queries ---
    const { data: rowSets } = useQuery<any[]>({
        queryKey: ["/api/gl/fsg/row-sets", currentLedgerId],
        queryFn: async () => {
            const res = await fetch(`/api/gl/fsg/row-sets?ledgerId=${currentLedgerId}`);
            return res.json();
        },
        enabled: !!currentLedgerId
    });

    const { data: colSets } = useQuery<any[]>({
        queryKey: ["/api/gl/fsg/column-sets", currentLedgerId],
        queryFn: async () => {
            const res = await fetch(`/api/gl/fsg/column-sets?ledgerId=${currentLedgerId}`);
            return res.json();
        },
        enabled: !!currentLedgerId
    });

    const { data: reports } = useQuery<any[]>({
        queryKey: ["/api/gl/fsg/reports", currentLedgerId],
        queryFn: async () => {
            const res = await fetch(`/api/gl/fsg/reports?ledgerId=${currentLedgerId}`);
            return res.json();
        },
        enabled: !!currentLedgerId
    });

    const { data: activeRows, refetch: refetchRows } = useQuery<any[]>({
        queryKey: ["/api/gl/fsg/rows", selectedRowSet?.id],
        queryFn: async () => {
            const res = await fetch(`/api/gl/fsg/row-sets/${selectedRowSet.id}/rows`);
            return res.json();
        },
        enabled: !!selectedRowSet?.id
    });

    const { data: activeCols, refetch: refetchCols } = useQuery<any[]>({
        queryKey: ["/api/gl/fsg/columns", selectedColSet?.id],
        queryFn: async () => {
            const res = await fetch(`/api/gl/fsg/column-sets/${selectedColSet.id}/columns`);
            return res.json();
        },
        enabled: !!selectedColSet?.id
    });

    // --- Mutations ---
    const createRowSetFn = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/fsg/row-sets", { ...data, ledgerId: currentLedgerId });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/fsg/row-sets"] });
            toast({ title: "Row Set Created" });
            setNewRowSet({ name: "", description: "" });
        }
    });

    const createColSetFn = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/fsg/column-sets", { ...data, ledgerId: currentLedgerId });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/fsg/column-sets"] });
            toast({ title: "Column Set Created" });
            setNewColSet({ name: "", description: "" });
        }
    });

    const createReportFn = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/fsg/reports", { ...data, ledgerId: currentLedgerId });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/fsg/reports"] });
            toast({ title: "Report Definition Created" });
            setNewReport({ name: "", description: "", rowSetId: "", columnSetId: "" });
        }
    });

    const createRowFn = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/fsg/rows", { ...data, rowSetId: selectedRowSet.id });
            return res.json();
        },
        onSuccess: () => {
            refetchRows();
            toast({ title: "Row Added" });
            setNewRow({ rowNumber: newRow.rowNumber + 10, description: "", rowType: "DETAIL" });
        }
    });

    const createColFn = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/fsg/columns", { ...data, columnSetId: selectedColSet.id });
            return res.json();
        },
        onSuccess: () => {
            refetchCols();
            toast({ title: "Column Added" });
            setNewCol({ columnNumber: newCol.columnNumber + 10, header: "", type: "AMOUNT", amountType: "PTD" });
        }
    });

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Report Builder</h1>
                    <p className="text-muted-foreground mt-1">Configure FSG Row Sets, Column Sets, and Report Definitions.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="definitions" className="flex gap-2"><FileText className="w-4 h-4" /> Report Definitions</TabsTrigger>
                    <TabsTrigger value="rowsets" className="flex gap-2"><TableProperties className="w-4 h-4" /> Row Sets</TabsTrigger>
                    <TabsTrigger value="colsets" className="flex gap-2"><Columns className="w-4 h-4" /> Column Sets</TabsTrigger>
                </TabsList>

                {/* Report Definitions */}
                <TabsContent value="definitions" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Create New Report</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Report Name</Label>
                                    <Input value={newReport.name} onChange={e => setNewReport({ ...newReport, name: e.target.value })} placeholder="e.g. Balance Sheet 2026" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={newReport.description} onChange={e => setNewReport({ ...newReport, description: e.target.value })} placeholder="Description" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Row Set</Label>
                                    <Select
                                        value={newReport.rowSetId}
                                        onValueChange={(val) => setNewReport({ ...newReport, rowSetId: val })}
                                    >
                                        <SelectTrigger title="Select Row Set">
                                            <SelectValue placeholder="Select Row Set..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rowSets?.map(rs => <SelectItem key={rs.id} value={rs.id}>{rs.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Column Set</Label>
                                    <Select
                                        value={newReport.columnSetId}
                                        onValueChange={(val) => setNewReport({ ...newReport, columnSetId: val })}
                                    >
                                        <SelectTrigger title="Select Column Set">
                                            <SelectValue placeholder="Select Column Set..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colSets?.map(cs => <SelectItem key={cs.id} value={cs.id}>{cs.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={() => createReportFn.mutate(newReport)} disabled={createReportFn.isPending}>
                                <Plus className="mr-2 h-4 w-4" /> Create Definition
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports?.map(r => (
                            <Card key={r.id} className="bg-muted/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{r.name}</CardTitle>
                                    <CardDescription>{r.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between"><span>Row Set:</span> <span className="font-mono">{rowSets?.find(rs => rs.id === r.rowSetId)?.name || r.rowSetId}</span></div>
                                        <div className="flex justify-between"><span>Col Set:</span> <span className="font-mono">{colSets?.find(cs => cs.id === r.columnSetId)?.name || r.columnSetId}</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Row Sets */}
                <TabsContent value="rowsets" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* List (Left) */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Create Row Set</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={newRowSet.name} onChange={e => setNewRowSet({ ...newRowSet, name: e.target.value })} />
                                    </div>
                                    <Button onClick={() => createRowSetFn.mutate(newRowSet)} disabled={createRowSetFn.isPending}>Save Row Set</Button>
                                </CardContent>
                            </Card>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {rowSets?.map(rs => (
                                    <div
                                        key={rs.id}
                                        className={`p-4 border rounded-md flex justify-between items-center cursor-pointer transition-colors ${selectedRowSet?.id === rs.id ? 'bg-blue-50 border-blue-200' : 'bg-card hover:bg-muted'}`}
                                        onClick={() => setSelectedRowSet(rs)}
                                    >
                                        <div>
                                            <div className="font-bold">{rs.name}</div>
                                            <div className="text-xs text-muted-foreground">{rs.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editor (Right) */}
                        <div className="md:col-span-2">
                            {selectedRowSet ? (
                                <Card className="h-full">
                                    <CardHeader className="border-b bg-muted/5">
                                        <CardTitle className="flex justify-between items-center">
                                            <span>Editing: {selectedRowSet.name}</span>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedRowSet(null)}>Close</Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {/* Add Row Form */}
                                        <div className="p-4 bg-muted/10 border-b flex gap-2 items-end">
                                            <div className="w-20">
                                                <Label className="text-xs">Seq</Label>
                                                <Input type="number" value={newRow.rowNumber} onChange={e => setNewRow({ ...newRow, rowNumber: parseInt(e.target.value) })} className="h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-xs">Description</Label>
                                                <Input value={newRow.description} onChange={e => setNewRow({ ...newRow, description: e.target.value })} className="h-8" />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs">Type</Label>
                                                <Select
                                                    value={newRow.rowType}
                                                    onValueChange={(val) => setNewRow({ ...newRow, rowType: val })}
                                                >
                                                    <SelectTrigger title="Select Row Type" className="h-8">
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DETAIL">Line Item</SelectItem>
                                                        <SelectItem value="CALCULATION">Total/Calc</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button size="sm" onClick={() => createRowFn.mutate(newRow)} disabled={createRowFn.isPending}>Add</Button>
                                        </div>

                                        {/* Rows Table */}
                                        <div className="overflow-auto max-h-[500px]">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted text-muted-foreground">
                                                    <tr>
                                                        <th className="p-2 text-left w-16">Seq</th>
                                                        <th className="p-2 text-left">Description</th>
                                                        <th className="p-2 text-left w-24">Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeRows?.map(row => (
                                                        <tr key={row.id} className="border-b hover:bg-muted/5">
                                                            <td className="p-2 font-mono text-xs">{row.rowNumber}</td>
                                                            <td className="p-2 font-medium">{row.description}</td>
                                                            <td className="p-2 text-xs">{row.rowType}</td>
                                                        </tr>
                                                    ))}
                                                    {!activeRows?.length && (
                                                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No rows defined in this set.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/5 text-muted-foreground">
                                    Select a Row Set to edit details
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Column Sets */}
                <TabsContent value="colsets" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* List (Left) */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Create Column Set</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={newColSet.name} onChange={e => setNewColSet({ ...newColSet, name: e.target.value })} />
                                    </div>
                                    <Button onClick={() => createColSetFn.mutate(newColSet)} disabled={createColSetFn.isPending}>Save Column Set</Button>
                                </CardContent>
                            </Card>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {colSets?.map(cs => (
                                    <div
                                        key={cs.id}
                                        className={`p-4 border rounded-md flex justify-between items-center cursor-pointer transition-colors ${selectedColSet?.id === cs.id ? 'bg-blue-50 border-blue-200' : 'bg-card hover:bg-muted'}`}
                                        onClick={() => setSelectedColSet(cs)}
                                    >
                                        <div>
                                            <div className="font-bold">{cs.name}</div>
                                            <div className="text-xs text-muted-foreground">{cs.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editor (Right) */}
                        <div className="md:col-span-2">
                            {selectedColSet ? (
                                <Card className="h-full">
                                    <CardHeader className="border-b bg-muted/5">
                                        <CardTitle className="flex justify-between items-center">
                                            <span>Editing: {selectedColSet.name}</span>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedColSet(null)}>Close</Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {/* Add Col Form */}
                                        <div className="p-4 bg-muted/10 border-b flex gap-2 items-end">
                                            <div className="w-20">
                                                <Label className="text-xs">Seq</Label>
                                                <Input type="number" value={newCol.columnNumber} onChange={e => setNewCol({ ...newCol, columnNumber: parseInt(e.target.value) })} className="h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-xs">Header</Label>
                                                <Input value={newCol.header} onChange={e => setNewCol({ ...newCol, header: e.target.value })} className="h-8" />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs">Type</Label>
                                                <Select
                                                    value={newCol.type}
                                                    onValueChange={(val) => setNewCol({ ...newCol, type: val })}
                                                >
                                                    <SelectTrigger title="Select Column Type" className="h-8">
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="AMOUNT">Period Amount</SelectItem>
                                                        <SelectItem value="CALCULATION">Calculation</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {newCol.type === 'AMOUNT' && (
                                                <div className="w-24">
                                                    <Label className="text-xs">Period</Label>
                                                    <Select
                                                        value={newCol.amountType}
                                                        onValueChange={(val) => setNewCol({ ...newCol, amountType: val })}
                                                    >
                                                        <SelectTrigger title="Select Amount Type" className="h-8">
                                                            <SelectValue placeholder="PTD" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PTD">PTD</SelectItem>
                                                            <SelectItem value="QTD">QTD</SelectItem>
                                                            <SelectItem value="YTD">YTD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <Button size="sm" onClick={() => createColFn.mutate(newCol)} disabled={createColFn.isPending}>Add</Button>
                                        </div>

                                        {/* Cols Table */}
                                        <div className="overflow-auto max-h-[500px]">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted text-muted-foreground">
                                                    <tr>
                                                        <th className="p-2 text-left w-16">Seq</th>
                                                        <th className="p-2 text-left">Header</th>
                                                        <th className="p-2 text-left w-24">Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeCols?.map(col => (
                                                        <tr key={col.id} className="border-b hover:bg-muted/5">
                                                            <td className="p-2 font-mono text-xs">{col.columnNumber}</td>
                                                            <td className="p-2 font-medium">{col.columnHeader || col.header}</td>
                                                            <td className="p-2 text-xs">{col.type === 'AMOUNT' ? col.amountType : col.type}</td>
                                                        </tr>
                                                    ))}
                                                    {!activeCols?.length && (
                                                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No columns defined in this set.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/5 text-muted-foreground">
                                    Select a Column Set to edit details
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
