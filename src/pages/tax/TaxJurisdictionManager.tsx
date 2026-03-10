import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Save, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';
import { Label } from "@/components/ui/label";

export default function TaxJurisdictionManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedJurisdiction, setSelectedJurisdiction] = useState<any>(null);
    const [jurisdictionName, setJurisdictionName] = useState("");
    const [taxRate, setTaxRate] = useState("");

    const { data: jurisdictions } = useQuery<any>({
        queryKey: ["/api/tax/jurisdictions"],
        queryFn: () => apiRequest("GET", "/api/tax/jurisdictions").then(res => res.json()),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/tax/jurisdictions", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Jurisdiction created" });
            queryClient.invalidateQueries({ queryKey: ["/api/tax/jurisdictions"] });
            setJurisdictionName("");
            setTaxRate("");
        },
    });

    return (
        <StandardPage
            title="Tax Jurisdiction Manager"
            description="Manage tax jurisdictions, rates, and hierarchies"
        >
            <div className="container mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Jurisdiction</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Jurisdiction Name</Label>
                                <Input
                                    value={jurisdictionName}
                                    onChange={(e) => setJurisdictionName(e.target.value)}
                                    placeholder="e.g., California"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Type</Label>
                                <Select defaultValue="STATE">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FEDERAL">Federal</SelectItem>
                                        <SelectItem value="STATE">State</SelectItem>
                                        <SelectItem value="COUNTY">County</SelectItem>
                                        <SelectItem value="CITY">City</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createMutation.mutate({ name: jurisdictionName, rate: parseFloat(taxRate) })}
                                disabled={!jurisdictionName || !taxRate}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Jurisdiction
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Jurisdictions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                            {jurisdictions?.map((jurisdiction: any) => (
                                <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedJurisdiction(jurisdiction)}>
                                <div
                                                                    key={jurisdiction.id}
                                                                    className="border rounded-lg p-4 cursor-pointer hover:bg-accent"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="font-medium">{jurisdiction.name}</div>
                                                                            <div className="text-sm text-muted-foreground">{jurisdiction.type}</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-bold">{jurisdiction.rate}%</div>
                                                                            <Badge variant={jurisdiction.active ? "default" : "secondary"}>
                                                                                {jurisdiction.active ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                    {jurisdiction.effectiveDate && (
                                                                        <div className="text-xs text-muted-foreground mt-2">
                                                                            Effective: {formatDate(jurisdiction.effectiveDate)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {selectedJurisdiction && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Jurisdiction Details - {selectedJurisdiction.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Type</div>
                                    <div className="font-medium">{selectedJurisdiction.type}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Rate</div>
                                    <div className="font-medium">{selectedJurisdiction.rate}%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <Badge variant={selectedJurisdiction.active ? "default" : "secondary"}>
                                        {selectedJurisdiction.active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
