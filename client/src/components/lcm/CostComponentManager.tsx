
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function CostComponentManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '', description: '', componentType: 'FREIGHT', allocationBasis: 'VALUE'
    });

    const { data: components, isLoading } = useQuery({
        queryKey: ['lcmComponents'],
        queryFn: async () => {
            const res = await fetch('/api/lcm/components');
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/lcm/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lcmComponents'] });
            setIsOpen(false);
            setFormData({ name: '', description: '', componentType: 'FREIGHT', allocationBasis: 'VALUE' });
            toast({ title: "Cost Component Created" });
        }
    });

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-gray-600" />
                    <h2 className="text-xl font-bold">Landed Cost Components</h2>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Component</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Define Cost Component</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ocean Freight" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={formData.componentType} onValueChange={(v) => setFormData({ ...formData, componentType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FREIGHT">Freight</SelectItem>
                                        <SelectItem value="INSURANCE">Insurance</SelectItem>
                                        <SelectItem value="DUTY">Duty</SelectItem>
                                        <SelectItem value="OTHERS">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Allocation Basis</label>
                                <Select value={formData.allocationBasis} onValueChange={(v) => setFormData({ ...formData, allocationBasis: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VALUE">Value (Cost)</SelectItem>
                                        <SelectItem value="QUANTITY">Quantity</SelectItem>
                                        <SelectItem value="WEIGHT">Weight</SelectItem>
                                        <SelectItem value="VOLUME">Volume</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Save</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Default Allocation</TableHead>
                            <TableHead className="w-[100px]">Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow> :
                            components?.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.componentType}</TableCell>
                                    <TableCell>{c.allocationBasis}</TableCell>
                                    <TableCell>{c.isActive ? "Yes" : "No"}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
