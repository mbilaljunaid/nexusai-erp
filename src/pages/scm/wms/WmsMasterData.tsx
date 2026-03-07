
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Map,
    Box,
    Navigation,
    Settings2,
    Trash2,
    Edit2
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";

export default function WmsMasterData() {
    return (
        <StandardPage
            title="WMS Setup & Master Data"
            description="Configure warehouse topology, zones, locators, and unit types."
        >
            <Tabs defaultValue="zones" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800">
                    <TabsTrigger value="zones">Zones</TabsTrigger>
                    <TabsTrigger value="locators">Locators</TabsTrigger>
                    <TabsTrigger value="units">Unit Types</TabsTrigger>
                    <TabsTrigger value="strategies">Strategies</TabsTrigger>
                </TabsList>

                <TabsContent value="zones" className="mt-6 space-y-4">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Warehouse Zones</CardTitle>
                                <CardDescription>Physical or logical areas within the warehouse</CardDescription>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-500">
                                <Plus className="w-4 h-4 mr-2" /> Add Zone
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[
                                    { id: '1', name: 'Zone A - Bulk Storage', type: 'STORAGE', priority: 1, status: 'active' },
                                    { id: '2', name: 'Zone B - Cold Chain', type: 'COLD', priority: 2, status: 'active' },
                                    { id: '3', name: 'Zone C - Staging', type: 'STAGING', priority: 3, status: 'active' },
                                ].map((zone) => (
                                    <div key={zone.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-blue-500/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 rounded">
                                                <Map className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{zone.name}</h4>
                                                <p className="text-sm text-slate-500">Type: {zone.type} • Priority: {zone.priority}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={zone.status} />
                                            <Button variant="ghost" size="icon" aria-label="Edit"><Edit2 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-400" aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="locators" className="mt-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Inventory Locators</CardTitle>
                                <CardDescription>Specific aisle, bay, level, and bin locations</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-64">
                                    <ContextualSearch
                                        placeholder="Search locators..."
                                        fields={[{ key: "query", label: "Search", type: "text" }]}
                                        onSearch={() => { }}
                                    />
                                </div>
                                <Button className="bg-blue-600 hover:bg-blue-500">
                                    <Plus className="w-4 h-4 mr-2" /> Add Locator
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4">
                                        <div className="p-2 bg-purple-500/10 rounded">
                                            <Navigation className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Loc Code</p>
                                            <p className="font-mono text-white">A1-04-12-{i + 1}</p>
                                            <p className="text-xs text-slate-400">Zone: STORAGE • Empty</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="units" className="mt-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Unit Types (LPN Config)</CardTitle>
                            <Button className="bg-blue-600 hover:bg-blue-500">
                                <Plus className="w-4 h-4 mr-2" /> New Unit Type
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { name: 'Pallet (PL)', dims: '48x40x40', wt: '2000lb' },
                                    { name: 'Large Box (BX)', dims: '24x24x24', wt: '50lb' },
                                    { name: 'Small Box (SB)', dims: '12x12x12', wt: '10lb' },
                                    { name: 'Tote (TO)', dims: '18x12x10', wt: '30lb' },
                                ].map((unit) => (
                                    <Card key={unit.name} className="bg-slate-950 border-slate-800 p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <Box className="w-6 h-6 text-blue-400" />
                                            <Badge variant="outline">Default</Badge>
                                        </div>
                                        <h4 className="font-bold text-white mb-1">{unit.name}</h4>
                                        <p className="text-xs text-slate-500">Dims: {unit.dims}</p>
                                        <p className="text-xs text-slate-500 mt-1">Capacity: {unit.wt}</p>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="strategies" className="mt-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Pick & Putaway Strategies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg flex items-start gap-4">
                                <Settings2 className="w-5 h-5 text-blue-400 mt-1" />
                                <div>
                                    <h4 className="font-bold text-blue-400">System Directed Putaway</h4>
                                    <p className="text-sm text-slate-400">Current Strategy: Empty Bin First (Consolidation Enabled)</p>
                                </div>
                            </div>
                            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg flex items-start gap-4">
                                <Settings2 className="w-5 h-5 text-orange-400 mt-1" />
                                <div>
                                    <h4 className="font-bold text-orange-400">Wave Release Logic</h4>
                                    <p className="text-sm text-slate-400">Current Strategy: Priority + FIFO</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
