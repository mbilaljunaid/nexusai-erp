
import { useQuery } from "@tanstack/react-query";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FaAddition } from "@shared/schema";
import { Loader2 } from "lucide-react";

export function AssetList() {
    const { data: assets, isLoading } = useQuery<FaAddition[]>({
        queryKey: ["/api/fa/assets"],
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Asset Register</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset Number</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date in Service</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Units</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets?.map((asset) => (
                            <TableRow key={asset.id}>
                                <TableCell className="font-medium">{asset.assetNumber}</TableCell>
                                <TableCell>{asset.description}</TableCell>
                                <TableCell>{asset.categoryId}</TableCell>
                                <TableCell>{new Date(asset.datePlacedInService).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">{formatCurrency(Number(asset.originalCost))}</TableCell>
                                <TableCell className="text-right">{asset.units}</TableCell>
                                <TableCell>
                                    <Badge variant={asset.status === "Active" ? "default" : "secondary"}>
                                        {asset.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
