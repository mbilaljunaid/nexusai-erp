import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, DollarSign, Package, FileText, Download, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function CustomerAnalytics() {
    const { data: analytics } = useQuery<any>({
        queryKey: ["/api/portal/customer-analytics"],
        queryFn: () => apiRequest("GET", "/api/portal/customer-analytics").then(res => res.json()),
    });

    const columns: SpreadsheetColumn<any>[] = [
        { id: "orderNumber", header: "Order #", width: "150px", cell: (order: any) => <span className="font-medium">{order.orderNumber}</span> },
        { id: "date", header: "Date", width: "150px", cell: (order: any) => <span>{new Date(order.date).toLocaleDateString()}</span> },
        { id: "status", header: "Status", width: "150px", cell: (order: any) => <span>{order.status}</span> },
        { id: "amount", header: "Amount", width: "150px", cell: (order: any) => <span>${order.amount.toLocaleString()}</span> }
    ];

    return (
        <StandardPage title="Customer Analytics Dashboard">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Usage metrics, spending analysis, and insights</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Total Spend (YTD)</div>
                                <div className="text-2xl font-bold mt-1">${analytics?.totalSpend?.toLocaleString()}</div>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Open Orders</div>
                                <div className="text-2xl font-bold mt-1">{analytics?.openOrders}</div>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Open Invoices</div>
                                <div className="text-2xl font-bold mt-1">{analytics?.openInvoices}</div>
                            </div>
                            <FileText className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Avg Order Value</div>
                                <div className="text-2xl font-bold mt-1">${analytics?.avgOrderValue?.toLocaleString()}</div>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Spending Trend (Last 12 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics?.monthlySpend || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Spend by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics?.spendByCategory || []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {(analytics?.spendByCategory || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <InteractiveSpreadsheet
                            data={analytics?.recentOrders || []}
                            columns={columns}
                            virtualized={true}
                            containerHeight="300px"
                            onChange={() => { }}
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
