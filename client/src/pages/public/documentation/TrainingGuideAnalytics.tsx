import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { GraduationCap, ArrowLeft, ArrowRight, BarChart3, PieChart, TrendingUp, LineChart, Table } from "lucide-react";

export default function TrainingGuideAnalytics() {
  useEffect(() => {
    document.title = "Analytics Training Guide | NexusAI ERP";
  }, []);

  const modules = [
    { icon: BarChart3, title: "Dashboard Builder", desc: "Create custom dashboards and visualizations", duration: "35 min", href: "/docs/training-guides/analytics/dashboard-builder" },
    { icon: PieChart, title: "Report Designer", desc: "Build and customize reports", duration: "40 min", href: "/docs/training-guides/analytics/report-designer" },
    { icon: TrendingUp, title: "Predictive Analytics", desc: "Forecasting and trend analysis", duration: "45 min", href: "/docs/training-guides/analytics/predictive-analytics" },
    { icon: LineChart, title: "KPI Management", desc: "Define and track key performance indicators", duration: "30 min", href: "/docs/training-guides/analytics/kpi-management" },
    { icon: Table, title: "Data Explorer", desc: "Ad-hoc queries and data analysis", duration: "25 min", href: "/docs/training-guides/analytics/data-explorer" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Link to="/docs/training-guides">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Training Guides
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <Badge className="mb-2">TRAINING</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Analytics Training Guide</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete training program for the Analytics module covering dashboards, 
            reports, predictive analytics, and KPI tracking.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Training Modules</h2>
          <div className="space-y-4">
            {modules.map((item, index) => (
              <Link key={index} to={item.href} className="block">
                <Card className="transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer" data-testid={`card-module-${index}`}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Badge variant="outline">{item.duration}</Badge>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Total training time: approximately 3 hours
            </p>
            <div className="flex justify-center gap-4">
              <Link to={modules[0].href}>
                <Button size="lg" data-testid="button-start-training">
                  Start Training
                </Button>
              </Link>
              <Link to="/docs/training-guides">
                <Button size="lg" variant="outline" data-testid="button-view-all">
                  View All Guides
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
