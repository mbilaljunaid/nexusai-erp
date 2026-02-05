
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Truck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function DockScheduler() {
    const [date, setDate] = useState<Date>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const warehouseId = "550e8400-e29b-41d4-a716-446655440000"; // User Context
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form
    const [formData, setFormData] = useState({
        dockNumber: 'DOCK-01',
        carrier: '',
        timeShort: '10:00',
        referenceNumber: ''
    });

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['dockAppointments', date.toISOString().split('T')[0]],
        queryFn: async () => {
            const res = await fetch(`/api/wms/dock-appointments?warehouseId=${warehouseId}&date=${date.toISOString()}`);
            if (!res.ok) throw new Error("Failed to fetch appointments");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // Combine date + time
            const [hours, mins] = formData.timeShort.split(':').map(Number);
            const apptTime = new Date(date);
            apptTime.setHours(hours, mins, 0, 0);

            const payload = {
                warehouseId,
                dockNumber: formData.dockNumber,
                carrier: formData.carrier,
                appointmentTime: apptTime.toISOString(),
                referenceNumber: formData.referenceNumber,
                status: 'SCHEDULED'
            };

            const res = await fetch('/api/wms/dock-appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to schedule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dockAppointments'] });
            setIsOpen(false);
            setFormData({ ...formData, carrier: '', referenceNumber: '' });
            toast({ title: "Appointment Scheduled" });
        }
    });

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">Yard & Dock Scheduler</h2>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Truck className="mr-2 h-4 w-4" /> Schedule Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Dock Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Dock Number</label>
                                <Input value={formData.dockNumber} onChange={(e) => setFormData({ ...formData, dockNumber: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Carrier</label>
                                <Input placeholder="DHL, FedEx, Own Fleet" value={formData.carrier} onChange={(e) => setFormData({ ...formData, carrier: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time (24h)</label>
                                <Input type="time" value={formData.timeShort} onChange={(e) => setFormData({ ...formData, timeShort: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reference (PO/Shipment)</label>
                                <Input placeholder="PO-12345" value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} />
                            </div>
                            <Button className="w-full" onClick={() => createMutation.mutate(null)} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Scheduling..." : "Book Slot"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Dock</TableHead>
                            <TableHead>Carrier</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                            appointments?.length === 0 ? <TableRow><TableCell colSpan={5}>No appointments for this date.</TableCell></TableRow> :
                                appointments?.map((appt: any) => (
                                    <TableRow key={appt.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(appt.appointmentTime), "HH:mm")}
                                        </TableCell>
                                        <TableCell>{appt.dockNumber}</TableCell>
                                        <TableCell>{appt.carrier}</TableCell>
                                        <TableCell>{appt.referenceNumber}</TableCell>
                                        <TableCell>{appt.status}</TableCell>
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
