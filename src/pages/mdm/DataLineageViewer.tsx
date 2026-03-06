import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { GitBranch, Database, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";


export default function DataLineageViewer() {
    const [entityType, setEntityType] = useState("CUSTOMER");
    const [recordId, setRecordId] = useState("");
    const [viewType, setViewType] = useState<'UPSTREAM' | 'DOWNSTREAM' | 'FULL'>('FULL');

    const { data: lineageData } = useQuery<any>({
        queryKey: ["/api/mdm/lineage", entityType, recordId, viewType],
        queryFn: () => apiRequest("GET", `/api/mdm/lineage?entityType=${entityType}&recordId=${recordId}&viewType=${viewType}`).then(res => res.json()),
        enabled: !!recordId,
    });

    const { data: searchResults } = useQuery<any>({
        queryKey: ["/api/mdm/lineage-search", entityType],
        queryFn: () => apiRequest("GET", `/api/mdm/lineage-search?entityType=${entityType}`).then(res => res.json()),
    });

    return (
        <StandardPage title="Data Lineage Viewer">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Track data transformations and dependencies</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Lineage
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div>
                    <label className="text-sm font-medium">Entity Type</label>
                    <Select value={entityType} onValueChange={setEntityType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="SUPPLIER">Supplier</SelectItem>
                            <SelectItem value="PRODUCT">Product</SelectItem>
                            <SelectItem value="ACCOUNT">Account</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Record ID</label>
                    <Input
                        value={recordId}
                        onChange={(e) => setRecordId(e.target.value)}
                        placeholder="Enter record ID"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">View Type</label>
                    <Select value={viewType} onValueChange={(v: any) => setViewType(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UPSTREAM">Upstream Only</SelectItem>
                            <SelectItem value="DOWNSTREAM">Downstream Only</SelectItem>
                            <SelectItem value="FULL">Full Lineage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {lineageData && (
                <div className="grid grid-cols-12 gap-6">
                    <Card className="col-span-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <GitBranch className="h-5 w-5 mr-2" />
                                Lineage Graph
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lineageData.upstream && lineageData.upstream.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-3">Upstream Sources</h3>
                                        {lineageData.upstream.map((node: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 mb-3">
                                                <div className={`border-l-4 pl-${(i + 1) * 4} py-2`}>
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <div className="font-medium">{node.source}</div>
                                                            <div className="text-sm text-muted-foreground">{node.transformation}</div>
                                                        </div>
                                                        <Badge>{node.type}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div>
                                            <div className="font-bold">{lineageData.currentRecord?.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                ID: {lineageData.currentRecord?.id} | Type: {entityType}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {lineageData.downstream && lineageData.downstream.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-3">Downstream Consumers</h3>
                                        {lineageData.downstream.map((node: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 mb-3">
                                                <div className={`border-l-4 pl-${(i + 1) * 4} py-2`}>
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-4 w-4 text-green-600" />
                                                        <div>
                                                            <div className="font-medium">{node.target}</div>
                                                            <div className="text-sm text-muted-foreground">{node.usage}</div>
                                                        </div>
                                                        <Badge>{node.type}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Lineage Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Total Upstream Sources</div>
                                <div className="text-2xl font-bold">{lineageData.upstream?.length || 0}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Downstream Consumers</div>
                                <div className="text-2xl font-bold">{lineageData.downstream?.length || 0}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Last Modified</div>
                                <div className="font-medium">
                                    {lineageData.currentRecord?.lastModified
                                        ? formatDateTime(lineageData.currentRecord.lastModified)
                                        : "N/A"}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Modified By</div>
                                <div className="font-medium">{lineageData.currentRecord?.modifiedBy || "N/A"}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </StandardPage>
    );
}
