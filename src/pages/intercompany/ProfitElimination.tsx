import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { TrendingDown, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";


export default function ProfitElimination() {
    const { data: elimination } = useQuery<any>({
        queryKey: ["/api/intercompany/profit-elimination"],
        queryFn: () => apiRequest("GET", "/api/intercompany/profit-elimination").then(res => res.json()),
    });

    return (
        <StandardPage title="Intercompany Profit Elimination">
            <div>
                
                <p className="text-muted-foreground">Automated unrealized profit tracking and elimination</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">IC Inventory</div>
                        <div className="text-3xl font-bold mt-1">${elimination?.icInventory?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Unrealized Profit</div>
                        <div className="text-3xl font-bold mt-1 text-red-600">
                            ${elimination?.unrealizedProfit?.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Elimination %</div>
                        <div className="text-3xl font-bold mt-1">{elimination?.eliminationPercent}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Elimination Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {elimination?.items?.map((item: any) => (
                        <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium">{item.product}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.sellingEntity} → {item.buyingEntity}
                                    </div>
                                </div>
                                <Badge>{item.status}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">IC Value</div>
                                    <div className="font-medium">${item.icValue?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Profit</div>
                                    <div className="font-medium text-red-600">${item.profit?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Elimination</div>
                                    <div className="font-medium">${item.elimination?.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
