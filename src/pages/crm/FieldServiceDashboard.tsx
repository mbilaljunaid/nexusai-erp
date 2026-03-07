
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Map, Truck, User, Calendar, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";

export default function FieldServiceDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ subject: "", priority: "Medium", street: "", city: "" });

    // Queries
    const { data: queue } = useQuery<any>({ queryKey: ["/api/crm/field-service/queue"], queryFn: () => fetch("/api/crm/field-service/queue").then(r => r.json()) });
    const { data: allOrders } = useQuery<any>({ queryKey: ["/api/crm/field-service"], queryFn: () => fetch("/api/crm/field-service").then(r => r.json()) });
    const { data: technicians } = useQuery<any>({ queryKey: ["/api/crm/field-service/technicians/list"], queryFn: () => fetch("/api/crm/field-service/technicians/list").then(r => r.json()) });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/field-service", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/field-service"] });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/field-service/queue"] });
            setIsCreateOpen(false);
            setNewItem({ subject: "", priority: "Medium", street: "", city: "" });
            toast({ title: "Work Order Created" });
        }
    });

    return (
        <StandardPage
            title="Dispatcher Console"
            description="Manage field technicians and work orders."
            actions={
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Work Order
                </Button>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unassigned Orders</CardTitle>
                        <Wrench className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{queue?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
                        <Truck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{technicians?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Work Order List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>WO #</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allOrders?.map((wo: any) => (
                                    <TableRow key={wo.id}>
                                        <TableCell className="font-mono text-xs">{wo.workOrderNumber}</TableCell>
                                        <TableCell>{wo.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={wo.status === 'New' ? 'destructive' : 'default'}>{wo.status}</Badge>
                                        </TableCell>
                                        <TableCell>{wo.priority}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/crm/field-service/${wo.id}`}>
                                                <Button variant="ghost" size="sm">Manage</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Technicians Map Placehodler */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Map className="h-4 w-4" /> Technician Visualizer</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] bg-muted flex items-center justify-center rounded-md border text-muted-foreground">
                        Map View Placeholder
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Work Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input value={newItem.subject} onChange={e => setNewItem({ ...newItem, subject: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={newItem.priority} onValueChange={v => setNewItem({ ...newItem, priority: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Street</Label>
                                <Input value={newItem.street} onChange={e => setNewItem({ ...newItem, street: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input value={newItem.city} onChange={e => setNewItem({ ...newItem, city: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(newItem)}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
