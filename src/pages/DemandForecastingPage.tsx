import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function DemandForecastingPage() {
  const { toast } = useToast();
  const [localForecasts, setLocalForecasts] = useState<any[]>([]);

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["/api/demand-forecasts"],
    queryFn: () => fetch("/api/demand-forecasts").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (forecasts) {
      setLocalForecasts(forecasts);
    }
  }, [forecasts]);

  const saveMutation = useMutation({
    mutationFn: async (updatedForecasts: any[]) => {
      for (const forecast of updatedForecasts) {
        if (!forecast.id || String(forecast.id).startsWith('temp-')) {
          await fetch("/api/demand-forecasts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...forecast, id: undefined }) });
        } else {
          await apiRequest("PATCH", `/api/demand-forecasts/${forecast.id}`, forecast).catch(() => { });
        }
      }

      const deletedIds = forecasts.filter((c: any) => !updatedForecasts.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/demand-forecasts/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demand-forecasts"] });
      toast({ title: "Forecasts saved successfully" });
    },
  });

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "item",
      header: "Item/SKU",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Item/SKU" value={row.item || ''} onChange={(e) => updateRow("item", e.target.value)} />
      )
    },
    {
      id: "period",
      header: "Period",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Select value={row.period || 'Q1'} onValueChange={(val) => updateRow("period", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Q1">Q1</SelectItem>
            <SelectItem value="Q2">Q2</SelectItem>
            <SelectItem value="Q3">Q3</SelectItem>
            <SelectItem value="Q4">Q4</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "quantity",
      header: "Quantity",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="Qty" value={row.quantity || ''} onChange={(e) => updateRow("quantity", e.target.value)} />
      )
    },
    {
      id: "method",
      header: "Method",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Select value={row.method || 'Time Series'} onValueChange={(val) => updateRow("method", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Time Series">Time Series</SelectItem>
            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
            <SelectItem value="Regression">Regression</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ];

  return (
    <StandardPage
      title="Demand Forecasting"
      breadcrumbs={[{ label: "Supply Chain", href: "/supply-chain" }, { label: "Demand Forecasting" }]}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-none">Demand Forecasting</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl text-slate-600">Predict future demand and optimize inventory</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold text-green-600">95.7%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Items Tracked</p>
            <p className="text-2xl font-bold">156</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Forecast Periods</p>
            <p className="text-2xl font-bold">8</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-none shadow-lg">
        <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Forecast Adjustments</CardTitle>
            <CardDescription>Inline editable spreadsheet for demand planning</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocalForecasts([...localForecasts, { id: `temp-${Date.now()}`, item: '', period: 'Q1', quantity: '', method: 'Time Series' }])}>
              <Plus className="w-4 h-4 mr-2" /> Add Row
            </Button>
            <Button onClick={() => saveMutation.mutate(localForecasts)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading forecasts...</div>
          ) : (
            <InteractiveSpreadsheet
              data={localForecasts}
              columns={columns}
              onChange={setLocalForecasts}
            />
          )}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
