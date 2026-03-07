import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Users, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function CollectionsWorkbench() {
    const { data: collections } = useQuery<any>({
        queryKey: ["/api/ar/collections"],
        queryFn: () => apiRequest("GET", "/api/ar/collections").then(res => res.json()),
    });

    return (
        <StandardPage
            title="Collections Workbench"
            description="Collector assignment, dunning strategy, promise-to-pay"
        >

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Overdue</div>
                        <div className="text-3xl font-bold mt-1">${formatNumber(collections?.totalOverdue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Cases</div>
                        <div className="text-3xl font-bold mt-1">{collections?.activeCases}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Promise to Pay</div>
                        <div className="text-3xl font-bold mt-1 text-orange-600">${formatNumber(collections?.promiseToPay)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Collection Rate</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">{collections?.collectionRate}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Collection Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {collections?.cases?.map((case_: any) => (
                        <div key={case_.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium">{case_.customerName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Overdue: ${formatNumber(case_.overdueAmount)}
                                    </div>
                                </div>
                                <Badge variant={case_.priority === "HIGH" ? "destructive" : "secondary"}>
                                    {case_.priority}
                                </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button size="sm">
                                    <Phone className="h-3 w-3 mr-1" />
                                    Call
                                </Button>
                                <Button size="sm" variant="outline">
                                    Record Promise
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
