import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { GraduationCap, ArrowLeft, Users, Calendar, DollarSign, Award, Clock, FileText } from "lucide-react";

export default function TrainingGuideHR() {
  useEffect(() => {
    document.title = "HR & Payroll Training Guide | NexusAI ERP";
  }, []);

  const modules = [
    { icon: Users, title: "Employee Management", desc: "Employee records, org structure, and directory", duration: "40 min" },
    { icon: Calendar, title: "Time & Attendance", desc: "Time tracking, schedules, and leave management", duration: "45 min" },
    { icon: DollarSign, title: "Payroll Processing", desc: "Pay runs, deductions, and tax calculations", duration: "55 min" },
    { icon: Award, title: "Performance Reviews", desc: "Goals, reviews, and development plans", duration: "35 min" },
    { icon: Clock, title: "Leave Management", desc: "Leave requests, approvals, and balances", duration: "30 min" },
    { icon: FileText, title: "HR Reporting", desc: "Headcount, turnover, and compliance reports", duration: "30 min" },
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
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900">
              <GraduationCap className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <Badge className="mb-2">TRAINING</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">HR & Payroll Training Guide</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete training program for the HR & Payroll module covering employee management, 
            payroll processing, time tracking, and performance reviews.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Training Modules</h2>
          <div className="space-y-4">
            {modules.map((item, index) => (
              <Card key={index} data-testid={`card-module-${index}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Badge variant="outline">{item.duration}</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Total training time: approximately 4 hours
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" data-testid="button-start-training">
                Start Training
              </Button>
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
