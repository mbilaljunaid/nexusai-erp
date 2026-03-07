import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Code, Save } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';
import { Label } from "@/components/ui/label";

export default function TaxCodeBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [taxType, setTaxType] = useState("SALES");

    const createMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/tax/tax-codes", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Tax code created" });
            queryClient.invalidateQueries({ queryKey: ["/api/tax/tax-codes"] });
            setCode("");
            setDescription("");
        },
    });

    return (
        <StandardPage
            title="Tax Code Builder"
            description="Create and configure tax codes"
        >
            <div className="container mx-auto space-y-6">
                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <div>
                            <Label className="text-sm font-medium">Tax Code</Label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g., SALES-CA"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description..."
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Tax Type</Label>
                                <Select value={taxType} onValueChange={setTaxType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SALES">Sales Tax</SelectItem>
                                        <SelectItem value="USE">Use Tax</SelectItem>
                                        <SelectItem value="VAT">VAT</SelectItem>
                                        <SelectItem value="GST">GST</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Applicability</Label>
                                <Select defaultValue="ALL">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Transactions</SelectItem>
                                        <SelectItem value="GOODS">Goods Only</SelectItem>
                                        <SelectItem value="SERVICES">Services Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => createMutation.mutate({ code, description, taxType })}
                            disabled={!code || !description}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Create Tax Code
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
