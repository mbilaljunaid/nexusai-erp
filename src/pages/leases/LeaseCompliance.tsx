import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';

export default function LeaseCompliance() {
    const { data: compliance } = useQuery({
        queryKey: ["/api/leases/compliance"],
        queryFn: () => apiRequest("/api/leases/compliance"),
    });

    return (
        <StandardPage
            title="Lease Compliance Dashboard"
            description="ASC 842 compliance and disclosure tracking"
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Disclosures
                </Button>
            }
        >
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Leases</div>
                        <div className="text-3xl font-bold mt-1">{compliance?.totalLeases}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Compliant</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">{compliance?.compliant}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Needing Review</div>
                        <div className="text-3xl font-bold mt-1 text-orange-600">{compliance?.needsReview}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Compliance %</div>
                        <div className="text-3xl font-bold mt-1">{compliance?.complianceRate}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compliance Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {compliance?.issues?.map((issue: any, i: number) => (
                        <div key={i} className="border rounded-lg p-3 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{issue.leaseNumber}</div>
                                <div className="text-sm text-muted-foreground">{issue.description}</div>
                            </div>
                            <Badge variant="destructive">{issue.severity}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
