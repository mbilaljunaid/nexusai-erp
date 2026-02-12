import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { TrendingDown, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function CategoryManagement() {
    const { data: categories } = useQuery({
        queryKey: ["/api/scm/category-management"],
        queryFn: () => apiRequest("/api/scm/category-management"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-muted-foreground">Spend analysis and supplier consolidation</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Categories</div>
                        <div className="text-3xl font-bold mt-1">{categories?.totalCategories}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Spend</div>
                        <div className="text-3xl font-bold mt-1">${categories?.totalSpend?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Suppliers</div>
                        <div className="text-3xl font-bold mt-1">{categories?.supplierCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Savings YTD</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">${categories?.savingsYTD?.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Spend by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categories?.spendByCategory || []}
                                    dataKey="spend"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {categories?.spendByCategory?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {categories?.categories?.map((cat: any) => (
                            <div key={cat.id} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-medium">{cat.name}</div>
                                    <div className="font-bold">${cat.spend?.toLocaleString()}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {cat.supplierCount} suppliers • {cat.savingsOpportunity}% savings opportunity
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
