import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Briefcase, Building2, DollarSign, CheckCircle, ChevronRight, ChevronLeft, User } from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Personal Information', icon: User, description: 'Name, date of birth, national ID, contact details' },
    { id: 2, title: 'Work Relationship', icon: Briefcase, description: 'Legal employer, worker type, start date' },
    { id: 3, title: 'Assignment', icon: Building2, description: 'Department, job, location, manager, grade' },
    { id: 4, title: 'Compensation', icon: DollarSign, description: 'Salary, payroll, pay frequency' },
    { id: 5, title: 'Review & Submit', icon: CheckCircle, description: 'Confirm all details before creating the record' },
];

export default function HireFlowWizard() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step < STEPS.length) setStep(step + 1);
    };
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };
    const handleSubmit = () => {
        toast({
            title: 'Person Record Created',
            description: 'Employee has been successfully hired and all records have been created.'
        });
        setStep(1);
    };

    return (
        <StandardPage
            title="New Hire Flow — Person Wizard"
            description="Oracle-style guided transaction to create Person → Work Relationship → Assignment → Pay in a validated multi-step flow."
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Step Nav */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Hire Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {STEPS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${step === s.id
                                        ? 'bg-primary text-primary-foreground'
                                        : step > s.id
                                            ? 'bg-muted/60 text-muted-foreground'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                            >
                                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${step > s.id ? 'border-transparent bg-green-500 text-white' :
                                        step === s.id ? 'border-primary-foreground/40' :
                                            'border-muted-foreground/30'
                                    }`}>
                                    {step > s.id ? '✓' : s.id}
                                </span>
                                <div>
                                    <div className="text-sm font-medium leading-none">{s.title}</div>
                                    <div className={`text-xs mt-1 ${step === s.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{s.description}</div>
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Step Content */}
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {React.createElement(STEPS[step - 1].icon, { className: 'h-5 w-5 text-primary' })}
                                    <div>
                                        <CardTitle>Step {step}: {STEPS[step - 1].title}</CardTitle>
                                        <CardDescription>{STEPS[step - 1].description}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline">{step} / {STEPS.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>First Name *</Label><Input placeholder="e.g. John" /></div>
                                    <div className="space-y-2"><Label>Last Name *</Label><Input placeholder="e.g. Smith" /></div>
                                    <div className="space-y-2"><Label>Middle Name</Label><Input placeholder="Optional" /></div>
                                    <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" /></div>
                                    <div className="space-y-2">
                                        <Label>National Identifier (SSN / NIN)</Label>
                                        <Input placeholder="XXX-XX-XXXX" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Male</SelectItem>
                                                <SelectItem value="F">Female</SelectItem>
                                                <SelectItem value="NB">Non-Binary</SelectItem>
                                                <SelectItem value="U">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2"><Label>Work Email *</Label><Input type="email" placeholder="john.smith@company.com" /></div>
                                    <div className="space-y-2 col-span-2"><Label>Phone</Label><Input type="tel" placeholder="+1 (555) 000-0000" /></div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Legal Employer *</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Legal Employer..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="us-corp">NexusAI Corp (US)</SelectItem>
                                                <SelectItem value="uk-ltd">NexusAI Ltd (UK)</SelectItem>
                                                <SelectItem value="ae-llc">NexusAI LLC (UAE)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Worker Type *</Label>
                                        <Select defaultValue="EMPLOYEE">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                                <SelectItem value="CONTINGENT">Contingent Worker</SelectItem>
                                                <SelectItem value="PENDING">Pending Worker</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hire Date *</Label>
                                        <Input type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Probation End Date</Label>
                                        <Input type="date" />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Reason for Hire</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New Position</SelectItem>
                                                <SelectItem value="backfill">Backfill</SelectItem>
                                                <SelectItem value="rehire">Rehire</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Business Unit *</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Business Unit..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tech">Technology</SelectItem>
                                                <SelectItem value="ops">Operations</SelectItem>
                                                <SelectItem value="fin">Finance</SelectItem>
                                                <SelectItem value="hr">HR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department *</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Department..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="eng">Engineering</SelectItem>
                                                <SelectItem value="product">Product</SelectItem>
                                                <SelectItem value="sales">Sales</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job *</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Job..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="swe2">Software Engineer II</SelectItem>
                                                <SelectItem value="srm">Senior Manager</SelectItem>
                                                <SelectItem value="pm">Product Manager</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grade / Band</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Grade..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ic3">IC-3 (Mid)</SelectItem>
                                                <SelectItem value="ic4">IC-4 (Senior)</SelectItem>
                                                <SelectItem value="m1">M-1 (Manager)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Work Location *</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Location..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hq">HQ — Dubai</SelectItem>
                                                <SelectItem value="london">London Office</SelectItem>
                                                <SelectItem value="remote">Remote</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Direct Manager</Label>
                                        <Input placeholder="Search by name or person number..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assignment Category</Label>
                                        <Select defaultValue="FULL_TIME">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                                                <SelectItem value="PART_TIME">Part-Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>FTE</Label>
                                        <Input type="number" defaultValue="1.0" min="0.1" max="1.0" step="0.1" />
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Payroll Definition *</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Payroll..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="us-monthly">US Monthly</SelectItem>
                                                <SelectItem value="us-biweekly">US Bi-Weekly</SelectItem>
                                                <SelectItem value="uk-monthly">UK Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salary Basis</Label>
                                        <Select defaultValue="ANNUAL">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ANNUAL">Annual Salary</SelectItem>
                                                <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salary Amount</Label>
                                        <Input type="number" placeholder="120000" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Select defaultValue="USD">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="AED">AED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Bank Account (for Direct Deposit)</Label>
                                        <Input placeholder="Account number — encrypted at rest" type="password" />
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal</h3>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">John Smith</span></div>
                                            <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">Jan 01, 1990</span></div>
                                            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">john.smith@company.com</span></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Work Relationship</h3>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="text-muted-foreground">Employer:</span> <span className="font-medium">NexusAI Corp (US)</span></div>
                                            <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">Employee</span></div>
                                            <div><span className="text-muted-foreground">Hire Date:</span> <span className="font-medium">Apr 01, 2026</span></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Assignment</h3>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="text-muted-foreground">Dept:</span> <span className="font-medium">Engineering</span></div>
                                            <div><span className="text-muted-foreground">Job:</span> <span className="font-medium">Software Engineer II</span></div>
                                            <div><span className="text-muted-foreground">Grade:</span> <span className="font-medium">IC-3</span></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Compensation</h3>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="text-muted-foreground">Payroll:</span> <span className="font-medium">US Monthly</span></div>
                                            <div><span className="text-muted-foreground">Salary:</span> <span className="font-medium">$120,000 / yr</span></div>
                                            <div><span className="text-muted-foreground">Currency:</span> <span className="font-medium">USD</span></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                        <p className="text-sm text-primary font-medium flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" /> All required fields are complete. Click Submit to create the employee record.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back
                        </Button>
                        {step < STEPS.length ? (
                            <Button onClick={handleNext}>
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit}>
                                <UserPlus className="mr-2 h-4 w-4" /> Submit &amp; Create Person
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
