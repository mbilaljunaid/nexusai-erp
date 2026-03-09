import { useState } from "react";
import { Link } from "wouter";
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
import { Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

export function AccountRuleList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        code: "",
        name: "",
        ruleType: "Segment",
        sourceType: "Constant",
        constantValue: ""
    });

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["sla-rules"],
        queryFn: async () => {
            const res = await fetch("/api/sla/rules");
            if (!res.ok) throw new Error("Failed to fetch rules");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/sla/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
            setIsCreateOpen(false);
            toast({ title: "Rule Created", description: "Account Derivation Rule created successfully." });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/sla/rules/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
            toast({ title: "Rule Deleted" });
        }
    });

    const handleCreate = () => {
        createMutation.mutate(newItem);
    };

    if (isLoading) return <div>Loading Rules...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Create Rule</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Account Rule</DialogTitle>
                            <DialogDescription>Define logic to derive an account segment.</DialogDescription>
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
                                <Label htmlFor="type" className="text-right">Rule Type</Label>
                                <Select value={newItem.ruleType} onValueChange={v => setNewItem({ ...newItem, ruleType: v })}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Segment">Segment</SelectItem>
                                        <SelectItem value="Account">Full Account</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="source" className="text-right">Source</Label>
                                <Select value={newItem.sourceType} onValueChange={v => setNewItem({ ...newItem, sourceType: v })}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Constant">Constant</SelectItem>
                                        <SelectItem value="MappingSet">Mapping Set</SelectItem>
                                        <SelectItem value="Source">Source Attribute</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newItem.sourceType === 'Constant' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="const" className="text-right">Value</Label>
                                    <Input id="const" value={newItem.constantValue} onChange={e => setNewItem({ ...newItem, constantValue: e.target.value })} className="col-span-3" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleCreate}>Save Rule</Button>
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
                        <TableHead>Source</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rules.map((rule: any) => (
                        <TableRow key={rule.id}>
                            <TableCell className="font-medium">{rule.code}</TableCell>
                            <TableCell>{rule.name}</TableCell>
                            <TableCell>{rule.ruleType} {rule.segmentName ? `(${rule.segmentName})` : ''}</TableCell>
                            <TableCell>{rule.sourceType}</TableCell>
                            <TableCell>
                                {rule.sourceType === 'Constant' ? rule.constantValue :
                                    rule.sourceType === 'MappingSet' ? `Mapping: ${rule.mappingSetId}` :
                                        `Attr: ${rule.sourceAttribute}`}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                    <Link href="/finance/gl/config/sla/adr">
                                        <Button variant="ghost" size="icon" title="Edit in Builder" aria-label="Edit">
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rule.id)} aria-label="Delete">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
