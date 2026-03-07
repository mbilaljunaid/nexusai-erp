import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Label } from "@/components/ui/label";

export default function DriverBasedPlanning() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [drivers, setDrivers] = useState([
        { name: "Headcount", value: 150, formula: "" },
        { name: "Revenue per Employee", value: 500000, formula: "" },
        { name: "Total Revenue", value: 0, formula: "Headcount * Revenue per Employee" },
    ]);

    const saveMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/epm/drivers", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Drivers saved" });
            queryClient.invalidateQueries({ queryKey: ["/api/epm/drivers"] });
        },
    });

    return (
        <StandardPage
            title="Driver-Based Planning"
            description="Define business drivers and formulas"
            actions={
                <Button onClick={() => saveMutation.mutate({ drivers })}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Drivers
                </Button>
            }
            className="space-y-6"
        >

            <Card>
                <CardHeader>
                    <CardTitle>Business Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {drivers.map((driver, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                                <div>
                                    <Label className="text-sm">Driver Name</Label>
                                    <Input value={driver.name} readOnly />
                                </div>
                                <div>
                                    <Label className="text-sm">Value</Label>
                                    <Input
                                        type="number"
                                        value={driver.value}
                                        onChange={(e) => {
                                            const newDrivers = [...drivers];
                                            newDrivers[i].value = parseFloat(e.target.value);
                                            setDrivers(newDrivers);
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Formula</Label>
                                    <Input value={driver.formula} placeholder="e.g., A * B" readOnly />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
