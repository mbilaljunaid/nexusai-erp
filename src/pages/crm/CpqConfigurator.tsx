import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Settings, CheckCircle, AlertCircle, Sparkles, ArrowRight, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ConfigOption {
    id: string;
    name: string;
    type: "SELECT" | "CHECKBOX" | "NUMBER";
    required: boolean;
    options?: string[];
    defaultValue?: any;
    dependencies?: { optionId: string; value: any }[];
}

interface ConfigurationRule {
    id: string;
    name: string;
    type: "INCLUSION" | "EXCLUSION" | "DEPENDENCY";
    condition: string;
    action: string;
}

interface ProductConfiguration {
    baseProduct: {
        id: string;
        name: string;
        basePrice: number;
    };
    options: ConfigOption[];
    rules: ConfigurationRule[];
}

export default function CpqConfigurator() {
    const { toast } = useToast();

    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [configValues, setConfigValues] = useState<Record<string, any>>({});
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Fetch available products for configuration
    const { data: products = [] } = useQuery<any>({
        queryKey: ["configurable-products"],
        queryFn: async () => {
            const res = await fetch("/api/crm/cpq/products");
            return res.json();
        }
    });

    // Fetch configuration for selected product
    const { data: configuration } = useQuery<ProductConfiguration>({
        queryKey: ["product-config", selectedProduct],
        queryFn: async () => {
            const res = await fetch(`/api/crm/cpq/products/${selectedProduct}/configuration`);
            return res.json();
        },
        enabled: !!selectedProduct
    });

    // Validate configuration
    const { data: validation } = useQuery<any>({
        queryKey: ["config-validation", selectedProduct, configValues],
        queryFn: async () => {
            const res = await fetch(`/api/crm/cpq/products/${selectedProduct}/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ configuration: configValues })
            });
            return res.json();
        },
        enabled: !!selectedProduct && Object.keys(configValues).length > 0
    });

    // Calculate pricing
    const { data: pricing } = useQuery<any>({
        queryKey: ["config-pricing", selectedProduct, configValues],
        queryFn: async () => {
            const res = await fetch(`/api/crm/cpq/products/${selectedProduct}/price`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ configuration: configValues })
            });
            return res.json();
        },
        enabled: !!selectedProduct && Object.keys(configValues).length > 0
    });

    // Save configuration mutation
    const saveConfigMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/crm/cpq/configurations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: selectedProduct,
                    configuration: configValues,
                    pricing: pricing
                })
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Configuration Saved",
                description: "Product configuration saved successfully"
            });
        }
    });

    const handleOptionChange = (optionId: string, value: any) => {
        setConfigValues(prev => ({
            ...prev,
            [optionId]: value
        }));
    };

    const isOptionAvailable = (option: ConfigOption): boolean => {
        if (!option.dependencies || option.dependencies.length === 0) return true;

        return option.dependencies.every(dep => {
            const depValue = configValues[dep.optionId];
            return depValue === dep.value;
        });
    };

    const completionPercentage = configuration
        ? (Object.keys(configValues).length / configuration.options.filter(o => o.required).length) * 100
        : 0;

    const isConfigValid = validation?.isValid ?? false;
    const totalPrice = pricing?.total ?? (configuration?.baseProduct.basePrice ?? 0);

    return (
        <StandardPage
            title="CPQ Configurator"
            description="Configure products with guided selling and pricing rules"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "CPQ Configurator" }
            ]}
        >
            <div className="space-y-6">
                {/* Product Selection */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Select Product to Configure</CardTitle>
                        <CardDescription>Choose a configurable product to begin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a product..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product: any) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name} - ${product.basePrice.toLocaleString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedProduct && configuration && (
                    <>
                        {/* Configuration Progress */}
                        <Card className="bg-purple-500/10 border-purple-100">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-purple-900 dark:text-purple-200">{configuration.baseProduct.name}</CardTitle>
                                        <CardDescription className="text-purple-700">
                                            Configuration Progress: {completionPercentage.toFixed(0)}%
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-purple-800">Estimated Price</div>
                                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">${totalPrice.toLocaleString()}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Progress value={completionPercentage} className="h-2" />
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Configuration Options */}
                            <div className="lg:col-span-2 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            Configuration Options
                                        </CardTitle>
                                        <CardDescription>Select options to customize this product</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {configuration.options.map((option) => {
                                            const isAvailable = isOptionAvailable(option);

                                            return (
                                                <div
                                                    key={option.id}
                                                    className={cn(`space-y-2 pb-4 border-b last:border-0 ${!isAvailable ? 'opacity-50' : ''}`)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label className="flex items-center gap-2">
                                                            {option.name}
                                                            {option.required && (
                                                                <Badge variant="outline" className="text-xs">Required</Badge>
                                                            )}
                                                        </Label>
                                                        {!isAvailable && (
                                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                Unavailable
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {option.type === "SELECT" && (
                                                        <Select
                                                            value={configValues[option.id] || option.defaultValue}
                                                            onValueChange={(value) => handleOptionChange(option.id, value)}
                                                            disabled={!isAvailable}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an option..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {option.options?.map((opt) => (
                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}

                                                    {option.type === "CHECKBOX" && (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={option.id}
                                                                checked={configValues[option.id] || false}
                                                                onCheckedChange={(checked) => handleOptionChange(option.id, checked)}
                                                                disabled={!isAvailable}
                                                            />
                                                            <label
                                                                htmlFor={option.id}
                                                                className="text-sm text-muted-foreground cursor-pointer"
                                                            >
                                                                Enable this option
                                                            </label>
                                                        </div>
                                                    )}

                                                    {option.type === "NUMBER" && (
                                                        <Input
                                                            type="number"
                                                            value={configValues[option.id] || option.defaultValue || ""}
                                                            onChange={(e) => handleOptionChange(option.id, parseInt(e.target.value))}
                                                            disabled={!isAvailable}
                                                            placeholder="Enter a number..."
                                                        />
                                                    )}

                                                    {option.dependencies && option.dependencies.length > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            <AlertCircle className="h-3 w-3 inline mr-1" />
                                                            Requires: {option.dependencies.map(d => `${d.optionId} = ${d.value}`).join(", ")}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>

                                {/* Configuration Rules */}
                                <Card className="border-l-4 border-l-amber-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Active Configuration Rules</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {configuration.rules.map((rule) => (
                                                <div key={rule.id} className="flex items-start gap-2 text-xs">
                                                    <Sparkles className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium">{rule.name}</div>
                                                        <div className="text-muted-foreground">{rule.type}: {rule.action}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Summary Panel */}
                            <div className="space-y-4">
                                {/* Validation Status */}
                                <Card className={cn(`border-l-4 ${isConfigValid ? 'border-l-green-500' : 'border-l-red-500'}`)}>
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            {isConfigValid ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    Valid Configuration
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                    Validation Issues
                                                </>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {validation?.errors && validation.errors.length > 0 && (
                                            <ul className="space-y-1 text-xs text-red-700">
                                                {validation.errors.map((error: string, idx: number) => (
                                                    <li key={idx}>• {error}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {isConfigValid && (
                                            <div className="text-xs text-green-700">
                                                All requirements met. Ready to save.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Pricing Breakdown */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Pricing Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Base Price</span>
                                            <span className="font-mono">${configuration.baseProduct.basePrice.toLocaleString()}</span>
                                        </div>
                                        {pricing?.options && pricing.options.map((opt: any) => (
                                            <div key={opt.name} className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{opt.name}</span>
                                                <span className="font-mono">+${opt.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {pricing?.discount && pricing.discount > 0 && (
                                            <div className="flex items-center justify-between text-sm text-green-700">
                                                <span>Discount</span>
                                                <span className="font-mono">-${pricing.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-3 border-t font-bold">
                                            <span>Total Price</span>
                                            <span className="text-lg">${totalPrice.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <Button
                                        className="w-full"
                                        disabled={!isConfigValid}
                                        onClick={() => saveConfigMutation.mutate()}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Save Configuration
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Add to Quote
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {!selectedProduct && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Product Selected</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Select a configurable product from the dropdown above to begin guided configuration with real-time pricing and validation.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
