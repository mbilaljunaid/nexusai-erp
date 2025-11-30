import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, DollarSign, BarChart3, Briefcase, TrendingUp } from "lucide-react";

export default function HR() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Users className="w-8 h-8" />HR & Talent Management</h1>
        <p className="text-muted-foreground text-sm">Manage employees, recruitment, payroll, and performance</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="employees" data-testid="tab-employees">Employees</TabsTrigger>
          <TabsTrigger value="recruitment" data-testid="tab-recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="payroll" data-testid="tab-payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/employees">
              <Card className="cursor-pointer hover-elevate" data-testid="card-total-employees">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">245</p><p className="text-xs text-muted-foreground">Total Employees</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/talent-pool">
              <Card className="cursor-pointer hover-elevate" data-testid="card-open-positions">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">12</p><p className="text-xs text-muted-foreground">Open Positions</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/performance-reviews">
              <Card className="cursor-pointer hover-elevate" data-testid="card-turnover">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">3.2%</p><p className="text-xs text-muted-foreground">Turnover (YTD)</p></div></CardContent>
              </Card>
            </Link>
            <Card className="cursor-pointer hover-elevate" data-testid="card-engagement">
              <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">94%</p><p className="text-xs text-muted-foreground">Employee Engagement</p></div></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-base">By Department</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Engineering: 78</p><p className="text-sm">Sales: 45</p><p className="text-sm">Operations: 34</p></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">By Status</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Active: 232</p><p className="text-sm">On Leave: 8</p><p className="text-sm">Contractors: 5</p></div></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Open Positions</p><p className="text-2xl font-bold">12</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Progress</p><p className="text-2xl font-bold">28</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg. Time to Hire</p><p className="text-2xl font-bold">32 days</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Monthly Payroll</p><p className="text-2xl font-bold">$1.2M</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Next Run</p><p className="text-2xl font-bold">Dec 31</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">On Time Rate</p><p className="text-2xl font-bold text-green-600">100%</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Reviews Due</p><p className="text-2xl font-bold">34</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold text-green-600">211</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Rating</p><p className="text-2xl font-bold">3.8/5</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
