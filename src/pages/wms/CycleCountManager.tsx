import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CycleCountManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [abcClass, setAbcClass] = useState("ALL");

    const { data: counts } = useQuery({
        queryKey: ["/api/wms/cycle-counts", abcClass],
        queryFn: () => apiRequest(`/api/wms/cycle-counts?abcClass=${abcClass}`),
    });

    const createCountMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("/api/wms/cycle-counts", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast({ title: "Success", description: "Cycle count created" });
            queryClient.invalidateQueries({ queryKey: ["/api/wms/cycle-counts"] });
        },
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Cycle Count Manager</h1>
                    <p className="text-muted-foreground">ABC classification and count scheduling</p>
                </div>
                <Button onClick={() => createCountMutation.mutate({ abcClass: "A", zones: ["ZONE-A"] })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Count
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Class A Items</div>
                        <div className="text-3xl font-bold mt-1">{counts?.classA || 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Count Weekly</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Class B Items</div>
                        <div className="text-3xl font-bold mt-1">{counts?.classB || 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Count Monthly</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Class C Items</div>
                        <div className="text-3xl font-bold mt-1">{counts?.classC || 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Count Quarterly</div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <label className="text-sm font-medium">Filter by ABC Class</label>
                <Select value={abcClass} onValueChange={setAbcClass}>
                    <SelectTrigger className="w-64">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Classes</SelectItem>
                        <SelectItem value="A">Class A (High Value)</SelectItem>
                        <SelectItem value="B">Class B (Medium Value)</SelectItem>
                        <SelectItem value="C">Class C (Low Value)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scheduled Counts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {counts?.scheduled?.map((count: any) => (
                        <div key={count.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium">Count #{count.countId}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Zone: {count.zone} • {count.itemCount} items
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline">Class {count.abcClass}</Badge>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(count.scheduledDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            {count.variance && (
                                <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Variance:</span>
                                    <span className={`ml-2 font-medium ${count.variance > 0 ? "text-red-600" : "text-green-600"}`}>
                                        {count.variance} units
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
