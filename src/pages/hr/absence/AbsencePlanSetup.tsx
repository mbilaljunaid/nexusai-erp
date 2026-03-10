import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Calendar, Clock, Settings, ListTree, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { FileText, CheckCircle, Layers } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AbsencePlanSetup() {
    const [selectedPlanType, setSelectedPlanType] = useState("ACCRUAL");
    const [activeTab, setActiveTab] = useState("GENERAL");

    const renderContent = () => {
        if (activeTab === "CONCURRENT") {
            return (
                <div className="space-y-6">
                    <Card className="border-blue-500/20 shadow-sm">
                        <CardHeader className="border-b bg-blue-500/100/5 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-background border-blue-500/30 text-blue-700">Concurrent Absences</Badge>
                                    <CardTitle>Overlapping Plan Rules</CardTitle>
                                    <CardDescription>Determine what happens when an employee applies for this absence alongside another active absence (e.g., FMLA + Sick).</CardDescription>
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Add Concurrent Plan</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            <div className="space-y-4">
                                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-4">
                                    <Switch defaultChecked id="conc-1" />
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="conc-1" className="text-base font-semibold">Allow Concurrent Booking</Label>
                                        <p className="text-sm text-muted-foreground">Permit this absence to run alongside specifically authorized secondary plan types.</p>
                                    </div>
                                    <Badge variant="secondary">Active</Badge>
                                </div>

                                <div className="space-y-3 pl-14 pr-4">
                                    <h4 className="font-semibold text-sm">Authorized Overlapping Plans</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border text-sm">
                                            <Switch defaultChecked id="conc-fmla" />
                                            <Label htmlFor="conc-fmla" className="font-medium cursor-pointer">US FMLA (Unpaid)</Label>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border text-sm">
                                            <Switch defaultChecked id="conc-std" />
                                            <Label htmlFor="conc-std" className="font-medium cursor-pointer">Short Term Disability</Label>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border text-sm">
                                            <Switch id="conc-pto" />
                                            <Label htmlFor="conc-pto" className="font-medium cursor-pointer text-muted-foreground">Standard PTO</Label>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                        <h4 className="font-semibold text-amber-900 dark:text-amber-400 text-sm mb-1">Deduction Hierarchy</h4>
                                        <p className="text-xs text-amber-800 dark:text-amber-500 mb-3">When overlapping occurs, choose which plan balance draws down first.</p>
                                        <Select defaultValue="PRIMARY_FIRST">
                                            <SelectTrigger className="bg-card dark:bg-zinc-950 border-amber-500/30">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PRIMARY_FIRST">Draw from Primary Plan First</SelectItem>
                                                <SelectItem value="SECONDARY_FIRST">Draw from Secondary Plan First</SelectItem>
                                                <SelectItem value="BOTH_SIMULTANEOUS">Deduct from Both (Double Dip)</SelectItem>
                                                <SelectItem value="UNPAID_ONLY">Primary Unpaid, Secondary Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                            </div>

                        </CardContent>
                    </Card>
                </div>
            )
        }

        if (activeTab === "CERTIFICATION") {
            return (
                <div className="space-y-6">
                    <Card className="border-purple-500/20 shadow-sm">
                        <CardHeader className="border-b bg-purple-500/100/5 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-background border-purple-500/30 text-purple-700">Certification Rules</Badge>
                                    <CardTitle>Medical & Documentation Requirements</CardTitle>
                                    <CardDescription>Configure when employees must provide proof for this absence type.</CardDescription>
                                </div>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" /> Add Rule</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            <div className="space-y-4">
                                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-4">
                                    <Switch defaultChecked id="req-1" />
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="req-1" className="text-base font-semibold">Consecutive Days Threshold</Label>
                                        <p className="text-sm text-muted-foreground">Require a doctor's note if the absence exceeds a certain number of continuous days.</p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <span className="text-sm">Require after</span>
                                            <Input type="number" defaultValue={3} className="w-20 h-8" />
                                            <span className="text-sm">consecutive days</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Active</Badge>
                                </div>

                                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-4">
                                    <Switch id="req-2" />
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="req-2" className="text-base font-semibold">Return to Work Clearance</Label>
                                        <p className="text-sm text-muted-foreground">Require medical clearance before the employee can resume duties.</p>
                                    </div>
                                    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                                </div>

                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm">Review Workflow</h4>
                                <div className="flex items-center gap-4">
                                    <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <div className="p-2 bg-muted rounded border text-sm font-medium">HR Benefits Team</div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Certifications will be routed to the HR Benefits Team for manual review and approval.</p>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            )
        }

        // Default to General/Accrual Matrix view
        return (
            <div className="space-y-6">
                <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="outline" className="mb-2 bg-background">Annual Vacation Plan</Badge>
                                <CardTitle>Plan Formulation</CardTitle>
                                <CardDescription>Configure how this time off is earned.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Plan Type</Label>
                                <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACCRUAL">Accrual (Earned Time)</SelectItem>
                                        <SelectItem value="QUALIFICATION">Qualification (e.g., Maternity)</SelectItem>
                                        <SelectItem value="NO_ENTITLEMENT">No Entitlement (e.g., Unpaid)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>UOM (Unit of Measure)</Label>
                                <Select defaultValue="HOURS">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HOURS">Hours</SelectItem>
                                        <SelectItem value="DAYS">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Accrual Term (Plan Year)</Label>
                                <Select defaultValue="ANNIV">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CALENDAR">Calendar Year (Jan 1 - Dec 31)</SelectItem>
                                        <SelectItem value="ANNIV">Anniversary Year (Hire Date)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Frequency of Accrual</Label>
                                <Select defaultValue="PAY_PERIOD">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PAY_PERIOD">Every Pay Period</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="ANNUAL">Front-loaded (Annually)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Accrual Bands Matrix Generator */}
                <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-primary flex items-center gap-2">
                                    <Calendar className="w-5 h-5" /> Accrual Matrix (Bands)
                                </CardTitle>
                                <CardDescription>Define accrual rates based on Length of Service (LOS).</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="bg-background"><Plus className="w-4 h-4 mr-2" /> Add Band</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="min-w-full divide-y divide-border">
                            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                                <div className="col-span-3">Length of Service (Years)</div>
                                <div className="col-span-3">Annual Accrual Amount</div>
                                <div className="col-span-3">Maximum Balance (Ceiling)</div>
                                <div className="col-span-2">Carryover Limit</div>
                                <div className="col-span-1 text-right"></div>
                            </div>

                            {/* Band 1 */}
                            <div className="grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/10">
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input defaultValue="0" className="w-16 h-8 text-center" />
                                    <span className="text-muted-foreground text-sm">to</span>
                                    <Input defaultValue="4" className="w-16 h-8 text-center" />
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <Input defaultValue="120" className="h-8 pl-8" />
                                        <span className="absolute left-3 top-2 text-xs text-muted-foreground">Hrs</span>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <Input defaultValue="240" className="h-8 pl-8" />
                                        <span className="absolute left-3 top-2 text-xs text-muted-foreground">Hrs</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Input defaultValue="40" className="h-8" />
                                </div>
                                <div className="col-span-1 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Remove"><span className="sr-only">Remove</span>&times;</Button>
                                </div>
                            </div>

                            {/* Band 2 */}
                            <div className="grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/10 bg-primary/5">
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input defaultValue="5" className="w-16 h-8 text-center border-primary/30 focus-visible:ring-primary/50" />
                                    <span className="text-muted-foreground text-sm">to</span>
                                    <Input defaultValue="9" className="w-16 h-8 text-center border-primary/30 focus-visible:ring-primary/50" />
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <Input defaultValue="160" className="h-8 pl-8 border-primary/30 focus-visible:ring-primary/50" />
                                        <span className="absolute left-3 top-2 text-xs text-primary/70">Hrs</span>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <Input defaultValue="320" className="h-8 pl-8 border-primary/30 focus-visible:ring-primary/50" />
                                        <span className="absolute left-3 top-2 text-xs text-primary/70">Hrs</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Input defaultValue="80" className="h-8 border-primary/30 focus-visible:ring-primary/50" />
                                </div>
                                <div className="col-span-1 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Remove"><span className="sr-only">Remove</span>&times;</Button>
                                </div>
                            </div>

                            {/* Band 3 */}
                            <div className="grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/10">
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input defaultValue="10" className="w-16 h-8 text-center" />
                                    <span className="text-muted-foreground text-sm">to</span>
                                    <Input defaultValue="99" className="w-16 h-8 text-center" />
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <Input defaultValue="200" className="h-8 pl-8" />
                                        <span className="absolute left-3 top-2 text-xs text-muted-foreground">Hrs</span>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <Input defaultValue="400" className="h-8 pl-8" />
                                        <span className="absolute left-3 top-2 text-xs text-muted-foreground">Hrs</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Input defaultValue="120" className="h-8" />
                                </div>
                                <div className="col-span-1 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Remove"><span className="sr-only">Remove</span>&times;</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardContent className="bg-muted/20 border-t p-4 flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Accrual calculation formulas map dynamically based on worker FTE and assignment effective date.</span>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs">Prorate partial periods?</Label>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <StandardPage
            title="Absence Plan Setup"
            description="Define complex accrual matrices, balances, and carry-over rules."
            actions={
                <div className="flex gap-3">
                    <Button variant="outline" className="border-teal-500/20 text-teal-600 hover:bg-teal-500/5">
                        <ListTree className="h-4 w-4 mr-2" /> Plan Hierarchy
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Save className="h-4 w-4 mr-2" /> Save Active Version
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar: Plan Settings Navigation */}
                <div className="col-span-12 md:col-span-3 space-y-2">
                    <Card>
                        <CardContent className="p-2 space-y-1">
                            <Button
                                variant={activeTab === 'GENERAL' ? 'secondary' : 'ghost'}
                                className={cn(`w-full justify-start ${activeTab === 'GENERAL' ? 'font-medium bg-muted' : 'font-normal text-muted-foreground'}`)}
                                onClick={() => setActiveTab('GENERAL')}
                            >
                                <span className="p-1.5 rounded-md bg-background mr-2"><Clock className="w-4 h-4 text-primary" /></span>
                                General Attributes
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground disabled opacity-50">
                                <span className="p-1.5 rounded-md bg-transparent mr-2"><ShieldCheck className="w-4 h-4" /></span>
                                Participation (Eligibility)
                            </Button>
                            <Button
                                variant={activeTab === 'CERTIFICATION' ? 'secondary' : 'ghost'}
                                className={cn(`w-full justify-start ${activeTab === 'CERTIFICATION' ? 'font-medium bg-muted text-foreground' : 'font-normal text-muted-foreground'}`)}
                                onClick={() => setActiveTab('CERTIFICATION')}
                            >
                                <span className="p-1.5 rounded-md bg-transparent mr-2"><FileText className="w-4 h-4" /></span>
                                Certifications & Rules
                            </Button>
                            <Button
                                variant={activeTab === 'CONCURRENT' ? 'secondary' : 'ghost'}
                                className={cn(`w-full justify-start ${activeTab === 'CONCURRENT' ? 'font-medium bg-muted text-foreground' : 'font-normal text-muted-foreground'}`)}
                                onClick={() => setActiveTab('CONCURRENT')}
                            >
                                <span className="p-1.5 rounded-md bg-transparent mr-2"><Layers className="w-4 h-4" /></span>
                                Concurrent Absences
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground disabled opacity-50">
                                <span className="p-1.5 rounded-md bg-transparent mr-2"><Calendar className="w-4 h-4" /></span>
                                Accrual Matrix
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground disabled opacity-50">
                                <span className="p-1.5 rounded-md bg-transparent mr-2"><ArrowRight className="w-4 h-4" /></span>
                                Carry-Over Rules
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-500/100/10 border-amber-500/20">
                        <CardContent className="p-4 flex gap-3 text-amber-800 dark:text-amber-400 text-sm">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Changes saved here create a new <strong>Effective Date</strong> version. Existing balances will recalculate based on plan year settings.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Area: Form Content */}
                <div className="col-span-12 md:col-span-9 space-y-6">
                    {renderContent()}
                </div>
            </div>
        </StandardPage>
    );
}
