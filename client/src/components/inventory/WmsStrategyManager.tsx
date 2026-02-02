
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function WmsStrategyManager() {
    const [isOpen, setIsOpen] = useState(false);
    const warehouseId = "STRATEGY-TEST-ORG"; // User Context
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form
    const [formData, setFormData] = useState({
        name: '',
        type: 'PICKING',
        algorithm: 'FIFO',
        description: ''
    });

    const { data: strategies, isLoading } = useQuery({
        queryKey: ['wmsStrategies'],
        queryFn: async () => {
            const res = await fetch(`/api/wms/strategies?warehouseId=${warehouseId}`);
            if (!res.ok) throw new Error("Failed to fetch strategies");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = { ...data, warehouseId, isActive: true };
            const res = await fetch('/api/wms/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to create strategy");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wmsStrategies'] });
            setIsOpen(false);
            setFormData({ name: '', type: 'PICKING', algorithm: 'FIFO', description: '' });
            toast({ title: "Strategy Created" });
        }
    });

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">WMS Rules & Strategies</h2>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Strategy
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Configure Strategy</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Strategy Name</label>
                                <Input placeholder="e.g. Standard FIFO" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PICKING">Picking Logic</SelectItem>
                                        <SelectItem value="PUTAWAY">Putaway Logic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Algorithm</label>
                                <Select value={formData.algorithm} onValueChange={(val) => setFormData({ ...formData, algorithm: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                                        <SelectItem value="LIFO">LIFO (Last In First Out)</SelectItem>
                                        <SelectItem value="FEFO">FEFO (First Expired First Out)</SelectItem>
                                        <SelectItem value="ZONE_BASED">Zone Priority (Gold-&gt;Silver-&gt;Bronze)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <Button className="w-full" onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Saving..." : "Save Rule"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Active</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Algorithm</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                            strategies?.length === 0 ? <TableRow><TableCell colSpan={5}>No strategies configured.</TableCell></TableRow> :
                                strategies?.map((s: any) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <Switch checked={s.isActive} />
                                        </TableCell>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.type}</TableCell>
                                        <TableCell>{s.algorithm}</TableCell>
                                        <TableCell>{s.description}</TableCell>
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
