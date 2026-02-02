
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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, List, Check, X, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlValueSet, GlSegmentValue } from "@shared/schema";

// --- Sub-Component: Value Manager (Manage Segment Values) ---
function ValueManager({ valueSetId, valueSetName }: { valueSetId: string, valueSetName: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newValue, setNewValue] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const { data: values = [], isLoading } = useQuery<GlSegmentValue[]>({
        queryKey: ["/api/finance/gl/segment-values", valueSetId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/finance/gl/segment-values?valueSetId=${valueSetId}`);
            return res.json();
        }
    });

    const createValueMutation = useMutation({
        mutationFn: async (data: { value: string, description: string, valueSetId: string }) => {
            return apiRequest("POST", "/api/finance/gl/segment-values", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/segment-values", valueSetId] });
            setNewValue("");
            setNewDesc("");
            toast({ title: "Value Added", description: "Segment value created successfully." });
        }
    });

    const handleAddValue = () => {
        if (!newValue) return;
        createValueMutation.mutate({
            value: newValue,
            description: newDesc,
            valueSetId
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Input
                    placeholder="Value (e.g. 100)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-1/3"
                />
                <Input
                    placeholder="Description (e.g. Assets)"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleAddValue} disabled={createValueMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
            </div>

            <div className="border rounded-md max-h-[400px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Value</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={3}>Loading values...</TableCell></TableRow>
                        ) : values.length === 0 ? (
                            <TableRow><TableCell colSpan={3}>No values defined yet.</TableCell></TableRow>
                        ) : (
                            values.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.value}</TableCell>
                                    <TableCell>{v.description}</TableCell>
                                    <TableCell>
                                        {v.enabledFlag ? (
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// --- Main Component: Value Set Manager ---
export default function ValueSetManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedValueSet, setSelectedValueSet] = useState<GlValueSet | null>(null); // For Managing Values

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        validationType: "Independent",
        formatType: "Char",
        maxLength: "20"
    });

    const { data: valueSets = [], isLoading } = useQuery<GlValueSet[]>({
        queryKey: ["/api/finance/gl/value-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/value-sets");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // Convert maxLength to number
            const payload = { ...data, maxLength: parseInt(data.maxLength) };
            return apiRequest("POST", "/api/finance/gl/value-sets", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/value-sets"] });
            setIsAddOpen(false);
            setFormData({ name: "", description: "", validationType: "Independent", formatType: "Char", maxLength: "20" });
            toast({ title: "Value Set Created", description: "The value set has been successfully created." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Value Sets</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage validation rules and value lists for Chart of Accounts segments.
                    </p>
                </div>
                <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <SheetTrigger asChild>
                        <Button className="bg-[#0f172a] hover:bg-[#1e293b]">
                            <Plus className="mr-2 h-4 w-4" /> Create Value Set
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[500px]">
                        <SheetHeader>
                            <SheetTitle>Create Value Set</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 py-6">
                            <div className="space-y-2">
                                <Label>Value Set Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Corporate_Department"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Validation for company departments"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Validation Type</Label>
                                    <Select
                                        value={formData.validationType}
                                        onValueChange={(val) => setFormData({ ...formData, validationType: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Independent">Independent</SelectItem>
                                            <SelectItem value="Dependent">Dependent</SelectItem>
                                            <SelectItem value="Table">Table</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Format Type</Label>
                                    <Select
                                        value={formData.formatType}
                                        onValueChange={(val) => setFormData({ ...formData, formatType: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Char">Char</SelectItem>
                                            <SelectItem value="Number">Number</SelectItem>
                                            <SelectItem value="Date">Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Length</Label>
                                <Input
                                    type="number"
                                    value={formData.maxLength}
                                    onChange={(e) => setFormData({ ...formData, maxLength: e.target.value })}
                                />
                            </div>
                        </div>
                        <SheetFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Creating..." : "Create Value Set"}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value Sets</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valueSets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Independent</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {valueSets.filter(v => v.validationType === "Independent").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle>Defined Value Sets</CardTitle>
                    <CardDescription>Manage your validation lists and segment values.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Max Length</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                                ) : valueSets.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">No value sets found.</TableCell></TableRow>
                                ) : (
                                    valueSets.map((vs) => (
                                        <TableRow key={vs.id}>
                                            <TableCell className="font-medium">{vs.name}</TableCell>
                                            <TableCell>{vs.description}</TableCell>
                                            <TableCell><Badge variant="outline">{vs.validationType}</Badge></TableCell>
                                            <TableCell>{vs.formatType}</TableCell>
                                            <TableCell>{vs.maxLength}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setSelectedValueSet(vs)}
                                                >
                                                    Manage Values
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Manage Values Dialog */}
            <Dialog open={!!selectedValueSet} onOpenChange={(open) => !open && setSelectedValueSet(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Values: {selectedValueSet?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedValueSet && (
                        <ValueManager valueSetId={selectedValueSet.id} valueSetName={selectedValueSet.name} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
