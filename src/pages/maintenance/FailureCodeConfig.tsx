
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Plus, FolderTree, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FailureCodeConfig() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Filters
    const [selectedType, setSelectedType] = useState<string>("PROBLEM");
    const [selectedParent, setSelectedParent] = useState<string | null>(null);

    // Form
    const [newItem, setNewItem] = useState({ code: "", name: "", description: "", type: "PROBLEM", parentId: "" });

    // 1. Fetch Tree
    const { data: tree } = useQuery({
        queryKey: ["/api/maintenance/failure-codes/tree"],
        queryFn: () => fetch("/api/maintenance/failure-codes/tree").then(r => r.json())
    });

    // 2. Fetch Flat List (for table)
    const { data: list } = useQuery({
        queryKey: ["/api/maintenance/failure-codes", selectedType, selectedParent],
        queryFn: () => fetch(`/api/maintenance/failure-codes?type=${selectedType}${selectedParent ? `&parentId=${selectedParent}` : ''}`).then(r => r.json())
    });

    // 3. Create Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/maintenance/failure-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/failure-codes"] });
            setIsAddOpen(false);
            toast({ title: "Created", description: "Failure code added." });
            setNewItem({ code: "", name: "", description: "", type: selectedType, parentId: selectedParent || "" });
        }
    });

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Failure Analysis Codes</h1>
                    <p className="text-muted-foreground">Standardize reliability reporting: Problem &gt; Cause &gt; Remedy.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Add Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add {selectedType}</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Code (Unique)</Label>
                                <Input
                                    placeholder="e.g. OVERHEAT"
                                    value={newItem.code}
                                    onChange={e => setNewItem({ ...newItem, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    placeholder="e.g. Engine Overheating"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={() => createMutation.mutate({ ...newItem, type: selectedType, parentId: selectedParent || null })}>
                                Save
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="col-span-1 border rounded-lg p-4 bg-muted/10 h-[600px] overflow-auto">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FolderTree className="h-4 w-4" /> Library Structure
                    </h3>
                    <div className="space-y-1">
                        <Button
                            variant={selectedType === 'PROBLEM' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => { setSelectedType("PROBLEM"); setSelectedParent(null); }}
                        >
                            Problems (Roots)
                        </Button>
                        {/* Mock Tree for Navigation - Real implementation would recursively render 'tree' data */}
                        {tree?.map((problem: any) => (
                            <div key={problem.id} className="ml-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs h-8 text-muted-foreground"
                                    onClick={() => { setSelectedType("CAUSE"); setSelectedParent(problem.id); }}
                                >
                                    <AlertTriangle className="h-3 w-3 mr-2" /> {problem.name}
                                </Button>
                                {problem.children?.map((cause: any) => (
                                    <Button
                                        key={cause.id}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-xs h-8 ml-4 text-muted-foreground/80"
                                        onClick={() => { setSelectedType("REMEDY"); setSelectedParent(cause.id); }}
                                    >
                                        ↳ {cause.name}
                                    </Button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>
                            {selectedType} Codes
                            {selectedParent && <span className="text-muted-foreground font-normal ml-2">(Filtered)</span>}
                        </CardTitle>
                        <CardDescription>Manage standardized codes for reliability reporting.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[100px]">Active</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list?.length > 0 ? list.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono font-medium">{item.code}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{item.description}</TableCell>
                                        <TableCell>{item.active === 'Y' ? "Yes" : "No"}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No codes defined.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
