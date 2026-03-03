import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";

export default function TalentAcquisition() {
    const { data: pipeline } = useQuery({
        queryKey: ["/api/hr/talent-pipeline"],
        queryFn: () => apiRequest("/api/hr/talent-pipeline"),
    });

    return (
        <StandardPage
            title="Talent Acquisition Pipeline"
            description="Recruitment and interview tracking"
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            }
        >

            <div className="grid grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Applied</div>
                        <div className="text-3xl font-bold mt-1">{pipeline?.applied}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Screening</div>
                        <div className="text-3xl font-bold mt-1">{pipeline?.screening}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Interview</div>
                        <div className="text-3xl font-bold mt-1">{pipeline?.interview}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Offer</div>
                        <div className="text-3xl font-bold mt-1">{pipeline?.offer}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Hired</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">{pipeline?.hired}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Candidates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {pipeline?.candidates?.map((candidate: any) => (
                        <div key={candidate.id} className="border rounded-lg p-3 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground">{candidate.position}</div>
                            </div>
                            <Badge>{candidate.stage}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
