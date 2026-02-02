import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SlaRules from "@/pages/gl/SlaRules"; // Existing JLT Editor
import { AccountRuleList } from "@/components/sla/AccountRuleList"; // New
import { MappingSetList } from "@/components/sla/MappingSetList"; // New
import { ArrowLeft, BookOpen, Calculator, Layers, Split, Database } from "lucide-react";
import { Link } from "wouter";

export default function AccountingHubWorkbench() {
    const [activeTab, setActiveTab] = useState("jlt");

    return (
        <StandardPage
            title="Accounting Hub Cloud Service (AHCS)"
            description="Centralized accounting engine configuration. Define how transactions from any subsystem are accounted."
            actions={
                <Link href="/gl/dashboard">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to GL
                    </Button>
                </Link>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
                                <Layers className="h-4 w-4" /> Event Models
                            </CardTitle>
                            <div className="text-2xl font-bold text-slate-900 mt-1">12</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Journal Types
                            </CardTitle>
                            <div className="text-2xl font-bold text-slate-900 mt-1">45</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
                                <Calculator className="h-4 w-4" /> Account Rules
                            </CardTitle>
                            <div className="text-2xl font-bold text-slate-900 mt-1">28</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
                                <Database className="h-4 w-4" /> Mapping Sets
                            </CardTitle>
                            <div className="text-2xl font-bold text-slate-900 mt-1">8</div>
                        </CardHeader>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                        <TabsTrigger value="jlt">Journal Lines</TabsTrigger>
                        <TabsTrigger value="adr">Account Rules</TabsTrigger>
                        <TabsTrigger value="mappings">Mapping Sets</TabsTrigger>
                        <TabsTrigger value="events">Event Classes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="jlt" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Journal Line Types (JLT)</CardTitle>
                                <CardDescription>Define Debit/Credit templates for each Event Class.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Reusing existing component logic directly or wrapping it */}
                                <SlaRules />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="adr" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Derivation Rules (ADR)</CardTitle>
                                <CardDescription>Logic to determine Segment values dynamically.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AccountRuleList />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mappings" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mapping Sets</CardTitle>
                                <CardDescription>Translation tables (e.g., Input 'Consulting' &rarr; '5000-Expenses').</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MappingSetList />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Register Event Classes</CardTitle>
                                <CardDescription>View system-seeded Event Classes and Types.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center p-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                    System Managed (Read Only)
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
