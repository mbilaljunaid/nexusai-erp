import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ChevronRight, Loader2 } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface CompanyProfileStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack: () => void;
}

const COMPANY_SIZES = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
];

const TIMEZONES = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Central European Time" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "UTC", label: "UTC" },
];

const CURRENCIES = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "AED", label: "UAE Dirham (AED)" },
    { value: "SAR", label: "Saudi Riyal (SAR)" },
    { value: "INR", label: "Indian Rupee (INR)" },
    { value: "SGD", label: "Singapore Dollar (SGD)" },
];

export function CompanyProfileStep({ data, onNext, onBack }: CompanyProfileStepProps) {
    const [formData, setFormData] = useState({
        name: data.companyProfile?.name || "",
        size: data.companyProfile?.size || "1-10",
        timezone: data.companyProfile?.timezone || "UTC",
        currency: data.companyProfile?.currency || "USD",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Company name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Company name must be at least 2 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsLoading(true);

        try {
            // Call API to save company profile
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            onNext({
                companyProfile: formData,
            });
        } catch (error) {
            setErrors({ submit: "Failed to save company profile. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Icon Header */}
            <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
                <Label htmlFor="company-name">
                    Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="company-name"
                    placeholder="Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Company Size */}
            <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger id="company-size">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                                {size.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Timezone & Currency Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timezone */}
                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                        <SelectTrigger id="timezone">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger id="currency">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((curr) => (
                                <SelectItem key={curr.value} value={curr.value}>
                                    {curr.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{errors.submit}</div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <Button type="submit" disabled={isLoading}>
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
        </form>
    );
}
