import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { CompanyProfileStep } from "./steps/CompanyProfileStep";
import { IndustrySelectionStep } from "./steps/IndustrySelectionStep";
import { ModuleSelectionStep } from "./steps/ModuleSelectionStep";
import { ProvisioningStep } from "./steps/ProvisioningStep";

export interface OnboardingData {
    tenantId?: string;
    companyProfile?: {
        name: string;
        size: string;
        timezone: string;
        currency: string;
    };
    industryId?: string;
    selectedModuleIds?: string[];
}

const STEPS = [
    { id: 1, name: "Company Profile", description: "Tell us about your organization" },
    { id: 2, name: "Industry", description: "Select your industry vertical" },
    { id: 3, name: "Modules", description: "Choose your modules" },
    { id: 4, name: "Setup", description: "Finalize your workspace" },
];

export default function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();

    const progress = (currentStep / STEPS.length) * 100;

    const updateOnboardingData = (data: Partial<OnboardingData>) => {
        setOnboardingData((prev) => ({ ...prev, ...data }));
    };

    const goToNextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CompanyProfileStep
                        data={onboardingData}
                        onNext={(data) => {
                            updateOnboardingData(data);
                            goToNextStep();
                        }}
                        onBack={goToPreviousStep}
                    />
                );
            case 2:
                return (
                    <IndustrySelectionStep
                        data={onboardingData}
                        onNext={(data) => {
                            updateOnboardingData(data);
                            goToNextStep();
                        }}
                        onBack={goToPreviousStep}
                    />
                );
            case 3:
                return (
                    <ModuleSelectionStep
                        data={onboardingData}
                        onNext={(data) => {
                            updateOnboardingData(data);
                            goToNextStep();
                        }}
                        onBack={goToPreviousStep}
                    />
                );
            case 4:
                return (
                    <ProvisioningStep
                        data={onboardingData}
                        onComplete={() => {
                            // Redirect to dashboard or home
                            setLocation("/dashboard");
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Welcome to NexusAI ERP</h1>
                    <p className="text-muted-foreground">
                        Let's set up your workspace in just a few steps
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Step {currentStep} of {STEPS.length}</span>
                        <span className="font-medium">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Step Indicators */}
                <div className="grid grid-cols-4 gap-2">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={cn(`flex items-center gap-2 p-3 rounded-lg border ${step.id === currentStep
                                ? "bg-primary/10 border-primary"
                                : step.id < currentStep
                                    ? "bg-green-500/10 border-green-200"
                                    : "bg-white border-gray-200"
                                }`)}
                        >
                            <div
                                className={cn(`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.id === currentStep
                                    ? "bg-primary text-primary-foreground"
                                    : step.id < currentStep
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`)}
                            >
                                {step.id < currentStep ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-sm font-medium">{step.id}</span>
                                )}
                            </div>
                            <div className="hidden md:block flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{step.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
                        <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent>{renderStep()}</CardContent>
                </Card>

                {/* Footer Help Text */}
                <div className="text-center text-sm text-muted-foreground">
                    Need help? <Link to="/support" className="text-primary hover:underline">Contact Support</Link>
                </div>
            </div>
        </div>
    );
}
