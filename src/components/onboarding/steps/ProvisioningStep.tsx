import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Sparkles, Package, Settings } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface ProvisioningStepProps {
    data: OnboardingData;
    onComplete: () => void;
}

type ProvisioningStatus = "initializing" | "modules" | "templates" | "complete";

export function ProvisioningStep({ data, onComplete }: ProvisioningStepProps) {
    const [status, setStatus] = useState<ProvisioningStatus>("initializing");
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("Initializing workspace...");

    useEffect(() => {
        provisionWorkspace();
    }, []);

    const provisionWorkspace = async () => {
        try {
            // Step 1: Initialize
            setStatus("initializing");
            setCurrentTask("Setting up your workspace...");
            setProgress(10);
            await delay(800);

            // Step 2: Enable modules
            setStatus("modules");
            setCurrentTask("Enabling selected modules...");
            setProgress(30);
            await delay(1200);

            setProgress(50);
            await delay(800);

            // Step 3: Apply templates
            setStatus("templates");
            setCurrentTask("Applying configuration templates...");
            setProgress(70);
            await delay(1000);

            setProgress(85);
            await delay(800);

            // Step 4: Complete
            setProgress(100);
            setCurrentTask("Finalizing setup...");
            await delay(500);

            setStatus("complete");
            setCurrentTask("Setup complete!");

            // Auto-redirect after 2 seconds
            setTimeout(() => {
                onComplete();
            }, 2000);
        } catch (error) {
            setCurrentTask("Setup failed. Please try again.");
        }
    };

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    return (
        <div className="space-y-8 py-8">
            {/* Icon */}
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    {status === "complete" ? (
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    ) : (
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    )}
                </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">{currentTask}</h3>
                {status !== "complete" && (
                    <p className="text-sm text-muted-foreground">
                        This will only take a moment...
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground">{progress}%</p>
            </div>

            {/* Status Steps */}
            <div className="space-y-3">
                <ProvisioningStepItem
                    icon={Settings}
                    label="Workspace initialization"
                    isComplete={status !== "initializing"}
                    isActive={status === "initializing"}
                />
                <ProvisioningStepItem
                    icon={Package}
                    label={`Enabling ${data.selectedModuleIds?.length || 0} modules`}
                    isComplete={status === "templates" || status === "complete"}
                    isActive={status === "modules"}
                />
                <ProvisioningStepItem
                    icon={Sparkles}
                    label="Applying industry templates"
                    isComplete={status === "complete"}
                    isActive={status === "templates"}
                />
            </div>

            {/* Success Message */}
            {status === "complete" && (
                <div className="text-center space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-200">
                        <p className="text-green-900 dark:text-green-200 font-medium">
                            🎉 Your workspace is ready!
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Redirecting to dashboard...
                        </p>
                    </div>
                    <Button onClick={onComplete} size="lg">
                        Go to Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
}

interface ProvisioningStepItemProps {
    icon: React.ElementType;
    label: string;
    isComplete: boolean;
    isActive: boolean;
}

function ProvisioningStepItem({ icon: Icon, label, isComplete, isActive }: ProvisioningStepItemProps) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={cn(`w-10 h-10 rounded-full flex items-center justify-center ${isComplete
                        ? "bg-green-100 text-green-600"
                        : isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-400"
                    }`)}
            >
                {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Icon className="w-5 h-5" />
                )}
            </div>
            <span
                className={cn(`text-sm ${isComplete
                        ? "text-green-600 font-medium"
                        : isActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                    }`)}
            >
                {label}
            </span>
        </div>
    );
}
