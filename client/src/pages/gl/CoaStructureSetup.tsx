
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers, Settings, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlCoaStructure, GlSegment, GlValueSet } from "@shared/schema";

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Chart of Accounts Structures</h1>
                    <p className="text-muted-foreground mt-2">
                        Define the multi-dimensional structure of your general ledger accounts.
                    </p>
                </div>
                <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <SheetTrigger asChild>
                        <Button className="bg-[#0f172a] hover:bg-[#1e293b]">
                            <Plus className="mr-2 h-4 w-4" /> Create Structure
                        </Button>
                    </SheetTrigger>
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div>Loading...</div>
                ) : structures.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-muted-foreground">
                        No structures defined. Create one to get started.
                    </div>
                ) : (
                    structures.map((struct) => (
                        <Card key={struct.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedStructure(struct)}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-semibold">{struct.name}</CardTitle>
                                <Layers className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{struct.description || "No description"}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <Badge variant="outline">Delimiter: "{struct.delimiter}"</Badge>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        Manage Segments <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Manage Segments Dialog */}
            <Dialog open={!!selectedStructure} onOpenChange={(open) => !open && setSelectedStructure(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Manage Structure: {selectedStructure?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedStructure && (
                        <SegmentManager structureId={selectedStructure.id} structureName={selectedStructure.name} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
