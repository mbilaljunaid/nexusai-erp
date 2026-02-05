import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function MappingSetList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        code: "",
        name: "",
        inputType: "Literal", // Segment, Literal, Lookup
        outputType: "Segment" // Segment, Account
    });

    const { data: mappings = [], isLoading } = useQuery({
        queryKey: ["sla-mappings"],
        queryFn: async () => {
            const res = await fetch("/api/sla/mapping-sets");
            if (!res.ok) throw new Error("Failed to fetch mappings");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/sla/mapping-sets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create mapping set");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-mappings"] });
            setIsCreateOpen(false);
            toast({ title: "Mapping Set Created" });
        }
    });

    const handleCreate = () => {
        createMutation.mutate(newItem);
    };

    if (isLoading) return <div>Loading Mappings...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Create Mapping Set</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Mapping Set</DialogTitle>
                            <DialogDescription>Define translation logic (Input -{">"} Output).</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right">Code</Label>
                                <Input id="code" value={newItem.code} onChange={e => setNewItem({ ...newItem, code: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="in" className="text-right">Input Type</Label>
                                <Select value={newItem.inputType} onValueChange={v => setNewItem({ ...newItem, inputType: v })}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Literal">Literal String</SelectItem>
                                        <SelectItem value="Segment">Segment Value</SelectItem>
                                        <SelectItem value="Lookup">Lookup Code</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="out" className="text-right">Output Type</Label>
                                <Select value={newItem.outputType} onValueChange={v => setNewItem({ ...newItem, outputType: v })}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Segment">Segment Value</SelectItem>
                                        <SelectItem value="Account">Account Combination</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleCreate}>Save Mapping Set</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mappings.map((m: any) => (
                        <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.code}</TableCell>
                            <TableCell>{m.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{m.inputType}</Badge>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <Badge variant="secondary">{m.outputType}</Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Values</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
