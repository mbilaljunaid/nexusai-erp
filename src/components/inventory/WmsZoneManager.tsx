
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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function WmsZoneManager() {
    const [isOpen, setIsOpen] = useState(false);
    // Temporary context - ideally from global UserContext
    const warehouseId = "550e8400-e29b-41d4-a716-446655440000";
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        zoneCode: '',
        zoneName: '',
        zoneType: 'STORAGE',
        priority: 0,
        warehouseId: warehouseId
    });

    // Fetch Zones
    const { data: zones, isLoading } = useQuery({
        queryKey: ['wms-zones', warehouseId],
        queryFn: async () => {
            const res = await fetch(`/api/wms/zones?warehouseId=${warehouseId}`);
            if (!res.ok) throw new Error("Failed to fetch zones");
            return res.json();
        }
    });

    // Create Zone Mutation
    const createMutation = useMutation({
        mutationFn: async (newZone: any) => {
            const res = await fetch('/api/wms/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newZone)
            });
            if (!res.ok) throw new Error("Failed to create zone");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wms-zones'] });
            setIsOpen(false);
            setFormData({ ...formData, zoneCode: '', zoneName: '' });
            toast({ title: "Zone Created", description: "Successfully added new zone." });
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/wms/zones/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete zone");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wms-zones'] });
            toast({ title: "Zone Deleted" });
        }
    });

    const handleSubmit = () => {
        createMutation.mutate(formData);
    };

    if (isLoading) return <div>Loading Zones...</div>;

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Warehouse Zones</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Zone</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zone Code</label>
                                <Input
                                    placeholder="e.g. Z1-STORAGE"
                                    value={formData.zoneCode}
                                    onChange={(e) => setFormData({ ...formData, zoneCode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zone Name</label>
                                <Input
                                    placeholder="e.g. Main Storage Area"
                                    value={formData.zoneName}
                                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select
                                        value={formData.zoneType}
                                        onValueChange={(val) => setFormData({ ...formData, zoneType: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STORAGE">Storage</SelectItem>
                                            <SelectItem value="PICKING">Picking</SelectItem>
                                            <SelectItem value="RECEIVING">Receiving</SelectItem>
                                            <SelectItem value="STAGING">Staging</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority (1=High)</label>
                                    <Input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Creating..." : "Create Zone"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zones?.map((zone: any) => (
                            <TableRow key={zone.id}>
                                <TableCell className="font-medium">{zone.zoneCode}</TableCell>
                                <TableCell>{zone.zoneName}</TableCell>
                                <TableCell>{zone.zoneType}</TableCell>
                                <TableCell>{zone.priority}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(zone.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
