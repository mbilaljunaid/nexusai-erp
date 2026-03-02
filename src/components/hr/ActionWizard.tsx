import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, Save } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export type WizardStep = {
    id: string;
    title: string;
    description: string;
    isCompleted?: boolean;
};

export interface ActionWizardProps {
    isOpen: boolean;
    onClose: () => void;
    actionType: "TRANSFER" | "PROMOTE" | "TERMINATE" | "SALARY_CHANGE" | null;
    employeeName?: string;
    onComplete?: (data: any) => void;
}

export default function ActionWizard({ isOpen, onClose, actionType, employeeName = "Employee", onComplete }: ActionWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [date, setDate] = useState<Date>(new Date());

    // Form State
    const [actionReason, setActionReason] = useState("");
    const [notes, setNotes] = useState("");

    // Mock Data for Steps based on action type
    const getSteps = (): WizardStep[] => {
        const baseSteps = [
            { id: "when-why", title: "When and Why", description: "Effective date and reason" }
        ];

        switch (actionType) {
            case "TRANSFER":
                return [
                    ...baseSteps,
                    { id: "assignment", title: "Assignment Details", description: "New department or location" },
                    { id: "manager", title: "Manager", description: "Reporting structure" },
                    { id: "review", title: "Review", description: "Verify changes" }
                ];
            case "PROMOTE":
                return [
                    ...baseSteps,
                    { id: "job", title: "Job Details", description: "New grade and title" },
                    { id: "compensation", title: "Compensation", description: "Salary adjustment" },
                    { id: "review", title: "Review", description: "Verify changes" }
                ];
            case "TERMINATE":
                return [
                    ...baseSteps,
                    { id: "details", title: "Termination Details", description: "Offboarding info" },
                    { id: "review", title: "Review", description: "Verify and submit" }
                ];
            case "SALARY_CHANGE":
                return [
                    ...baseSteps,
                    { id: "compensation", title: "Compensation", description: "New salary details" },
                    { id: "review", title: "Review", description: "Verify changes" }
                ];
            default:
                return [...baseSteps, { id: "review", title: "Review", description: "Verify changes" }];
        }
    };

    const steps = getSteps();
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Submit
            if (onComplete) {
                onComplete({ actionType, date, actionReason, notes });
            }
            onClose();
            // Reset for next time
            setTimeout(() => setCurrentStep(0), 300);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!actionType) return null;

    const actionTitles: Record<string, string> = {
        "TRANSFER": "Transfer Worker",
        "PROMOTE": "Promote Worker",
        "TERMINATE": "Terminate Worker",
        "SALARY_CHANGE": "Change Salary"
    };

    const actionReasons: Record<string, string[]> = {
        "TRANSFER": ["Reorganization", "Internal Mobility", "Relocation", "Performance"],
        "PROMOTE": ["Outstanding Performance", "Role Expansion", "Annual Cycle", "Retention"],
        "TERMINATE": ["Voluntary - Better Opportunity", "Voluntary - Relocation", "Involuntary - Performance", "Involuntary - Restructuring"],
        "SALARY_CHANGE": ["Market Adjustment", "Merit Increase", "Promotion", "Equity Review"]
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 bg-background flex flex-col h-[80vh] md:h-[700px]">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        {actionTitles[actionType]} <span className="text-muted-foreground font-normal text-lg">for {employeeName}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Follow the guided journey to complete this transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Stepper */}
                    <div className="w-64 border-r bg-muted/10 p-6 hidden md:block overflow-y-auto">
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isPast = index < currentStep;

                                return (
                                    <div key={step.id} className="relative flex items-center gap-3">
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background z-10 shrink-0 shadow-sm transition-colors",
                                            isActive ? "border-primary text-primary" :
                                                isPast ? "border-primary bg-primary text-primary-foreground" :
                                                    "border-muted-foreground/30 text-muted-foreground font-medium"
                                        )}>
                                            {isPast ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-medium border-b pb-2">{steps[currentStep].title}</h3>

                                {/* Step 1: When and Why (Universal first step) */}
                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">When does this action take effect?</Label>
                                            <p className="text-xs text-muted-foreground">This is the DateTrack effective start date.</p>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={(d) => d && setDate(d)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Why are you taking this action?</Label>
                                            <p className="text-xs text-muted-foreground">Select the business reason for this transaction.</p>
                                            <Select value={actionReason} onValueChange={setActionReason}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an Action Reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {actionReasons[actionType].map(reason => (
                                                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Additional Comments</Label>
                                            <Textarea
                                                placeholder="Provide any additional context or justification for this action..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Placeholder content for intermediate steps to simulate the journey */}
                                {currentStep > 0 && !isLastStep && (
                                    <div className="space-y-6">
                                        <div className="p-6 border rounded-lg bg-card text-center text-muted-foreground shadow-sm">
                                            <p>This section would contain the specific fields for <strong>{steps[currentStep].title}</strong>.</p>
                                            <p className="mt-2 text-sm">For example, selecting a new department, assigning a new manager, or entering new compensation figures.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Simulated Input</Label>
                                            <Input disabled placeholder="Data entry simulated..." />
                                        </div>
                                    </div>
                                )}

                                {/* Review Step (Universal last step) */}
                                {isLastStep && (
                                    <div className="space-y-6">
                                        <div className="bg-primary/5 rounded-lg p-5 border border-primary/10">
                                            <h4 className="font-semibold mb-4 text-primary">Transaction Summary</h4>
                                            <dl className="space-y-3 text-sm">
                                                <div className="grid grid-cols-3 gap-4 border-b border-primary/10 pb-3">
                                                    <dt className="text-muted-foreground">Action</dt>
                                                    <dd className="col-span-2 font-medium">{actionTitles[actionType]}</dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 border-b border-primary/10 pb-3">
                                                    <dt className="text-muted-foreground">Effective Date</dt>
                                                    <dd className="col-span-2 font-medium">{format(date, "PPP")}</dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 border-b border-primary/10 pb-3">
                                                    <dt className="text-muted-foreground">Action Reason</dt>
                                                    <dd className="col-span-2 font-medium">{actionReason || "Not specified"}</dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <dt className="text-muted-foreground">Comments</dt>
                                                    <dd className="col-span-2 text-muted-foreground italic">{notes || "None provided"}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 rounded-lg">
                                            <div className="p-2 bg-amber-500/20 rounded-full shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                            </div>
                                            <p className="text-sm">Submitting this transaction will trigger an approval workflow to HR and the required management chain based on the Action Reason.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <DialogFooter className="p-6 border-t bg-muted/20 sm:justify-between items-center flex-row">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={isFirstStep}
                                className="w-[100px]"
                            >
                                Back
                            </Button>

                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button
                                    onClick={handleNext}
                                    className={cn("w-[140px]", isLastStep && "bg-green-600 hover:bg-green-700 text-white")}
                                    disabled={currentStep === 0 && !actionReason}
                                >
                                    {isLastStep ? (
                                        <><Save className="w-4 h-4 mr-2" /> Submit</>
                                    ) : (
                                        <>Next Context <ChevronRight className="w-4 h-4 ml-1" /></>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
