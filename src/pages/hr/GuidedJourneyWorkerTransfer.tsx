import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
    MapPin,
    Briefcase,
    DollarSign,
    Users,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Search,
    UserCircle,
    Building2,
    Calendar,
    AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber } from '@/lib/formatters';

export default function GuidedJourneyWorkerTransfer() {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);

    // Transfer Context State
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferReason, setTransferReason] = useState("");

    // Step 1: Assignment State
    const [newDepartment, setNewDepartment] = useState("");
    const [newManager, setNewManager] = useState("");
    const [newLocation, setNewLocation] = useState("");

    // Step 2: Compensation State
    const [newSalary, setNewSalary] = useState("125000");
    const [salaryBasis, setSalaryBasis] = useState("ANNUAL");

    const totalSteps = 4;

    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        toast({
            title: "Transfer Submitted",
            description: "The worker transfer request has been routed for approval.",
        });
        setCurrentStep(1); // Reset for demo
    };

    const renderStepIndicator = () => {
        const steps = [
            { num: 1, label: "Assignment Details", icon: Briefcase },
            { num: 2, label: "Compensation Setup", icon: DollarSign },
            { num: 3, label: "Review & Submit", icon: CheckCircle2 }
        ];

        return (
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.num}>
                        <div className="flex flex-col items-center">
                            <div className={cn(`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step.num ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-300 text-zinc-400'}`)}>
                                <step.icon className="h-4 w-4" />
                            </div>
                            <span className={cn(`text-xs font-medium mt-2 ${currentStep >= step.num ? 'text-indigo-900 dark:text-indigo-100' : 'text-muted-foreground'}`)}>
                                {step.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={cn(`w-16 md:w-32 h-1 mb-6 rounded-full mx-2 ${currentStep > step.num ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'}`)} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <StandardPage
            title="Local & Global Transfer"
            description="Guided journey for transferring an employee across departments, legal employers, or geographies."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Directory', href: '/hr/employees' },
                { label: 'Worker Transfer' }
            ]}
        >
            <div className="max-w-4xl mx-auto pb-12">

                {/* Context Header */}
                <Card className="mb-8 border-indigo-100 dark:border-indigo-900/50 shadow-sm bg-indigo-500/10 dark:bg-indigo-900/10">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="space-y-4 flex-1 w-full">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Select Worker</Label>
                                    <div className="flex gap-2 mt-1">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name or ID..."
                                                className="pl-9 bg-white dark:bg-zinc-950"
                                                value={selectedEmployee}
                                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                            />
                                        </div>
                                        {selectedEmployee && (
                                            <Button variant="outline" className="shrink-0 bg-white dark:bg-zinc-950">
                                                <UserCircle className="h-4 w-4 mr-2" /> View Profile
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="flex-1 md:w-40">
                                    <Label className="text-xs text-muted-foreground">Effective Date</Label>
                                    <div className="relative mt-1">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <DatePicker className="pl-9 bg-white dark:bg-zinc-950" value={effectiveDate} onChange={v => setEffectiveDate(v)} />
                                    </div>
                                </div>
                                <div className="flex-1 md:w-48">
                                    <Label className="text-xs text-muted-foreground">Action Reason</Label>
                                    <Select value={transferReason} onValueChange={setTransferReason}>
                                        <SelectTrigger className="mt-1 bg-white dark:bg-zinc-950">
                                            <SelectValue placeholder="Select Reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="REORG">Reorganization</SelectItem>
                                            <SelectItem value="PROMO">Promotion / Transfer</SelectItem>
                                            <SelectItem value="RELOC">Relocation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {renderStepIndicator()}

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">

                    {/* Step 1: Assignment */}
                    {currentStep === 1 && (
                        <>
                            <div className="bg-zinc-500/10 dark:bg-white/5 border-b p-4 px-6">
                                <div className="flex gap-2 items-center">
                                    <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="font-semibold text-lg">Assignment Details</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Update the worker's organizational placement.</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <Alert className="bg-amber-500/10 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <AlertTitle>Current Assignment</AlertTitle>
                                    <AlertDescription className="text-sm mt-1">
                                        Currently assigned to <strong>Engineering Dept</strong> reporting to <strong>Sarah Jenkins</strong> at <strong>San Francisco HQ</strong>.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>New Department</Label>
                                        <Select value={newDepartment} onValueChange={setNewDepartment}>
                                            <SelectTrigger><SelectValue placeholder="Search departments..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ENG_EU">Engineering (EU)</SelectItem>
                                                <SelectItem value="PROD">Product Management</SelectItem>
                                                <SelectItem value="SALES">Enterprise Sales</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Manager (Line Manager)</Label>
                                        <Select value={newManager} onValueChange={setNewManager}>
                                            <SelectTrigger><SelectValue placeholder="Search colleagues..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MGR1">Marcus Torres (VP Engineering)</SelectItem>
                                                <SelectItem value="MGR2">Elena Rostova (Director)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Location</Label>
                                        <Select value={newLocation} onValueChange={setNewLocation}>
                                            <SelectTrigger><SelectValue placeholder="Select location..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LON">London, UK</SelectItem>
                                                <SelectItem value="BER">Berlin, Germany</SelectItem>
                                                <SelectItem value="REMOTE">Remote Worker</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Working Hours</Label>
                                        <div className="flex gap-2">
                                            <Input type="number" defaultValue="40" className="w-24" />
                                            <Select defaultValue="WEEKLY">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WEEKLY">Hours/Week</SelectItem>
                                                    <SelectItem value="MONTHLY">Hours/Month</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Step 2: Compensation */}
                    {currentStep === 2 && (
                        <>
                            <div className="bg-zinc-500/10 dark:bg-white/5 border-b p-4 px-6">
                                <div className="flex gap-2 items-center">
                                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <h3 className="font-semibold text-lg">Compensation Setup</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Adjust base salary and allowances based on new role.</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex gap-4 p-4 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Salary</p>
                                        <p className="text-2xl font-bold mt-1">$115,000 <span className="text-sm font-normal text-muted-foreground">/ Annual</span></p>
                                    </div>
                                    <div className="flex-1 border-l pl-4 border-emerald-200 dark:border-emerald-800">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">New Proposed Salary</p>
                                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">${formatNumber(parseInt(newSalary))} <span className="text-sm font-normal text-muted-foreground">/ {salaryBasis}</span></p>
                                        <p className="text-xs text-emerald-600 mt-1 font-medium">+8.6% Increase</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label>Salary Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 font-medium text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                className="pl-8"
                                                value={newSalary}
                                                onChange={(e) => setNewSalary(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salary Basis</Label>
                                        <Select value={salaryBasis} onValueChange={setSalaryBasis}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ANNUAL">Annual Salary</SelectItem>
                                                <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="text-base font-semibold">Individual Allowances</Label>
                                    <div className="flex items-center justify-between p-3 border rounded-md">
                                        <div>
                                            <p className="font-medium">Car Allowance</p>
                                            <p className="text-xs text-muted-foreground">Monthly stipend for vehicle</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" defaultValue="500" className="w-24 h-8" />
                                            <span className="text-sm text-muted-foreground">/ mo</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <>
                            <div className="bg-zinc-500/10 dark:bg-white/5 border-b p-4 px-6">
                                <div className="flex gap-2 items-center">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="font-semibold text-lg">Review & Submit</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Verify changes before final submission.</p>
                            </div>
                            <CardContent className="p-6 space-y-6">

                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="col-span-2">
                                        <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Transaction Context</h4>
                                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Effective Date</p>
                                                <p className="font-medium mt-1">{effectiveDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Action Reason</p>
                                                <p className="font-medium mt-1">{transferReason || 'Not Specified'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1 space-y-4">
                                        <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2 border-b pb-2"><Briefcase className="h-4 w-4" /> Assignment Changes</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Department</span>
                                                <span className="text-sm font-medium">{newDepartment || 'Unchanged'} <StatusBadge status="warning" label="Changed" className="ml-2 text-[10px] pb-0" /></span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Manager</span>
                                                <span className="text-sm font-medium">{newManager || 'Unchanged'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Location</span>
                                                <span className="text-sm font-medium">{newLocation || 'Unchanged'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1 space-y-4">
                                        <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b pb-2"><DollarSign className="h-4 w-4" /> Compensation Changes</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Base Salary</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium block">${formatNumber(parseInt(newSalary))} / {salaryBasis}</span>
                                                    <span className="text-[10px] text-emerald-600 font-medium">Was: $115,000</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Car Allowance</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium block">$500 / mo</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium">Was: $500</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2 mt-4">
                                        <Label>Approver Comments (Optional)</Label>
                                        <Textarea placeholder="Add notes for the HR validation team..." className="h-24 resize-none" />
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    <CardFooter className="px-6 py-4 border-t bg-slate-500/10 dark:bg-zinc-900/50 flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>

                        <div className="flex gap-2 text-sm text-muted-foreground font-medium">
                            Step {currentStep} of {totalSteps - 1}
                        </div>

                        {currentStep < 3 ? (
                            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleNext}>
                                Next <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                                Submit Transfer <CheckCircle2 className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>

            </div>
        </StandardPage>
    );
}
