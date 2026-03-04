import React, { useState } from "react";
import { i18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { ContextualSearch } from "@/components/ContextualSearch";
import {
    GitMerge,
    TrendingUp,
    Building2,
    Briefcase,
    Save,
    Plus,
    Info,
    ArrowRight,
    Search
} from "lucide-react";

export default function WorkforceStructureSetup() {
    const { toast } = useToast();
    const [syncEnabled, setSyncEnabled] = useState(true);

    const handleSave = () => {
        toast({
            title: "Configuration Saved",
            description: "Workforce structure rules have been successfully updated.",
        });
    };

    const LADDERS = [
        { id: 'l1', name: 'Engineering Professional Series', type: 'Time-in-Step', typeClass: 'bg-blue-50 text-blue-700 border-blue-200', grades: 'G1, G2, G3 (12 Steps Total)', status: 'Active' },
        { id: 'l2', name: 'Executive Leadership', type: 'Manual / Performance', typeClass: 'bg-purple-50 text-purple-700 border-purple-200', grades: 'E1, E2 (No Steps)', status: 'Active' },
    ];

    const ladderColumns: SpreadsheetColumn<any>[] = [
        { id: "name", header: "Ladder Name", width: "250px", cell: (row) => <span className="font-semibold">{row.name}</span> },
        { id: "type", header: "Progression Type", width: "200px", cell: (row) => <div className="w-full"><Badge variant="outline" className={row.typeClass}>{row.type}</Badge></div> },
        { id: "grades", header: "Grades Included", width: "250px", cell: (row) => <span className="text-muted-foreground">{row.grades}</span> },
        { id: "status", header: "Status", width: "120px", cell: (row) => <div className="w-full"><Badge className="bg-green-500/10 text-green-700 border-green-500/20 shadow-none">{row.status}</Badge></div> },
        {
            id: "actions", header: "Actions", width: "150px", cell: (row) => (
                <div className="flex justify-end w-full">
                    <Button variant="ghost" size="sm">Manage Steps <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Workforce Structures"
            description="Configure Position Synchronization and Grade Step Progression rules."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Workforce Structures' }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6">

                <Tabs defaultValue="position-sync" className="w-full">
                    <TabsList className="grid grid-cols-2 md:w-[400px] bg-zinc-100/50 dark:bg-zinc-800/50 p-1 mb-6">
                        <TabsTrigger value="position-sync" className="flex items-center gap-2">
                            <GitMerge className="h-4 w-4" /> Position Sync
                        </TabsTrigger>
                        <TabsTrigger value="grade-steps" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Grade Steps
                        </TabsTrigger>
                    </TabsList>

                    {/*
                      =========================================
                      TAB 1: POSITION SYNCHRONIZATION
                      =========================================
                      Oracle Parity: "Position Synchronization" ensures that when an employee is hired into a Position,
                      attributes like Job, Department, Location, and Grade are automatically inherited and cannot be overridden.
                    */}
                    <TabsContent value="position-sync" className="space-y-6 animate-in fade-in-50 duration-500">
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                            <CardHeader className="bg-muted/30 border-b border-border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <GitMerge className="h-5 w-5 text-indigo-500" /> Enterprise Position Synchronization
                                        </CardTitle>
                                        <CardDescription className="mt-2 max-w-2xl text-[13px]">
                                            When enabled, assignments automatically inherit attributes from their assigned Position. You can configure which specific attributes are forced to sync, preventing manual overrides during HR transactions (e.g., Hiring, Transferring).
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3 bg-background border px-4 py-2 rounded-lg shadow-sm">
                                        <Label htmlFor="global-sync" className="font-semibold text-sm">Enable Global Sync</Label>
                                        <Switch id="global-sync" checked={syncEnabled} onCheckedChange={setSyncEnabled} className="data-[state=checked]:bg-indigo-600" />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className={`transition-opacity duration-300 ${!syncEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Attribute Inheritance Rules</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        {/* Job Sync */}
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-md">
                                                    <Briefcase className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <Label className="text-base font-semibold">Job</Label>
                                                    <p className="text-xs text-muted-foreground">Inherit associated Job code</p>
                                                </div>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        {/* Department Sync */}
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-md">
                                                    <Building2 className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <Label className="text-base font-semibold">Department</Label>
                                                    <p className="text-xs text-muted-foreground">Inherit organizational department</p>
                                                </div>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        {/* Grade Sync */}
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-md">
                                                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <Label className="text-base font-semibold">Grade</Label>
                                                    <p className="text-xs text-muted-foreground">Inherit compensation grade level</p>
                                                </div>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        {/* FTE Sync */}
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-indigo-500/30 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-500/10 rounded-md">
                                                    <span className="text-xs font-bold font-mono text-gray-600">FTE</span>
                                                </div>
                                                <div>
                                                    <Label className="text-base font-semibold">FTE & Working Hours</Label>
                                                    <p className="text-xs text-muted-foreground">Inherit standard working capacity</p>
                                                </div>
                                            </div>
                                            <Switch defaultChecked={false} />
                                        </div>
                                    </div>

                                    <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-blue-800 dark:text-blue-300">
                                        <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <strong>Note:</strong> If an attribute is set to synchronize, the field will become read-only during employee assignment flows (like the Action Wizard). The value can only be modified by updating the root Position definition.
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                                            <Save className="mr-2 h-4 w-4" /> Save Synchronization Rules
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/*
                      =========================================
                      TAB 2: GRADE STEP PROGRESSION
                      =========================================
                      Oracle Parity: "Grade Step Progression" automated matrices, advancing employees up steps
                      within a grade based on time-in-step or performance criteria.
                    */}
                    <TabsContent value="grade-steps" className="space-y-6 animate-in fade-in-50 duration-500">
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-emerald-600" /> Grade Ladders & Steps
                                        </CardTitle>
                                        <CardDescription>Configure structured compensation progression models.</CardDescription>
                                    </div>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                        <Plus className="mr-2 h-4 w-4" /> Create Grade Ladder
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>

                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1">
                                        <ContextualSearch
                                            placeholder="Search Grade Ladders..."
                                            fields={[{ key: "query", label: "Search", type: "text" }]}
                                            onSearch={() => { }}
                                        />
                                    </div>
                                    <Select defaultValue="active">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active Ladders</SelectItem>
                                            <SelectItem value="draft">Drafts</SelectItem>
                                            <SelectItem value="all">All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Mock Grade Ladder Table */}
                                <div className="border rounded-lg overflow-hidden h-[300px]">
                                    <InteractiveSpreadsheet
                                        columns={ladderColumns}
                                        data={LADDERS}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                </div>

                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
