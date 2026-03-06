import { formatDate } from "@/lib/dateUtils";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrialManagementService, PlanManagementService } from '@/services/trialPlanService';
import { Check, X } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";


export default function TrialPlanManagementDashboard() {
    const [trials, setTrials] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [conversionMetrics, setConversionMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [trialsData, plansData, metrics] = await Promise.all([
                TrialManagementService.getActiveTrials(),
                PlanManagementService.getActivePlans(),
                TrialManagementService.getConversionMetrics(30)
            ]);
            setTrials(trialsData);
            setPlans(plansData);
            setConversionMetrics(metrics);
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
        <StandardPage title="Trial & Plan Management">
            

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Trials</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{trials.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Conversion Rate</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{conversionMetrics?.conversion_rate?.toFixed(1)}%</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Avg Days to Convert</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{conversionMetrics?.avg_days_to_convert}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Plans</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{plans.length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="plans">
                <TabsList>
                    <TabsTrigger value="plans">Plans</TabsTrigger>
                    <TabsTrigger value="trials">Active Trials</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4gap-4">
                        {plans.map(plan => (
                            <Card key={plan.id}>
                                <CardHeader>
                                    <Badge>{plan.tier}</Badge>
                                    <CardTitle className="text-2xl mt-2">{plan.display_name}</CardTitle>
                                    <p className="text-gray-500 text-sm">{plan.description}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold mb-4">
                                        ${plan.price_monthly}
                                        <span className="text-base font-normal text-gray-500">/mo</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        {plan.features.slice(0, 5).map((feature: string, i: number) => (
                                            <div key={i} className="flex items-center">
                                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="trials" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Active Trial Users</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {trials.slice(0, 10).map(trial => (
                                    <div key={trial.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">{trial.email}</div>
                                            <div className="text-sm text-gray-500">
                                                Started: {formatDate(trial.trial_started_at)}
                                            </div>
                                        </div>
                                        <Badge>{trial.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
