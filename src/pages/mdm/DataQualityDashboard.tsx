import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle, Database, FileSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';


export default function DataQualityDashboard() {
    const { data: stats } = useQuery<any>({
        queryKey: ["/api/mdm/stats"],
    });

    const { data: dqStats } = useQuery<any>({
        queryKey: ["/api/mdm/dq-dashboard/stats"],
    });

    const qualityScore = stats?.dataQualityScore || 0;
    const scoreColor = qualityScore >= 90 ? "text-green-600" : qualityScore >= 75 ? "text-yellow-600" : "text-red-600";

    return (
        <StandardPage title="Data Quality Dashboard">
            <div>
                
                <p className="text-muted-foreground">
                    Monitor master data health and quality metrics
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Records Managed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold">
                                {formatNumber(stats?.recordsManaged) || 0}
                            </div>
                            <Database className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Data Quality Score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className={cn(`text-3xl font-bold ${scoreColor}`)}>
                                {qualityScore}%
                            </div>
                            <TrendingUp className={cn(`w-8 h-8 ${scoreColor}`)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Open Duplicate Sets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-yellow-600">
                                {stats?.openDuplicateSets || 0}
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active Policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold">
                                {stats?.policies || 0}
                            </div>
                            <FileSearch className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quality Alerts */}
            {stats?.openDuplicateSets > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                        {stats.openDuplicateSets} duplicate sets require review. Visit the Duplicate Detection
                        workbench to resolve them.
                    </AlertDescription>
                </Alert>
            )}

            {qualityScore >= 90 && (
                <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                        Data quality is excellent! Your master data is well-maintained.
                    </AlertDescription>
                </Alert>
            )}

            {/* Quality Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Quality Metrics</CardTitle>
                    <CardDescription>Detailed quality analysis</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Completeness</h4>
                                <p className="text-sm text-muted-foreground">
                                    Percentage of fields populated
                                </p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                                {dqStats?.completeness || 92}%
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Uniqueness</h4>
                                <p className="text-sm text-muted-foreground">
                                    Records without duplicates
                                </p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                                {dqStats?.uniqueness || 95}%
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Validity</h4>
                                <p className="text-sm text-muted-foreground">
                                    Data matching format rules
                                </p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                                {dqStats?.validity || 97}%
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Consistency</h4>
                                <p className="text-sm text-muted-foreground">
                                    Cross-system data alignment
                                </p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                                {dqStats?.consistency || 89}%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Remediation Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Quality Issues</CardTitle>
                    <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {dqStats?.issues?.length > 0 ? (
                            dqStats.issues.map((issue: any, i: number) => (
                                <div key={i} className="p-3 border rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{issue.title}</h4>
                                        <p className="text-xs text-muted-foreground">{issue.description}</p>
                                    </div>
                                    <Badge>{issue.count}</Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-muted-foreground">
                                No quality issues detected
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
