import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Loader2, Heart, Wifi, Hotel, ShoppingBag, Boxes, Car, Landmark, Shield, GraduationCap, Flame, X } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface IndustrySelectionStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack: () => void;
}

const INDUSTRIES = [
    // Core Industries (11)
    { id: "healthcare", name: "Healthcare", icon: Heart, color: "text-red-500", bgColor: "bg-red-500/10", description: "Patient & Clinical Management" },
    { id: "retail", name: "Retail & Commerce", icon: ShoppingBag, color: "text-green-500", bgColor: "bg-green-500/10", description: "POS & Omnichannel" },
    { id: "telecom", name: "Telecommunications", icon: Wifi, color: "text-blue-500", bgColor: "bg-blue-500/10", description: "Network & Billing" },
    { id: "hospitality", name: "Hospitality", icon: Hotel, color: "text-purple-500", bgColor: "bg-purple-500/10", description: "Reservations & Guest CRM" },
    { id: "logistics", name: "Logistics", icon: Boxes, color: "text-orange-500", bgColor: "bg-orange-500/10", description: "Shipping & Supply Chain" },
    { id: "automotive", name: "Automotive", icon: Car, color: "text-slate-500", bgColor: "bg-slate-500/10", description: "Production & Sales" },
    { id: "banking", name: "Banking & Finance", icon: Landmark, color: "text-yellow-500", bgColor: "bg-yellow-500/10", description: "Core Banking & Loans" },
    { id: "insurance", name: "Insurance", icon: Shield, color: "text-indigo-500", bgColor: "bg-indigo-500/10", description: "Policies & Claims" },
    { id: "government", name: "Government", icon: Landmark, color: "text-teal-500", bgColor: "bg-teal-500/10", description: "Citizen Services" },
    { id: "education", name: "Education", icon: GraduationCap, color: "text-violet-500", bgColor: "bg-violet-500/10", description: "Admissions & Faculty" },
    { id: "energy", name: "Energy & Utilities", icon: Flame, color: "text-red-600", bgColor: "bg-red-500/10", description: "Grid Ops & Trading" },
    // Phase 5 Additions (4)
    { id: "real_estate", name: "Real Estate", icon: Hotel, color: "text-emerald-500", bgColor: "bg-emerald-500/10", description: "Property & Leasing" },
    { id: "construction", name: "Construction", icon: Boxes, color: "text-amber-500", bgColor: "bg-amber-500/10", description: "Project & Site Mgmt" },
    { id: "saas", name: "SaaS", icon: Wifi, color: "text-sky-500", bgColor: "bg-sky-500/10", description: "Subscriptions & CS" },
    { id: "ecommerce", name: "E-commerce", icon: ShoppingBag, color: "text-pink-500", bgColor: "bg-pink-500/10", description: "Online Store" },
    // From industryConfig.ts (3)
    { id: "manufacturing", name: "Manufacturing", icon: Boxes, color: "text-gray-500", bgColor: "bg-gray-500/10", description: "Production & MRP" },
    { id: "financial_services", name: "Financial Services", icon: Landmark, color: "text-green-600", bgColor: "bg-green-500/10", description: "Investment & Wealth" },
    { id: "technology", name: "Technology", icon: Wifi, color: "text-indigo-600", bgColor: "bg-indigo-500/10", description: "Software & IT" },
];

export function IndustrySelectionStep({ data, onNext, onBack }: IndustrySelectionStepProps) {
    const [selectedIndustry, setSelectedIndustry] = useState<string | null>(data.industryId || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        setIsLoading(true);

        try {
            // Call API to save industry selection
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            onNext({
                industryId: selectedIndustry || undefined,
            });
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        onNext({
            industryId: undefined,
        });
    };

    return (
        <div className="space-y-6">
            {/* Description */}
            <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                    Select your industry to get personalized module recommendations
                </p>
                <p className="text-sm text-muted-foreground">
                    Or <Button variant="default" onClick={handleSkip} className="text-primary hover:underline">skip this step</Button> to choose modules manually
                </p>
            </div>

            {/* Selected Industry Badge */}
            {selectedIndustry && (
                <div className="flex justify-center">
                    <Badge variant="secondary" className="px-4 py-2 text-sm">
                        Selected: {INDUSTRIES.find((i) => i.id === selectedIndustry)?.name}
                        <Button variant="destructive"
                            onClick={() => setSelectedIndustry(null)}
                            className="ml-2 hover:text-destructive"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </Badge>
                </div>
            )}

            {/* Industry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {INDUSTRIES.map((industry) => {
                    const Icon = industry.icon;
                    const isSelected = selectedIndustry === industry.id;

                    return (
                        <Card
                            key={industry.id}
                            className={cn(`cursor-pointer transition-all hover:scale-105 ${isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                                }`)}
                            onClick={() => setSelectedIndustry(industry.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        >
                            <CardContent className="p-4 text-center space-y-2">
                                <div className={cn(`w-12 h-12 mx-auto rounded-lg ${industry.bgColor} flex items-center justify-center`)}>
                                    <Icon className={cn(`w-6 h-6 ${industry.color}`)} />
                                </div>
                                <h3 className="font-medium text-sm">{industry.name}</h3>
                                <p className="text-xs text-muted-foreground">{industry.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
                        Skip
                    </Button>
                    <Button onClick={handleContinue} disabled={!selectedIndustry || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
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
        </div>
    );
}
