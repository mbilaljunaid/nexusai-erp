import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';
import { Label } from "@/components/ui/label";

export default function CycleCountManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [abcClass, setAbcClass] = useState("ALL");

    const { data: counts } = useQuery<any>({
        queryKey: ["/api/wms/cycle-counts", abcClass],
        queryFn: () => apiRequest("GET", `/api/wms/cycle-counts?abcClass=${abcClass}`).then(res => res.json()),
    });

    const createCountMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/wms/cycle-counts", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Cycle count created" });
            queryClient.invalidateQueries({ queryKey: ["/api/wms/cycle-counts"] });
        },
    });

    return (
        <StandardPage
            title="Cycle Count Manager"
            description="ABC classification and count scheduling"
            actions={
                <Button onClick={() => createCountMutation.mutate({ abcClass: "A", zones: ["ZONE-A"] })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Count
                </Button>
            }
        >
            <div className="space-y-6">

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
                    <Label className="text-sm font-medium">Filter by ABC Class</Label>
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
                                            {formatDate(count.scheduledDate)}
                                        </div>
                                    </div>
                                </div>
                                {count.variance && (
                                    <div className="mt-2 text-sm">
                                        <span className="text-muted-foreground">Variance:</span>
                                        <span className={cn(`ml-2 font-medium ${count.variance > 0 ? "text-red-600" : "text-green-600"}`)}>
                                            {count.variance} units
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
