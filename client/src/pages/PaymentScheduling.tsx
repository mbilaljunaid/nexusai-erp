import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PaymentSchedule {
  id: string;
  vendorId: string;
  invoiceId: string;
  amount: string;
  dueDate: string;
  scheduledDate: string;
  status: "pending" | "scheduled" | "processed" | "failed";
  createdAt: string;
}

export default function PaymentScheduling() {
  const { data: schedules = [] } = useQuery<PaymentSchedule[]>({
    queryKey: ["/api/payment-schedules"],
    retry: false,
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: Partial<PaymentSchedule>) => apiRequest("POST", "/api/payment-schedules", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/payment-schedules"] }),
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/payment-schedules/${id}/process`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/payment-schedules"] }),
  });

  const stats = {
    pending: schedules.filter(s => s.status === "pending").length,
    scheduled: schedules.filter(s => s.status === "scheduled").length,
    processed: schedules.filter(s => s.status === "processed").length,
    totalAmount: schedules.filter(s => s.status !== "failed").reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0),
  };

  const getDueStatus = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: "OVERDUE", color: "destructive" };
    if (days <= 3) return { text: "DUE SOON", color: "secondary" };
    return { text: "ON TRACK", color: "default" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Payment Scheduling</h1>
          <p className="text-muted-foreground text-sm">Plan and manage vendor payment dates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.processed}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({stats.pending + stats.scheduled})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({stats.processed})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {schedules
            .filter((s) => s.status === "pending" || s.status === "scheduled")
            .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
            .map((schedule) => {
              const dueStatus = getDueStatus(schedule.dueDate);
              return (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Vendor {schedule.vendorId}</p>
                          <Badge variant={dueStatus.color as any}>{dueStatus.text}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Due: {new Date(schedule.dueDate).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Scheduled: {new Date(schedule.scheduledDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-semibold font-mono">${parseFloat(schedule.amount).toLocaleString()}</p>
                        {schedule.status === "pending" && (
                          <Button size="sm" onClick={() => processMutation.mutate(schedule.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {schedules
            .filter((s) => s.status === "processed")
            .map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Vendor {schedule.vendorId}</p>
                      <p className="text-sm text-muted-foreground">Processed: {new Date(schedule.scheduledDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-semibold font-mono">${parseFloat(schedule.amount).toLocaleString()}</p>
                      <Badge>PROCESSED</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
