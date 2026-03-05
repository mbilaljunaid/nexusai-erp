import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Landmark,
    Calculator,
    ArrowRightLeft,
    Search,
    Plus,
    Save,
    Settings2,
    CheckCircle2,
    Info
} from "lucide-react";

export default function PayrollCostingSetup() {
    const { toast } = useToast();
    const [selectedLevel, setSelectedLevel] = useState("element");
    const [searchQuery, setSearchQuery] = useState("");

    // Mock Elements
    const elements = [
        { id: "e1", name: "Regular Salary", type: "Earnings", classification: "Standard Earnings", status: "Active" },
        { id: "e2", name: "Overtime 1.5x", type: "Earnings", classification: "Supplemental Earnings", status: "Active" },
        { id: "d1", name: "Federal Income Tax", type: "Deduction", classification: "Tax", status: "Active" },
        { id: "d2", name: "401k Contribution", type: "Deduction", classification: "Pre-Tax Deduction", status: "Active" }
    ];

    // Mock Costing Rules
    const costingRules = [
        { id: "c1", elementId: "e1", costAcct: "01-100-51000-0000", costDesc: "Salaries Exp", offsetAcct: "01-100-21000-0000", offsetDesc: "Salaries Payable" },
        { id: "c2", elementId: "d1", costAcct: "01-100-21000-0000", costDesc: "Salaries Payable", offsetAcct: "01-100-21200-0000", offsetDesc: "Fed Tax Withheld" },
    ];

    const getRuleForElement = (elementId: string) => costingRules.find(r => r.elementId === elementId);

    const handleSave = () => {
        toast({
            title: "Costing Rules Saved",
            description: "Subledger accounting mapping updated successfully.",
        });
    };

    return (
        <StandardPage
            title="Payroll Costing Setup"
            description="Map payroll elements and organizational structures to General Ledger segment strings for automated accounting."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Payroll', href: '/hr/payroll/workbench' },
                { label: 'Costing Setup' }
            ]}
        >
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Sidebar: Costing Levels */}
                    <div className="w-full md:w-64 space-y-4 shrink-0">
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <CardHeader className="p-4 bg-muted/20 border-b">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-teal-600" /> Costing Hierarchy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <div className="space-y-1">
                                    <Button
                                        variant={selectedLevel === "payroll" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm h-9"
                                        onClick={() => setSelectedLevel("payroll")}
                                    >
                                        1. Payroll / Legal Entity
                                    </Button>
                                    <Button
                                        variant={selectedLevel === "department" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm h-9"
                                        onClick={() => setSelectedLevel("department")}
                                    >
                                        2. Department
                                    </Button>
                                    <Button
                                        variant={selectedLevel === "job" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm h-9"
                                        onClick={() => setSelectedLevel("job")}
                                    >
                                        3. Job / Position
                                    </Button>
                                    <Button
                                        variant={selectedLevel === "element" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm h-9 bg-teal-500/10 text-teal-700 hover:bg-teal-500/20"
                                        onClick={() => setSelectedLevel("element")}
                                    >
                                        4. Element (Earnings/Deds)
                                    </Button>
                                    <Button
                                        variant={selectedLevel === "person" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm h-9"
                                        onClick={() => setSelectedLevel("person")}
                                    >
                                        5. Person Level (Overrides)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-sm text-blue-900 dark:text-blue-200">
                            <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Costing Resolution</p>
                                <p className="text-xs leading-relaxed">NexusAI builds the final GL string bottom-up. Person-level overrides win first, falling back linearly to Payroll defaults.</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        {selectedLevel === "element" && (
                            <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Settings2 className="h-5 w-5 text-teal-600" /> Element Costing Rules
                                        </CardTitle>
                                        <CardDescription>Define Debit/Credit accounts for individual payroll elements.</CardDescription>
                                    </div>
                                    <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                                        <Save className="h-4 w-4 mr-2" /> Save Changes
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-4 border-b flex gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search elements by name or type..."
                                                className="pl-9 h-9"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Select defaultValue="all">
                                            <SelectTrigger className="w-[180px] h-9">
                                                <SelectValue placeholder="Classification" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Classifications</SelectItem>
                                                <SelectItem value="earnings">Earnings</SelectItem>
                                                <SelectItem value="deduction">Deductions</SelectItem>
                                                <SelectItem value="tax">Taxes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {elements.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map((element) => {
                                            const rule = getRuleForElement(element.id);
                                            const isConfigured = !!rule;

                                            return (
                                                <div key={element.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-lg">{element.name}</h3>
                                                                {isConfigured ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                        <StatusBadge status="Mapped" />
                                                                    </div>
                                                                ) : (
                                                                    <StatusBadge status="warning" label="Unmapped" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Badge variant="secondary" className="font-normal text-xs">{element.type}</Badge>
                                                                <span>•</span>
                                                                <span>{element.classification}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" className="h-8">
                                                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Override
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-1">
                                                                Cost Account (Debit)
                                                            </Label>
                                                            <div className="relative">
                                                                <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                                <Input
                                                                    defaultValue={rule?.costAcct || ""}
                                                                    placeholder="Company-Dept-Acct-Sub"
                                                                    className="pl-9 font-mono text-sm"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-1">{rule?.costDesc || "Select a GL account..."}</p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <ArrowRightLeft className="h-4 w-4 text-zinc-400" />
                                                                <Label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                                                                    Offset Account (Credit)
                                                                </Label>
                                                            </div>
                                                            <div className="relative">
                                                                <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                                <Input
                                                                    defaultValue={rule?.offsetAcct || ""}
                                                                    placeholder="Company-Dept-Acct-Sub"
                                                                    className="pl-9 font-mono text-sm"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-1">{rule?.offsetDesc || "Select a GL account..."}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                </CardContent>
                            </Card>
                        )}

                        {selectedLevel !== "element" && (
                            <Card className="border-dashed border-2 bg-transparent border-zinc-200 dark:border-zinc-800">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                    <Settings2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                                    <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Level Configuration Required</h3>
                                    <p className="max-w-md mt-2">Costing configuration for {selectedLevel} is currently managed at the global enterprise level. Switch to the Element tab to configure specific rules.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
