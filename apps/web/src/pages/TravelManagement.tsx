import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Calendar, DollarSign } from "lucide-react";

export default function TravelManagement() {
  const [viewType, setViewType] = useState("requests");
  const { data: requests = [] } = useQuery<any[]>({ queryKey: ["/api/travel/requests"] });
  const { data: expenses = [] } = useQuery<any[]>({ queryKey: ["/api/travel/expenses"] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Travel Management</h1>
        <p className="text-muted-foreground mt-2">Manage travel requests and expenses</p>
      </div>

      <div className="flex gap-2">
        <Button variant={viewType === "requests" ? "default" : "outline"} onClick={() => setViewType("requests")} data-testid="button-view-requests">
          <Plane className="h-4 w-4 mr-2" />
          Requests ({requests.length})
        </Button>
        <Button variant={viewType === "expenses" ? "default" : "outline"} onClick={() => setViewType("expenses")} data-testid="button-view-expenses">
          <DollarSign className="h-4 w-4 mr-2" />
          Expenses ({expenses.length})
        </Button>
      </div>

      {viewType === "requests" && (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <Card key={req.id} data-testid={`card-request-${req.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{req.destination}</h4>
                      <p className="text-sm text-muted-foreground">{req.requestNumber}</p>
                    </div>
                  </div>
                  <Badge>{req.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Depart</span>
                    <p className="font-medium">{new Date(req.departureDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Return</span>
                    <p className="font-medium">{new Date(req.returnDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "expenses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenses.map((exp: any) => (
            <Card key={exp.id} data-testid={`card-expense-${exp.id}`}>
              <CardHeader>
                <CardTitle className="text-lg">{exp.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Vendor</span>
                  <p className="font-medium">{exp.vendor}</p>
                </div>
                <p className="text-2xl font-bold">${exp.amount}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
