import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AgingBucket {
  days: string;
  count: number;
  amount: string;
  percentage: number;
}

interface AgingData {
  id: string;
  type: "ap" | "ar";
  current: AgingBucket;
  days30: AgingBucket;
  days60: AgingBucket;
  days90: AgingBucket;
  over90: AgingBucket;
  totalAmount: string;
  createdAt: string;
}

export default function AgingReport() {
  const { data: apData = [] } = useQuery<AgingData[]>({
    queryKey: ["/api/aging-report?type=ap"],
    retry: false,
  });

  const { data: arData = [] } = useQuery<AgingData[]>({
    queryKey: ["/api/aging-report?type=ar"],
    retry: false,
  });

  const apLatest = apData[0];
  const arLatest = arData[0];

  const renderAgingChart = (data: AgingData | undefined) => {
    if (!data) return <p className="text-muted-foreground">No data available</p>;

    const buckets = [
      { label: "Current", data: data.current, color: "bg-green-500" },
      { label: "30-60 Days", data: data.days30, color: "bg-yellow-500" },
      { label: "60-90 Days", data: data.days60, color: "bg-orange-500" },
      { label: "90+ Days", data: data.over90, color: "bg-red-500" },
    ];

    return (
      <div className="space-y-4">
        {buckets.map((bucket) => (
          <div key={bucket.label}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{bucket.label}</span>
              <span className="text-sm">${parseFloat(bucket.data.amount).toLocaleString()}</span>
            </div>
            <div className="w-full bg-secondary h-6 rounded flex overflow-hidden">
              <div
                className={`${bucket.color} transition-all h-full`}
                style={{ width: `${bucket.data.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{bucket.data.count} invoices ({bucket.data.percentage.toFixed(0)}%)</p>
          </div>
        ))}
        <div className="pt-4 border-t">
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-lg">${parseFloat(data.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Aging Report</h1>
        <p className="text-muted-foreground text-sm">View aging analysis for Accounts Payable and Receivable</p>
      </div>

      <Tabs defaultValue="ap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
        </TabsList>

        <TabsContent value="ap" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Overdue 90+ Days</p>
                    <p className="text-2xl font-semibold font-mono">
                      ${apLatest ? parseFloat(apLatest.over90.amount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total AP</p>
                    <p className="text-2xl font-semibold font-mono">
                      ${apLatest ? parseFloat(apLatest.totalAmount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current (Not Due)</p>
                    <p className="text-2xl font-semibold font-mono">
                      ${apLatest ? parseFloat(apLatest.current.amount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>AP Aging Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAgingChart(apLatest)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Overdue 90+ Days</p>
                    <p className="text-2xl font-semibold font-mono">
                      ${arLatest ? parseFloat(arLatest.over90.amount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total AR</p>
                    <p className="text-2xl font-semibold font-mono">
                      ${arLatest ? parseFloat(arLatest.totalAmount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current (Not Due)</p>
                    <p className="text-2xl font-semibold font-mono">
                      ${arLatest ? parseFloat(arLatest.current.amount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>AR Aging Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAgingChart(arLatest)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
