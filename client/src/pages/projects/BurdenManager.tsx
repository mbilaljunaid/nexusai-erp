import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Percent, Layers } from "lucide-react";

interface BurdenRule {
    id: string;
    expenditureType: string;
    multiplier: string;
    precedence: number;
}

interface BurdenSchedule {
    id: string;
    name: string;
    description: string;
    version: string;
    activeFlag: boolean;
    createdAt: string;
    rules: BurdenRule[];
}

export default function BurdenManager() {
    const [selectedSchedule, setSelectedSchedule] = useState<BurdenSchedule | null>(null);

    const { data: schedules, isLoading } = useQuery<BurdenSchedule[]>({
        queryKey: ['/api/ppm/burden-schedules'],
    });

    const scheduleColumns: Column<BurdenSchedule>[] = [
        {
            header: "Schedule Name", accessorKey: "name", cell: (item) => (
                <div className="font-medium">{item.name}</div>
            )
        },
        {
            header: "Version", accessorKey: "version", cell: (item) => (
                <Badge variant="outline">{item.version}</Badge>
            )
        },
        {
            header: "Status", accessorKey: "activeFlag", cell: (item) => (
                <Badge variant={item.activeFlag ? 'default' : 'secondary'}>
                    {item.activeFlag ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        { header: "Created", accessorKey: "createdAt", cell: (item) => new Date(item.createdAt).toLocaleDateString() },
        {
            header: "Rules", cell: (item) => (
                <span className="text-muted-foreground">{item.rules?.length || 0} rules</span>
            )
        }
    ];

    const ruleColumns: Column<BurdenRule>[] = [
        { header: "Order", accessorKey: "precedence", width: "10%" },
        { header: "Expenditure Type", accessorKey: "expenditureType" },
        {
            header: "Multiplier", accessorKey: "multiplier", cell: (item) => (
                <div className="flex items-center gap-1 font-mono">
                    <Percent className="h-3 w-3 text-muted-foreground" />
                    {(parseFloat(item.multiplier) * 100).toFixed(2)}%
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Burden Schedules</h2>
                    <p className="text-muted-foreground">Manage overhead cost allocation rules and multipliers</p>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" /> New Schedule</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Schedules</CardTitle>
                            <CardDescription>Select a schedule to view details</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandardTable
                                data={schedules || []}
                                columns={scheduleColumns}
                                isLoading={isLoading}
                                onRowClick={setSelectedSchedule}
                                pageSize={10}
                                className="border-0 shadow-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            {selectedSchedule ? (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{selectedSchedule.name}</CardTitle>
                                        <CardDescription>{selectedSchedule.description}</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">Edit Rules</Button>
                                </div>
                            ) : (
                                <CardTitle className="text-muted-foreground">Schedule Details</CardTitle>
                            )}
                        </CardHeader>
                        <CardContent>
                            {selectedSchedule ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                                        <Layers className="h-4 w-4" />
                                        <span>Cost Multipliers</span>
                                    </div>
                                    <StandardTable
                                        data={selectedSchedule.rules || []}
                                        columns={ruleColumns}
                                        pageSize={100} // Show all rules
                                    />
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                    <Layers className="h-8 w-8 opacity-20 mb-2" />
                                    <p>Select a schedule to view its configuration</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
