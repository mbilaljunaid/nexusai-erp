import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function ServiceAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: resolvedData = [] } = useQuery<any[]>({ queryKey: ["/api/service/analytics"] });
  const formMetadata = getFormMetadata("serviceAnalytics");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={resolvedData} onFilter={setFiltered} />
      
      <div>
        <h1 className="text-3xl font-bold">Service Analytics</h1>
        <p className="text-muted-foreground mt-1">Service performance metrics and trends</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Weekly Resolutions</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resolvedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="resolved" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
