import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Settings2, ShieldCheck, Link as LinkIcon, AlertCircle, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";

export default function ElementConfiguration() {
    const [selectedTab, setSelectedTab] = useState("elements");
    const [isElementFormOpen, setIsElementFormOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);

    // Mock Elements
    const elements = [
        { id: "E-001", name: "Regular Salary", type: "Earning", primaryClassification: "Standard Earnings", reportingName: "Base Pay", isRecurring: true },
        { id: "E-002", name: "Annual Bonus", type: "Earning", primaryClassification: "Supplemental Earnings", reportingName: "Bonus", isRecurring: false },
        { id: "D-001", name: "Health Insurance Pre-Tax", type: "Deduction", primaryClassification: "Pre-Tax Deductions", reportingName: "Medical", isRecurring: true },
        { id: "D-002", name: "401k Contribution", type: "Deduction", primaryClassification: "Pre-Tax Deductions", reportingName: "Retirement", isRecurring: true },
        { id: "E-003", name: "Shift Differential (Night)", type: "Earning", primaryClassification: "Premium Pay", reportingName: "Shift Pay", isRecurring: true },
    ];

    return (
        <StandardPage
            title="Payroll Elements Configuration"
            description="Define earnings, deductions, calculation rules, and eligibility profiles."
            actions={
                <div className="flex gap-3">
                    <Button variant="outline" className="border-teal-500/20 text-teal-600 hover:bg-teal-500/5">
                        <PlayCircle className="h-4 w-4 mr-2" /> Simulate Calculation
                    </Button>
                    <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => setIsElementFormOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Element
                    </Button>
                </div>
            }
        >
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="bg-zinc-100/50 dark:bg-zinc-800/50 p-1 grid grid-cols-4 md:w-[600px]">
                    <TabsTrigger value="elements" className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> Elements
                    </TabsTrigger>
                    <TabsTrigger value="eligibility" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Eligibility Links
                    </TabsTrigger>
                    <TabsTrigger value="balances" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Balances
                    </TabsTrigger>
                    <TabsTrigger value="costing" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Costing
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="elements" className="mt-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div>
                                <CardTitle className="text-lg">Element Dictionary</CardTitle>
                                <CardDescription>All defined payroll components and their classifications.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-64">
                                    <ContextualSearch
                                        placeholder="Search elements..."
                                        fields={[{ key: "query", label: "Search", type: "text" }]}
                                        onSearch={() => { }}
                                    />
                                </div>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-36 h-9">
                                        <SelectValue placeholder="Classification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classifications</SelectItem>
                                        <SelectItem value="earnings">Earnings</SelectItem>
                                        <SelectItem value="deductions">Deductions</SelectItem>
                                        <SelectItem value="taxes">Taxes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="min-w-full divide-y divide-border">
                                <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-muted-foreground bg-muted/30">
                                    <div className="col-span-3">Element Name</div>
                                    <div className="col-span-1">Type</div>
                                    <div className="col-span-3">Primary Classification</div>
                                    <div className="col-span-2">Reporting Name</div>
                                    <div className="col-span-2">Recurrence</div>
                                    <div className="col-span-1 text-right">Actions</div>
                                </div>
                                {elements.map((element) => (
                                    <div key={element.id} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/10 transition-colors">
                                        <div className="col-span-3 font-medium text-primary cursor-pointer hover:underline">{element.name}</div>
                                        <div className="col-span-1">
                                            <Badge variant="outline" className={element.type === 'Earning' ? 'text-green-600 border-green-200 bg-green-500/10' : 'text-amber-600 border-amber-200 bg-amber-500/10'}>
                                                {element.type}
                                            </Badge>
                                        </div>
                                        <div className="col-span-3 text-muted-foreground">{element.primaryClassification}</div>
                                        <div className="col-span-2">{element.reportingName}</div>
                                        <div className="col-span-2">
                                            {element.isRecurring ? "Recurring" : "Non-Recurring"}
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setIsLinkOpen(true)}>Manage Links</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="eligibility" className="mt-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm p-12 text-center text-muted-foreground">
                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Element Eligibility Profiles</h3>
                        <p className="max-w-md mx-auto mb-6">Define the organizational criteria (Department, Legal Employer, Job, Grade) that determine if an employee is eligible for specific elements.</p>
                        <Button variant="outline" onClick={() => setIsLinkOpen(true)}>Create Eligibility Link</Button>
                    </Card>
                </TabsContent>

                <TabsContent value="balances" className="mt-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm p-12 text-center text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Payroll Balances</h3>
                        <p className="max-w-md mx-auto mb-6">Configure how element input values feed into cumulative balances (e.g., YTD Gross, subject to tax rules).</p>
                        <Button variant="outline">Create Balance Definition</Button>
                    </Card>
                </TabsContent>

                <TabsContent value="costing" className="mt-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm p-12 text-center text-muted-foreground">
                        <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">SLA Costing Rules</h3>
                        <p className="max-w-md mx-auto mb-6">Map element input values to General Ledger segments. Configure cost allocation proportions and suspense accounts.</p>
                        <Button variant="outline">Define Costing Rule</Button>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Element Dialog Simulator */}
            <Dialog open={isElementFormOpen} onOpenChange={setIsElementFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Payroll Element</DialogTitle>
                        <DialogDescription>Define the core properties and processing rules for a new earning or deduction.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Element Name</Label>
                                <Input placeholder="e.g., Performance Bonus" />
                            </div>
                            <div className="space-y-2">
                                <Label>Reporting Name</Label>
                                <Input placeholder="e.g., Bonus" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Primary Classification</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="std_earn">Standard Earnings</SelectItem>
                                        <SelectItem value="sup_earn">Supplemental Earnings</SelectItem>
                                        <SelectItem value="pre_ded">Pre-Tax Deductions</SelectItem>
                                        <SelectItem value="vol_ded">Voluntary Deductions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Processing Type</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recurring">Recurring (Every Period)</SelectItem>
                                        <SelectItem value="non_recurring">Non-Recurring (One-Time)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold text-sm">Input Values</h4>
                            <div className="p-4 bg-muted/40 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Pay Value</span>
                                    <Badge variant="outline">Default</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">The calculated monetary amount passed to the payroll run result.</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full border-dashed"><Plus className="w-4 h-4 mr-2" /> Add Input Value (e.g., Percentage, Flat Amount)</Button>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Process in Run</Label>
                                    <p className="text-xs text-muted-foreground">Include this element in regular payroll runs.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Multiple Entries Allowed</Label>
                                    <p className="text-xs text-muted-foreground">Can the employee have multiple instances of this element in a single period?</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button variant="ghost" onClick={() => setIsElementFormOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700"><Save className="w-4 h-4 mr-2" /> Save Element Definition</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Element Links Simulator */}
            <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Element Eligibility</DialogTitle>
                        <DialogDescription>Define who is allowed to receive this element.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">In an enterprise system, elements are rarely open to everyone. You restrict them by linking them to specific organizational attributes.</p>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label>Restrict by Legal Entity</Label>
                                <Select><SelectTrigger><SelectValue placeholder="No Restriction (Open)" /></SelectTrigger><SelectContent><SelectItem value="nexus_us">Nexus USA Corp</SelectItem><SelectItem value="nexus_uk">Nexus UK Ltd</SelectItem></SelectContent></Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Restrict by Job</Label>
                                <Select><SelectTrigger><SelectValue placeholder="No Restriction (Open)" /></SelectTrigger><SelectContent><SelectItem value="exec">Executive Management</SelectItem></SelectContent></Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Restrict by Department</Label>
                                <Select><SelectTrigger><SelectValue placeholder="No Restriction (Open)" /></SelectTrigger><SelectContent><SelectItem value="sales">Sales</SelectItem></SelectContent></Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700">Save Eligibility Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
