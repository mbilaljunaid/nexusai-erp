import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlCoaStructure, GlSegment, GlValueSet } from "@/types/erp-types";

// --- Sub-Component: Segment Manager ---
function SegmentManager({ structureId, structureName }: { structureId: string, structureName: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Segments
    const { data: segments = [], isLoading } = useQuery<GlSegment[]>({
        queryKey: ["/api/finance/gl/segments", structureId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/finance/gl/segments?coaStructureId=${structureId}`);
            return res.json();
        }
    });

    // Fetch Value Sets for Dropdown
    const { data: valueSets = [] } = useQuery<GlValueSet[]>({
        queryKey: ["/api/finance/gl/value-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/value-sets");
            return res.json();
        }
    });

    const createSegmentMutation = useMutation({
        mutationFn: async (rows: any[]) => {
            // Simulate bulk insert/update
            const promises = rows.map(data => {
                const payload = { ...data, coaStructureId: structureId, segmentNumber: parseInt(data.segmentNumber) || 1, displayWidth: parseInt(data.displayWidth) || 20 };
                return apiRequest("POST", "/api/finance/gl/segments", payload);
            });
            await Promise.all(promises);
            return {};
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/segments", structureId] });
            toast({ title: "Segments Saved", description: "Segment definitions updated successfully." });
        }
    });

    const handleSaveSegments = (rows: any[]) => {
        const invalidRows = rows.filter(r => !r.segmentName || !r.valueSetId);
        if (invalidRows.length > 0) {
            toast({ title: "Validation Error", description: "Name and Value Set are required for all rows.", variant: "destructive" });
            return;
        }
        createSegmentMutation.mutate(rows);
    };

    const handleAddRow = () => {
        const newRow = { id: `temp-${Date.now()}`, segmentNumber: segments.length + 1, segmentName: "", columnName: `segment${segments.length + 1}`, valueSetId: "", prompt: "", displayWidth: 20 };
        queryClient.setQueryData(["/api/finance/gl/segments", structureId], [...segments, newRow]);
    };

    const columns = [
        {
            id: "segmentNumber",
            header: "Segment #",
            width: "100px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="number" className="h-9 w-full bg-transparent border-0" value={row.segmentNumber} onChange={e => updateRow("segmentNumber", e.target.value)} />
            )
        },
        {
            id: "segmentName",
            header: "Segment Name *",
            width: "200px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.segmentName} onChange={e => updateRow("segmentName", e.target.value)} placeholder="e.g. Cost Center" />
            )
        },
        {
            id: "columnName",
            header: "DB Column",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.columnName} onChange={e => updateRow("columnName", e.target.value)} disabled />
            )
        },
        {
            id: "valueSetId",
            header: "Value Set *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.valueSetId} onValueChange={(val) => updateRow("valueSetId", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {valueSets.map(vs => <SelectItem key={vs.id} value={vs.id}>{vs.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "prompt",
            header: "Prompt Label",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.prompt} onChange={e => updateRow("prompt", e.target.value)} />
            )
        },
        {
            id: "displayWidth",
            header: "Display Width",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="number" className="h-9 w-full bg-transparent border-0" value={row.displayWidth} onChange={e => updateRow("displayWidth", e.target.value)} />
            )
        }
    ];

    return (
        <div className="space-y-4 pt-4 h-[600px] flex flex-col">
            <div className="flex justify-between items-center bg-slate-500/10 dark:bg-slate-900 border px-4 py-2 rounded-t-md">
                <Button variant="outline" size="sm" onClick={handleAddRow}>
                    <Plus className="w-4 h-4 mr-2" /> Add Segment
                </Button>
                <Button size="sm" onClick={() => handleSaveSegments(segments)} disabled={createSegmentMutation.isPending}>
                    Save Segments
                </Button>
            </div>
            <div className="flex-1 border rounded-b-md overflow-hidden bg-white">
                <InteractiveSpreadsheet
                    data={segments}
                    columns={columns}
                    onChange={(newData) => queryClient.setQueryData(["/api/finance/gl/segments", structureId], newData as any)}
                    virtualized={true}
                    containerHeight="500px"
                />
            </div>
        </div>
    );
}

// --- Main Component: CoA Structure Setup ---
export default function CoaStructureSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedStructure, setSelectedStructure] = useState<GlCoaStructure | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        delimiter: "-"
    });

    const { data: structures = [], isLoading } = useQuery<GlCoaStructure[]>({
        queryKey: ["/api/finance/gl/coa-structures"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/coa-structures");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/finance/gl/coa-structures", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/coa-structures"] });
            setIsAddOpen(false);
            setFormData({ name: "", description: "", delimiter: "-" });
            toast({ title: "Structure Created", description: "CoA Structure created successfully." });
        }
    });

    const handleCreate = () => {
        if (!formData.name) return;
        createMutation.mutate(formData);
    };

    const columns: SpreadsheetColumn<GlCoaStructure>[] = [
        { header: "Structure Name", id: "name", width: "150px", className: "font-medium" },
        { header: "Description", id: "description", width: "150px" },
        { header: "Delimiter", id: "delimiter", width: "150px", cell: (item) => <Badge variant="outline">{item.delimiter}</Badge> },
        {
            header: "Actions",
            id: "actions",
            cell: (item) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedStructure(item)}>
                    Segments <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Chart of Accounts Structures"
            description="Define the multi-dimensional structure of your general ledger accounts."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "CoA Structures" }]}
            actions={
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Structure
                </Button>
            }
        >
            <InteractiveSpreadsheet
                data={structures}
                columns={columns}
                isLoading={isLoading}
                onChange={() => { }} containerHeight="600px" />

            {/* Create Sheet */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Create CoA Structure</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 py-6">
                        <div className="space-y-2">
                            <Label>Structure Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Corporate_Flexfield"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Delimiter</Label>
                            <Select
                                value={formData.delimiter}
                                onValueChange={(val) => setFormData({ ...formData, delimiter: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-">- (Dash)</SelectItem>
                                    <SelectItem value=".">. (Dot)</SelectItem>
                                    <SelectItem value="|">| (Pipe)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            Create Structure
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Manage Segments Dialog */}
            <Dialog open={!!selectedStructure} onOpenChange={(open) => !open && setSelectedStructure(null)}>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Manage CoA Structure: {selectedStructure?.name}</DialogTitle>
                        <p className="text-sm text-muted-foreground">Define chart of account dimensions and map to value sets inline.</p>
                    </DialogHeader>
                    {selectedStructure && (
                        <div className="flex-1 overflow-auto min-h-[500px]">
                            <SegmentManager structureId={selectedStructure.id} structureName={selectedStructure.name} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
