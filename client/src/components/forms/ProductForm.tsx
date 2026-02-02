import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function ProductForm() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: "",
        productCode: "",
        isActive: "1", // string for select
        description: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submitMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", "/api/crm/products", {
                name: formData.name,
                productCode: formData.productCode,
                isActive: parseInt(formData.isActive, 10),
                description: formData.description,
            });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Product created successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/products"] });
            setFormData({
                name: "",
                productCode: "",
                isActive: "1",
                description: "",
            });
        },
        onError: (err) => {
            console.error(err);
            toast({ title: "Error", description: "Failed to create product", variant: "destructive" });
        }
    });

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Product Management
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Create and manage products for opportunities and quotes</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g. Enterprise License"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productCode">Product Code</Label>
                            <Input
                                id="productCode"
                                value={formData.productCode}
                                onChange={(e) => handleChange("productCode", e.target.value)}
                                placeholder="e.g. SW-ENT-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="isActive">Active Status</Label>
                            <Select
                                value={formData.isActive}
                                onValueChange={(val) => handleChange("isActive", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Product details and specifications..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => submitMutation.mutate()}
                            disabled={submitMutation.isPending || !formData.name}
                        >
                            {submitMutation.isPending ? "Creating..." : "Create Product"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
