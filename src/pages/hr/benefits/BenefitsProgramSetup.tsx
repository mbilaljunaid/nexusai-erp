import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    HeartPulse,
    Save,
    Plus,
    Trash2,
    Settings2,
    Activity,
    Layers,
    ChevronDown,
    ChevronRight,
    Search,
    Umbrella
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from '@/components/ui/DatePicker';

type HierarchyNode = {
    id: string;
    type: "PROGRAM" | "PLAN_TYPE" | "PLAN" | "OPTION";
    name: string;
    code: string;
    children?: HierarchyNode[];
    isExpanded?: boolean;
};

const initialHierarchy: HierarchyNode = {
    id: "prog_1",
    type: "PROGRAM",
    name: "2026 US Comprehensive Benefits",
    code: "US_COMP_26",
    isExpanded: true,
    children: [
        {
            id: "pt_1",
            type: "PLAN_TYPE",
            name: "Medical",
            code: "MED",
            isExpanded: true,
            children: [
                {
                    id: "pl_1",
                    type: "PLAN",
                    name: "Aetna Choice POS II",
                    code: "AET_POS",
                    isExpanded: true,
                    children: [
                        { id: "opt_1", type: "OPTION", name: "Employee Only", code: "EE_ONLY" },
                        { id: "opt_2", type: "OPTION", name: "Employee + Spouse", code: "EE_SPOUSE" },
                        { id: "opt_3", type: "OPTION", name: "Employee + Family", code: "EE_FAM" },
                    ]
                },
                {
                    id: "pl_2",
                    type: "PLAN",
                    name: "Kaiser HMO",
                    code: "KAI_HMO",
                    isExpanded: false,
                    children: [
                        { id: "opt_4", type: "OPTION", name: "Employee Only", code: "EE_ONLY" },
                        { id: "opt_5", type: "OPTION", name: "Employee + Family", code: "EE_FAM" },
                    ]
                }
            ]
        },
        {
            id: "pt_2",
            type: "PLAN_TYPE",
            name: "Dental",
            code: "DENT",
            isExpanded: false,
            children: [
                {
                    id: "pl_3",
                    type: "PLAN",
                    name: "Delta Dental PPO",
                    code: "DEL_PPO",
                    isExpanded: false,
                    children: [
                        { id: "opt_6", type: "OPTION", name: "Employee Only", code: "EE_ONLY" },
                        { id: "opt_7", type: "OPTION", name: "Employee + Family", code: "EE_FAM" },
                    ]
                }
            ]
        }
    ]
};

export default function BenefitsProgramSetup() {
    const { toast } = useToast();
    const [hierarchy, setHierarchy] = useState<HierarchyNode>(initialHierarchy);
    const [selectedNodeId, setSelectedNodeId] = useState<string>("prog_1");

    const toggleNode = (node: HierarchyNode) => {
        // Recursive function to deeply update the tree
        const updateTree = (current: HierarchyNode): HierarchyNode => {
            if (current.id === node.id) {
                return { ...current, isExpanded: !current.isExpanded };
            }
            if (current.children) {
                return { ...current, children: current.children.map(updateTree) };
            }
            return current;
        };
        setHierarchy(updateTree(hierarchy));
    };

    const handleSave = () => {
        toast({
            title: "Benefits Setup Saved",
            description: "Program hierarchy and eligibility rules have been saved successfully."
        });
    };

    // Find the currently selected node deeply
    const findSelectedNode = (current: HierarchyNode): HierarchyNode | null => {
        if (current.id === selectedNodeId) return current;
        if (current.children) {
            for (const child of current.children) {
                const found = findSelectedNode(child);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedNode = findSelectedNode(hierarchy);

    const getIconForType = (type: string) => {
        switch (type) {
            case "PROGRAM": return <Umbrella className="h-4 w-4 text-purple-600" />;
            case "PLAN_TYPE": return <Layers className="h-4 w-4 text-indigo-600" />;
            case "PLAN": return <HeartPulse className="h-4 w-4 text-emerald-600" />;
            case "OPTION": return <Activity className="h-4 w-4 text-amber-600" />;
            default: return <ChevronRight className="h-4 w-4 text-zinc-500" />;
        }
    };

    const getBadgeForType = (type: string) => {
        switch (type) {
            case "PROGRAM": return <StatusBadge status="default" label="Program" className="uppercase tracking-wider text-[10px]" />;
            case "PLAN_TYPE": return <StatusBadge status="info" label="Plan Type" className="uppercase tracking-wider text-[10px]" />;
            case "PLAN": return <StatusBadge status="active" label="Plan" className="uppercase tracking-wider text-[10px]" />;
            case "OPTION": return <StatusBadge status="warning" label="Option" className="uppercase tracking-wider text-[10px]" />;
            default: return null;
        }
    };

    const renderTree = (node: HierarchyNode) => {
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = node.id === selectedNodeId;

        return (
            <div key={node.id} className="ml-4">
                <div
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer group transition-colors ${isSelected ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                    onClick={() => setSelectedNodeId(node.id)}
                >
                    <div className="w-4 h-4 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); toggleNode(node); }} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleNode(node); } }}>
                        {hasChildren ? (node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <div className="w-4 h-4" />}
                    </div>
                    {getIconForType(node.type)}
                    <span className={`text-sm select-none ${isSelected ? 'font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {node.name} <span className="text-xs text-zinc-400 font-normal hidden group-hover:inline-block">({node.code})</span>
                    </span>
                </div>
                {hasChildren && node.isExpanded && (
                    <div className="border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-1 my-1">
                        {node.children!.map(child => renderTree(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <StandardPage
            title="Benefits Program Design"
            description="Configure the Program > Plan Type > Plan > Option hierarchy used for open enrollment."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Benefits Setup', href: '/hr/setup/workforce-structures' },
                { label: 'Program Design' }
            ]}
        >
            <div className="max-w-[1400px] mx-auto pb-12 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 rounded-lg hidden sm:block">
                            <Umbrella className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Program-Plan-Option Hierarchy</h2>
                            <p className="text-sm text-muted-foreground mt-1">Manage global benefits catalog and structured combinations.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline"><Search className="h-4 w-4 mr-2" /> Find Object...</Button>
                        <Button onClick={handleSave} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                            <Save className="h-4 w-4 mr-2" /> Save Hierarchy
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Tree Navigator */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="h-[700px] flex flex-col shadow-sm">
                            <CardHeader className="py-4 border-b bg-zinc-50/50 dark:bg-zinc-900/20">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>P-PT-P-O Navigator</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 overflow-auto -ml-4">
                                {renderTree(hierarchy)}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Selected Node Details */}
                    <div className="lg:col-span-8">
                        {selectedNode ? (
                            <Card className="h-full shadow-sm">
                                <CardHeader className="border-b pb-4 mb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {getBadgeForType(selectedNode.type)}
                                            <CardTitle className="text-xl mt-2">{selectedNode.name}</CardTitle>
                                            <CardDescription className="mt-1 font-mono text-xs">Code: {selectedNode.code}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm"><Settings2 className="h-4 w-4 mr-2" /> Design Rules</Button>
                                            <Button variant="destructive" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* General Setup */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold border-b pb-2 uppercase tracking-wider text-muted-foreground">General Configuration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Display Name</Label>
                                                <Input defaultValue={selectedNode.name} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Short Code</Label>
                                                <Input defaultValue={selectedNode.code} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <Select defaultValue="ACTIVE">
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                                        <SelectItem value="INACTIVE">Inactive (Pending)</SelectItem>
                                                        <SelectItem value="CLOSED">Closed (SunseT)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Effective Start Date</Label>
                                                <DatePicker value="2026-01-01" onChange={() => { }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Context-Specific Settings based on Type */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-sm font-semibold border-b pb-2 uppercase tracking-wider text-muted-foreground">Setup Details</h3>

                                        {selectedNode.type === "PROGRAM" && (
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="default" defaultChecked />
                                                    <label htmlFor="default" className="text-sm font-medium leading-none">Treat as Default Enrollment Program</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="waive" defaultChecked />
                                                    <label htmlFor="waive" className="text-sm font-medium leading-none">Allow Waiving Program (Opt-Out)</label>
                                                </div>
                                                <div className="space-y-2 pt-2">
                                                    <Label>Program Year Cycle</Label>
                                                    <Select defaultValue="CALENDAR">
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="CALENDAR">Calendar Year (Jan-Dec)</SelectItem>
                                                            <SelectItem value="FISCAL">Fiscal Year (Jul-Jun)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}

                                        {selectedNode.type === "PLAN" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Coverage Provider</Label>
                                                    <Select defaultValue="PROV_1">
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PROV_1">Aetna Life Insurance Co.</SelectItem>
                                                            <SelectItem value="PROV_2">Kaiser Permanente</SelectItem>
                                                            <SelectItem value="PROV_3">Delta Dental</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Dependent Designation</Label>
                                                    <Select defaultValue="ALLOWED">
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ALLOWED">Dependents Allowed</SelectItem>
                                                            <SelectItem value="NOT_ALLOWED">Employee Only (No Dependents)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}

                                        {selectedNode.type === "OPTION" && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Standard Rate (Employee Deduction)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 font-medium text-muted-foreground">$</span>
                                                        <Input type="number" defaultValue="45.00" className="pl-8" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Employer Contribution Rate</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 font-medium text-muted-foreground">$</span>
                                                        <Input type="number" defaultValue="450.00" className="pl-8" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-8 border-t flex gap-3">
                                        <Button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                            <Plus className="h-4 w-4 mr-2" /> Add Child Object
                                        </Button>
                                        <Button variant="outline">Attach Eligibility Profile</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-xl border-dashed">
                                <Layers className="h-12 w-12 mb-4 opacity-20" />
                                <h3 className="text-lg font-medium text-foreground">No Object Selected</h3>
                                <p className="text-sm">Select a Program, Plan Type, Plan, or Option from the hierarchy tree to view and edit its configuration.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </StandardPage>
    );
}
