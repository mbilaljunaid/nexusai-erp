import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Save } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';

export default function LeaseModification() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [leaseId, setLeaseId] = useState("");
    const [modificationType, setModificationType] = useState("RENT_CHANGE");
    const [newAmount, setNewAmount] = useState("");

    const modifyMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/leases/modify", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Lease modification processed" });
            queryClient.invalidateQueries({ queryKey: ["/api/leases"] });
        },
    });

    return (
        <StandardPage
            title="Lease Modification Workbench"
            description="Process lease modifications and remeasurements"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Create Modification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Lease</label>
                        <Input value={leaseId} onChange={(e) => setLeaseId(e.target.value)} placeholder="Enter lease ID" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Modification Type</label>
                        <Select value={modificationType} onValueChange={setModificationType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RENT_CHANGE">Rent Change</SelectItem>
                                <SelectItem value="TERM_EXTENSION">Term Extension</SelectItem>
                                <SelectItem value="SCOPE_CHANGE">Scope Change</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">New Amount</label>
                        <Input
                            type="number"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => modifyMutation.mutate({ leaseId, modificationType, newAmount })}
                        disabled={!leaseId || !newAmount}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Process Modification
                    </Button>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
