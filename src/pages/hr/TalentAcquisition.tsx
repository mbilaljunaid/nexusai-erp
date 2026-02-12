import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TalentAcquisition() {
    const { data: pipeline } = useQuery({
        queryKey: ["/api/hr/talent-pipeline"],
        queryFn: () => apiRequest("/api/hr/talent-pipeline"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Talent Acquisition Pipeline</h1>
                    <p className="text-muted-foreground">Recruitment and interview tracking</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

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
        </div>
    );
}
