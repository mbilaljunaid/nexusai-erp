import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2, Star, AlertCircle } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface ModuleSelectionStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack: () => void;
}

interface Module {
    id: string;
    name: string;
    description: string;
    category: string;
    isRecommended?: boolean;
    isRequired?: boolean;
    priority?: number;
}

const MOCK_MODULES: Record<string, Module[]> = {
    healthcare: [
        { id: "1", name: "Core HR", description: "Employee & staff management", category: "HR", isRecommended: true, isRequired: true, priority: 100 },
        { id: "2", name: "Payroll", description: "Healthcare payroll processing", category: "HR", isRecommended: true, isRequired: true, priority: 90 },
        { id: "3", name: "Scheduling", description: "Patient appointments & staff scheduling", category: "Healthcare", isRecommended: true, priority: 80 },
        { id: "4", name: "Compliance", description: "HIPAA & regulatory compliance", category: "Governance", isRecommended: true, priority: 70 },
        { id: "5", name: "Billing", description: "Medical billing & insurance claims", category: "Finance", isRecommended: true, priority: 60 },
        { id: "6", name: "Clinical Docs", description: "EHR & clinical documentation", category: "Healthcare", isRecommended: true, priority: 50 },
        { id: "7", name: "Pharmacy", description: "Prescription management", category: "Healthcare", isRecommended: false, priority: 40 },
        { id: "8", name: "Inventory", description: "Medical supplies & equipment", category: "SCM", isRecommended: false, priority: 30 },
    ],
    retail: [
        { id: "9", name: "Inventory", description: "Stock & warehouse management", category: "SCM", isRecommended: true, isRequired: true, priority: 100 },
        { id: "10", name: "POS", description: "Point of sale system", category: "Operations", isRecommended: true, isRequired: true, priority: 90 },
        { id: "11", name: "CRM", description: "Customer relationship management", category: "Sales", isRecommended: true, priority: 80 },
        { id: "12", name: "SCM", description: "Supply chain management", category: "SCM", isRecommended: true, priority: 70 },
        { id: "13", name: "E-Commerce", description: "Online store platform", category: "Sales", isRecommended: true, priority: 60 },
        { id: "14", name: "Analytics", description: "Sales & performance analytics", category: "Analytics", isRecommended: false, priority: 50 },
    ],
    default: [
        { id: "1", name: "Core HR", description: "Employee management", category: "HR", isRecommended: false },
        { id: "2", name: "Payroll", description: "Payroll processing", category: "HR", isRecommended: false },
        { id: "15", name: "Finance", description: "Financial management", category: "Finance", isRecommended: false },
        { id: "11", name: "CRM", description: "Customer relationship", category: "Sales", isRecommended: false },
        { id: "9", name: "Inventory", description: "Inventory management", category: "SCM", isRecommended: false },
    ],
};

export function ModuleSelectionStep({ data, onNext, onBack }: ModuleSelectionStepProps) {
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModules, setSelectedModules] = useState<Set<string>>(
        new Set(data.selectedModuleIds || [])
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load modules based on industry
        const industryModules = data.industryId
            ? MOCK_MODULES[data.industryId] || MOCK_MODULES.default
            : MOCK_MODULES.default;

        setModules(industryModules);

        // Auto-select required modules
        const requiredModuleIds = industryModules
            .filter((m) => m.isRequired)
            .map((m) => m.id);

        if (requiredModuleIds.length > 0) {
            setSelectedModules(new Set([...selectedModules, ...requiredModuleIds]));
        }
    }, [data.industryId]);

    const toggleModule = (moduleId: string) => {
        const module = modules.find((m) => m.id === moduleId);
        if (module?.isRequired) return; // Can't deselect required modules

        const newSelected = new Set(selectedModules);
        if (newSelected.has(moduleId)) {
            newSelected.delete(moduleId);
        } else {
            newSelected.add(moduleId);
        }
        setSelectedModules(newSelected);
    };

    const handleContinue = async () => {
        setIsLoading(true);

        try {
            // Call API to save module selection
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            onNext({
                selectedModuleIds: Array.from(selectedModules),
            });
        } catch (error) {
            console.error("Failed to save module selection:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Group modules by category
    const modulesByCategory = modules.reduce((acc, module) => {
        if (!acc[module.category]) {
            acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
    }, {} as Record<string, Module[]>);

    const recommendedCount = modules.filter((m) => m.isRecommended).length;
    const selectedCount = selectedModules.size;

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-2">
                {data.industryId && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>
                            {recommendedCount} modules recommended for your industry
                        </span>
                    </div>
                )}
                <div className="text-center">
                    <Badge variant="secondary" className="px-4 py-2">
                        {selectedCount} module{selectedCount !== 1 ? "s" : ""} selected
                    </Badge>
                </div>
            </div>

            {/* Required Modules Alert */}
            {modules.some((m) => m.isRequired) && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 text-blue-900 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Required modules are pre-selected</p>
                        <p className="text-blue-700">
                            These modules are essential for your industry and cannot be deselected
                        </p>
                    </div>
                </div>
            )}

            {/* Modules by Category */}
            <div className="space-y-4">
                {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
                    <Card key={category}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {categoryModules.map((module) => {
                                const isSelected = selectedModules.has(module.id);
                                const isDisabled = module.isRequired;

                                return (
                                    <div role="button" tabIndex={0}
                                        key={module.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isSelected ? "bg-primary/5 border-primary" : "hover:bg-accent"
                                            } ${isDisabled ? "opacity-75" : "cursor-pointer"}`}
                                        onClick={() => !isDisabled && toggleModule(module.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-sm">{module.name}</h4>
                                                {module.isRecommended && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                                        Recommended
                                                    </Badge>
                                                )}
                                                {module.isRequired && (
                                                    <Badge variant="default" className="text-xs">
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{module.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <Button onClick={handleContinue} disabled={selectedModules.size === 0 || isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            Continue
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
