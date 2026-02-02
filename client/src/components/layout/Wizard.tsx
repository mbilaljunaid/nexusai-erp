import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

export interface WizardStep {
    id: string;
    label: string;
    component: React.ReactNode;
    validationFn?: () => boolean | Promise<boolean>;
}

export interface WizardProps {
    steps: WizardStep[];
    onComplete: () => void;
    title?: string;
    className?: string;
}

/**
 * Wizard
 * A standardized multi-step process component (Stepper).
 * Features:
 * - Linear navigation (Next/Back).
 * - Validation barriers between steps.
 * - Visual progress indicator.
 */
export function Wizard({ steps, onComplete, title, className }: WizardProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const isLastStep = currentStepIndex === steps.length - 1;
    const currentStep = steps[currentStepIndex];

    const handleNext = async () => {
        setIsLoading(true);
        try {
            if (currentStep.validationFn) {
                const isValid = await currentStep.validationFn();
                if (!isValid) {
                    setIsLoading(false);
                    return;
                }
            }

            if (isLastStep) {
                onComplete();
            } else {
                setCurrentStepIndex((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Wizard step validation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
        }
    };

    return (
        <div className={cn("flex flex-col space-y-6 h-full", className)}>
            {/* Header / Stepper UI */}
            <div className="border-b pb-6">
                {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
                <div className="flex items-center w-full justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex items-center relative">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                                            isCompleted ? "bg-primary text-primary-foreground" :
                                                isCurrent ? "bg-primary ring-4 ring-primary/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                                    </div>
                                    <span className={cn(
                                        "ml-3 text-sm font-medium hidden sm:block",
                                        isCurrent ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "h-[2px] w-full mx-4 transition-colors duration-300",
                                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-1 min-h-[400px]">
                {currentStep.component}
            </div>

            {/* Footer / Actions */}
            <div className="flex justify-between pt-6 border-t mt-auto">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0 || isLoading}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="min-w-[120px]"
                >
                    {isLoading ? "Validating..." : isLastStep ? "Finish" : (
                        <>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
