import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, CheckCircle2, Clock, AlertCircle, DollarSign, ArrowRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  method: "card" | "bank" | "check";
  status: "pending" | "processing" | "completed" | "failed";
  transactionId?: string;
  createdAt: string;
}

export default function PaymentFlow() {
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    retry: false,
  });

  const processPaymentMutation = useMutation({
    mutationFn: (data: Partial<Payment>) => apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setCardNumber("");
      setAmount("");
    },
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "pending").length,
    completed: payments.filter(p => p.status === "completed").length,
    failed: payments.filter(p => p.status === "failed").length,
    totalProcessed: payments.filter(p => p.status === "completed").reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Payment Flow</h1>
        <p className="text-muted-foreground text-sm">Process and track customer and vendor payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalProcessed / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Card Number</label>
              <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Expiry</label>
                <Input placeholder="MM/YY" />
              </div>
              <div>
                <label className="text-sm font-medium">CVC</label>
                <Input placeholder="123" maxLength={3} />
              </div>
            </div>
            <Button className="w-full" onClick={() => processPaymentMutation.mutate({ amount, method: "card", status: "processing" })}>
              <CreditCard className="w-4 h-4 mr-2" />
              Process Payment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="w-4 h-4 mr-2" />
              Credit Card
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Bank Transfer
            </Button>
            <Button variant="outline" className="w-full justify-start">
              ACH Payment
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="processing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="processing">Processing ({stats.pending})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
        </TabsList>

        {["pending", "completed", "failed"].map((status) => (
          <TabsContent key={status} value={status === "pending" ? "processing" : status} className="space-y-4">
            {payments
              .filter((p) => p.status === status)
              .map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Payment {payment.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">Method: {payment.method.toUpperCase()}</p>
                        {payment.transactionId && <p className="text-xs text-muted-foreground">TXN: {payment.transactionId}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold font-mono">${parseFloat(payment.amount).toLocaleString()}</p>
                        <Badge variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"}>
                          {status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
