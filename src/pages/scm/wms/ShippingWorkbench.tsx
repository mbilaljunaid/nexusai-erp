
import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Truck,
    Package,
    MapPin,
    FileText,
    Printer,
    CheckCircle2,
    Ship,
    Search,
    Filter
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ShippingWorkbench() {
    return (
        <StandardPage
            title="Shipping Workbench"
            description="Final verification, packing, and carrier manifest generation."
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Orders Ready to Ship</CardTitle>
                            <CardDescription>Verified waves ready for carrier check-out</CardDescription>
                        </div>
                        <Button variant="outline" className="border-slate-800 bg-slate-950">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { id: 'SHP-9901', customer: 'Industrial Solutions Inc.', status: 'PACKED', weight: '450kg', carrier: 'UPS Ground' },
                                { id: 'SHP-9902', customer: 'TechParts Global', status: 'READY', weight: '120kg', carrier: 'DHL Express' },
                                { id: 'SHP-9903', customer: 'Apex Manufacturing', status: 'PACKED', weight: '2200kg', carrier: 'LTL Freight' },
                            ].map((shipment) => (
                                <div key={shipment.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-lg">
                                            <Package className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{shipment.id}</h4>
                                            <p className="text-xs text-slate-500">{shipment.customer} • {shipment.carrier}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <StatusBadge status={shipment.status} />
                                            <p className="text-xs text-slate-500 mt-1">{shipment.weight}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon"><Printer className="w-4 h-4" /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Print Labels</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Button className="bg-blue-600 hover:bg-blue-500 size-sm h-9 px-4">
                                                Ship <Ship className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Carrier Integration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded">
                                <span className="text-sm text-white">Carrier API Status</span>
                                <StatusBadge status="Connected" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 uppercase font-bold">Upcoming Pickups</p>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-white">UPS Ground</span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">16:30</span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center opacity-50">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-white">FedEx Express</span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">TOMORROW</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-600/5 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="text-sm">Manifest Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Total Shipped Today</span>
                                <span className="text-white font-bold">42</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Pending Manifest</span>
                                <span className="text-blue-400 font-bold">5</span>
                            </div>
                            <Button className="w-full mt-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 h-9">
                                <FileText className="w-4 h-4 mr-2" /> View Audit Log
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
