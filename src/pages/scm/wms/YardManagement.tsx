
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Truck,
    Clock,
    Plus,
    Calendar,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    ArrowRight
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function YardManagement() {
    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ["/api/scm/wms/dock-appointments"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/dock-appointments");
            return res.json();
        }
    });

    return (
        <StandardPage
            title="Yard & Dock Management"
            description="Optimize inbound and outbound traffic with real-time dock scheduling."
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Docks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">12</p>
                        <p className="text-xs text-slate-400 mt-1">8 General • 4 Cold</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Occupied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-400">4</p>
                        <p className="text-xs text-slate-400 mt-1">3 Inbound • 1 Outbound</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Today's Appts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-400">18</p>
                        <p className="text-xs text-slate-400 mt-1">7 Completed</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Trailer Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-400">22</p>
                        <p className="text-xs text-slate-400 mt-1">In yard / Staged</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Dock Appointments</CardTitle>
                            <CardDescription>Scheduled inbound/outbound shipments</CardDescription>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-500">
                            <Plus className="w-4 h-4 mr-2" /> Schedule Appointment
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { id: 'APT-1044', carrier: 'FedEx Freight', type: 'INBOUND', time: '14:30', dock: 'D-04', status: 'ARRIVED' },
                                { id: 'APT-1045', carrier: 'Schneider', type: 'OUTBOUND', time: '15:00', dock: 'D-08', status: 'SCHEDULED' },
                                { id: 'APT-1046', carrier: 'XPO Logistics', type: 'INBOUND', time: '16:30', dock: 'D-01', status: 'SCHEDULED' },
                                { id: 'APT-1047', carrier: 'JB Hunt', type: 'INBOUND', time: '17:00', dock: 'PENDING', status: 'DELAYED' },
                            ].map((appt) => (
                                <div key={appt.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-lg">
                                            <Truck className={`w-6 h-6 ${appt.type === 'INBOUND' ? 'text-blue-400' : 'text-purple-400'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{appt.carrier}</h4>
                                            <p className="text-xs text-slate-500">{appt.id} • {appt.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-sm font-mono text-white flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-slate-500" /> {appt.time}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Dock: {appt.dock}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                ${appt.status === 'ARRIVED' ? 'border-green-500/20 text-green-400 bg-green-500/5' : ''}
                                                ${appt.status === 'DELAYED' ? 'border-red-500/20 text-red-400 bg-red-500/5' : ''}
                                                ${appt.status === 'SCHEDULED' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : ''}
                                            `}
                                        >
                                            {appt.status}
                                        </Badge>
                                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4 text-slate-500" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Dock Grid View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className={`h-16 rounded border flex flex-col items-center justify-center gap-1 ${i < 4 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">D-{(i + 1).toString().padStart(2, '0')}</span>
                                        {i < 4 ? <Truck className="w-4 h-4 text-blue-400" /> : <div className="w-4 h-4" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm">Yard Alerts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-100 leading-relaxed font-medium">Trailer JB-7740 has exceeded standard dwell time in Bay 04 (48h+).</p>
                            </div>
                            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-orange-100 leading-relaxed font-medium">Potential bottleneck at Inbound Gate. 3 carriers arriving in next 15 mins.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
