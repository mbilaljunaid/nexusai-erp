
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Truck, Calendar, CheckCircle, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function WorkOrderDetail() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignData, setAssignData] = useState({ technicianId: "", start: "", end: "" });

    const { data, isLoading } = useQuery({
        queryKey: [`/api/crm/field-service/${id}`],
        queryFn: () => fetch(`/api/crm/field-service/${id}`).then(r => r.json())
    });

    const { data: technicians } = useQuery({
        queryKey: ["/api/crm/field-service/technicians/list"],
        queryFn: () => fetch("/api/crm/field-service/technicians/list").then(r => r.json())
    });

    const assignMutation = useMutation({
        mutationFn: async (payload: any) => {
            await fetch(`/api/crm/field-service/${id}/assign`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/field-service/${id}`] });
            setIsAssignOpen(false);
        }
    });

    const completeMutation = useMutation({
        mutationFn: async () => {
            await fetch(`/api/crm/field-service/${id}/complete`, { method: "POST" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/field-service/${id}`] });
        }
    });

    if (isLoading) return <div className="p-8">Loading WO...</div>;

    const { workOrder, appointments, linkedCase } = data || {};

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{workOrder?.workOrderNumber}</h1>
                        <Badge variant={workOrder?.status === 'Completed' ? 'default' : 'secondary'}>{workOrder?.status}</Badge>
                        {workOrder?.priority === 'High' && <Badge variant="destructive">High Priority</Badge>}
                    </div>
                    <p className="text-xl mt-2 font-medium">{workOrder?.subject}</p>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        {workOrder?.street}, {workOrder?.city}
                    </div>
                </div>
                <div className="flex gap-2">
                    {workOrder?.status === 'New' && (
                        <Button onClick={() => setIsAssignOpen(true)}>
                            <Calendar className="mr-2 h-4 w-4" /> Schedule
                        </Button>
                    )}
                    {workOrder?.status === 'Scheduled' && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => completeMutation.mutate()}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Complete Work
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1">{workOrder?.description || "No description provided."}</p>
                        </div>
                        <Separator />
                        {linkedCase && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Linked Case</h3>
                                <p className="mt-1 font-semibold">{linkedCase.subject}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {appointments?.length === 0 ? (
                            <p className="text-muted-foreground">No appointments scheduled.</p>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appt: any) => (
                                    <div key={appt.id} className="border p-4 rounded-md flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{technicians?.find((t: any) => t.id === appt.technicianId)?.name || appt.technicianId}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {new Date(appt.scheduledStart).toLocaleString()} - {new Date(appt.scheduledEnd).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <Badge>{appt.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Technician</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Technician</Label>
                            <Select onValueChange={v => setAssignData({ ...assignData, technicianId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Technician" /></SelectTrigger>
                                <SelectContent>
                                    {technicians?.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.skills.join(', ')})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="datetime-local" onChange={e => setAssignData({ ...assignData, start: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="datetime-local" onChange={e => setAssignData({ ...assignData, end: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                        <Button onClick={() => assignMutation.mutate(assignData)}>Dispatch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
