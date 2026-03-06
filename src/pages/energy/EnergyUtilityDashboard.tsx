import { formatDate, formatDateTime } from "@/lib/dateUtils";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    GridManagementService,
    OutageManagementService,
    DemandResponseService,
    ComplianceService
} from '@/services/energyUtilityService';
import { Zap, AlertTriangle, TrendingDown, FileCheck } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";


export default function EnergyUtilityDashboard() {
    const [gridHealth, setGridHealth] = useState<any>(null);
    const [outages, setOutages] = useState<any[]>([]);
    const [drPrograms, setDRPrograms] = useState<any[]>([]);
    const [filings, setFilings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [healthData, outagesData, programsData, filingsData] = await Promise.all([
                GridManagementService.getAssetHealth(),
                OutageManagementService.getActiveOutages(),
                DemandResponseService.getPrograms(),
                ComplianceService.getUpcomingFilings(30)
            ]);
            setGridHealth(healthData);
            setOutages(outagesData);
            setDRPrograms(programsData);
            setFilings(filingsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <StandardPage title="Energy & Utilities Platform">
            

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            Grid Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{gridHealth?.avg_health_score || 0}%</div>
                        <div className="text-xs text-gray-500">{gridHealth?.total_assets} assets</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Active Outages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{outages.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <TrendingDown className="h-4 w-4 mr-2" />
                            DR Programs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{drPrograms.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Upcoming Filings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{filings.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="outages">
                <TabsList>
                    <TabsTrigger value="outages">Outages</TabsTrigger>
                    <TabsTrigger value="demand">Demand Response</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="outages" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Outages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {outages.map(outage => (
                                    <div key={outage.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">{outage.outage_number}</div>
                                            <div className="text-sm text-gray-500">
                                                {outage.cause} • {outage.affected_customers} customers affected
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Started: {formatDateTime(outage.started_at)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={outage.priority === 'critical' ? 'destructive' : 'default'}>
                                                {outage.priority}
                                            </Badge>
                                            <div className="text-xs mt-1">{outage.status}</div>
                                        </div>
                                    </div>
                                ))}
                                {outages.length === 0 && (
                                    <p className="text-center text-gray-400 py-8">No active outages</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="demand" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Demand Response Programs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {drPrograms.map(program => (
                                    <div key={program.id} className="p-3 border rounded">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{program.program_name}</div>
                                                <div className="text-sm text-gray-500">{program.program_type}</div>
                                            </div>
                                            <Badge variant="outline">${program.incentive_rate}/kWh</Badge>
                                        </div>
                                        <div className="text-sm mt-2">
                                            Target: {program.target_reduction_kw} kW reduction
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Regulatory Filings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filings.map(filing => (
                                    <div key={filing.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">
                                                {filing.compliance_regulations?.regulation_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {filing.filing_period} • {filing.compliance_regulations?.regulatory_body}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                Due: {formatDate(filing.due_date)}
                                            </div>
                                            <Badge variant="secondary">{filing.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {filings.length === 0 && (
                                    <p className="text-center text-gray-400 py-8">No upcoming filings</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
