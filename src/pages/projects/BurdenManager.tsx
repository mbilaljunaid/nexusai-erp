import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Percent, Layers } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

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

    const scheduleColumns: SpreadsheetColumn<any>[] = [
        {
            id: "name", header: "Schedule Name", width: "30%", cell: (item: any) => (
                <div className="p-2 font-medium">{item.name}</div>
            )
        },
        {
            id: "version", header: "Version", width: "15%", cell: (item: any) => (
                <div className="p-2"><Badge variant="outline">{item.version}</Badge></div>
            )
        },
        {
            id: "activeFlag", header: "Status", width: "15%", cell: (item: any) => (
                <div className="p-2">
                    <Badge variant={item.activeFlag ? 'default' : 'secondary'}>
                        {item.activeFlag ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            )
        },
        { id: "createdAt", header: "Created", width: "20%", cell: (item: any) => <div className="p-2">{formatDate(item.createdAt)}</div> },
        {
            id: "rules", header: "Rules", width: "20%", cell: (item: any) => (
                <div className="p-2 text-muted-foreground">{item.rules?.length || 0} rules</div>
            )
        }
    ];

    const ruleColumns: SpreadsheetColumn<any>[] = [
        { id: "precedence", header: "Order", width: "10%", cell: (item: any) => <div className="p-2">{item.precedence}</div> },
        { id: "expenditureType", header: "Expenditure Type", width: "60%", cell: (item: any) => <div className="p-2">{item.expenditureType}</div> },
        {
            id: "multiplier", header: "Multiplier", width: "30%", cell: (item: any) => (
                <div className="p-2 flex items-center gap-1 font-mono">
                    <Percent className="h-3 w-3 text-muted-foreground" />
                    {(parseFloat(item.multiplier) * 100).toFixed(2)}%
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Page Title">
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
                            {isLoading ? (
                                <TableSkeleton rows={5} />
                            ) : (
                                <InteractiveSpreadsheet
                                    data={schedules || []}
                                    columns={scheduleColumns}
                                    virtualized={true}
                                    containerHeight="600px"
                                    onChange={() => { }}
                                />
                            )}
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
                                    <div className="border rounded-md">
                                        <InteractiveSpreadsheet
                                            data={selectedSchedule.rules || []}
                                            columns={ruleColumns}
                                            virtualized={true}
                                            containerHeight="400px"
                                            onChange={() => { }}
                                        />
                                    </div>
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
        </StandardPage>
    );
}
