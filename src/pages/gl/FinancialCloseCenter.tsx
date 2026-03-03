
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { FinanceSidebar } from "@/components/nav/FinanceSidebar";
import CloseDashboard from "./CloseDashboard";
import ConsolidationWorkbench from "./ConsolidationWorkbench";
import EliminationRules from "./EliminationRules";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, Settings, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";

export default function FinancialCloseCenter() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <ModuleLayout sidebar={<FinanceSidebar />}>
            <StandardPage
                title="Financial Close Center"
                description="Centralized hub for period close orchestration, consolidation, and financial reporting."
            >

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-700">Current Period</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Jan-2026</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Ends in 5 days
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Close Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">62%</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                48/60 Tasks Completed
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Consolidation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Ready</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Sub-ledgers closed
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium Risk</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                3 Unreconciled Items
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="overview" className="gap-2">
                                <BarChart3 className="w-4 h-4" /> Orchestration
                            </TabsTrigger>
                            <TabsTrigger value="consolidation" className="gap-2">
                                <ShieldCheck className="w-4 h-4" /> Consolidation
                            </TabsTrigger>
                            <TabsTrigger value="rules" className="gap-2">
                                <Settings className="w-4 h-4" /> Rules
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-4">
                        <CloseDashboard />
                    </TabsContent>

                    <TabsContent value="consolidation" className="space-y-4">
                        <ConsolidationWorkbench />
                    </TabsContent>

                    <TabsContent value="rules" className="space-y-4">
                        <EliminationRules />
                    </TabsContent>
                </Tabs>
            </StandardPage>
        </ModuleLayout>
    );
}
