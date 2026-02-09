import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
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

    // Form State for new Segment
    const [newSegment, setNewSegment] = useState({
        segmentName: "",
        segmentNumber: 1,
        columnName: "segment1",
        valueSetId: "",
        prompt: "",
        displayWidth: 20
    });

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
        mutationFn: async (data: any) => {
            const payload = { ...data, coaStructureId: structureId, segmentNumber: parseInt(data.segmentNumber), displayWidth: parseInt(data.displayWidth) };
            return apiRequest("POST", "/api/finance/gl/segments", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/segments", structureId] });
            setNewSegment({ segmentName: "", segmentNumber: segments.length + 2, columnName: `segment${segments.length + 2}`, valueSetId: "", prompt: "", displayWidth: 20 });
            toast({ title: "Segment Added", description: "Segment definition created." });
        }
    });

    const handleAddSegment = () => {
        if (!newSegment.segmentName || !newSegment.valueSetId) {
            toast({ title: "Validation Error", description: "Name and Value Set are required.", variant: "destructive" });
            return;
        }
        createSegmentMutation.mutate(newSegment);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add New Segment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        placeholder="Segment Name (e.g. Company)"
                        value={newSegment.segmentName}
                        onChange={(e) => setNewSegment({ ...newSegment, segmentName: e.target.value })}
                    />
                    <Input
                        placeholder="Prompt (Label)"
                        value={newSegment.prompt}
                        onChange={(e) => setNewSegment({ ...newSegment, prompt: e.target.value })}
                    />
                    <Input
                        type="number"
                        placeholder="Segment #"
                        value={newSegment.segmentNumber}
                        onChange={(e) => setNewSegment({ ...newSegment, segmentNumber: parseInt(e.target.value) })}
                    />
                    <Select
                        value={newSegment.valueSetId}
                        onValueChange={(val) => setNewSegment({ ...newSegment, valueSetId: val })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Value Set" />
                        </SelectTrigger>
                        <SelectContent>
                            {valueSets.map(vs => (
                                <SelectItem key={vs.id} value={vs.id}>{vs.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddSegment} disabled={createSegmentMutation.isPending} className="w-full">
                    Add Segment
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Column</TableHead>
                        <TableHead>Value Set</TableHead>
                        <TableHead>Prompt</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5}>Loading segments...</TableCell></TableRow>
                    ) : segments.length === 0 ? (
                        <TableRow><TableCell colSpan={5}>No segments defined.</TableCell></TableRow>
                    ) : (
                        segments.sort((a, b) => a.segmentNumber - b.segmentNumber).map((seg) => {
                            const vsName = valueSets.find(v => v.id === seg.valueSetId)?.name || seg.valueSetId;
                            return (
                                <TableRow key={seg.id}>
                                    <TableCell>{seg.segmentNumber}</TableCell>
                                    <TableCell className="font-medium">{seg.segmentName}</TableCell>
                                    <TableCell>{seg.columnName}</TableCell>
                                    <TableCell><Badge variant="secondary">{vsName}</Badge></TableCell>
                                    <TableCell>{seg.prompt}</TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
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

    const columns: Column<GlCoaStructure>[] = [
        { header: "Structure Name", accessorKey: "name", className: "font-medium" },
        { header: "Description", accessorKey: "description" },
        { header: "Delimiter", accessorKey: "delimiter", cell: (item) => <Badge variant="outline">{item.delimiter}</Badge> },
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
            <StandardTable
                data={structures}
                columns={columns}
                isLoading={isLoading}
                filterColumn="name"
            />

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
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Structure: {selectedStructure?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedStructure && (
                        <SegmentManager structureId={selectedStructure.id} structureName={selectedStructure.name} />
                    )}
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
