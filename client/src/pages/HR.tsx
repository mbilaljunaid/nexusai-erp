import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmployeeEntryForm } from "@/components/forms/EmployeeEntryForm";
import { EmployeeToPayrollForm } from "@/components/forms/EmployeeToPayrollForm";
import PayrollForm from "@/components/forms/PayrollForm";
import PerformanceRatingForm from "@/components/forms/PerformanceRatingForm";
import { LeaveRequestForm } from "@/components/forms/LeaveRequestForm";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { FormDialog } from "@/components/FormDialog";
import { Users, BarChart3, Briefcase, DollarSign, TrendingUp, Calendar, BookOpen, Target, Heart, Award, Clock, PieChart, Settings, Zap, Search } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HR() {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [match, params] = useRoute("/hr/:page");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const employeesMetadata = getFormMetadata("employees");

  useEffect(() => {
    if (params?.page) {
      setActiveNav(params.page);
    }
  }, [params?.page]);
  
  const { data: employees = [] } = useQuery<any[]>({ queryKey: ["/api/employees"], retry: false });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "employees", label: "Employees", icon: Users, color: "text-green-500" },
    { id: "recruitment", label: "Recruitment", icon: Briefcase, color: "text-purple-500" },
    { id: "payroll", label: "Payroll", icon: DollarSign, color: "text-orange-500" },
    { id: "performance", label: "Performance", icon: TrendingUp, color: "text-red-500" },
    { id: "leave", label: "Leave Mgmt", icon: Calendar, color: "text-cyan-500" },
    { id: "training", label: "Training", icon: BookOpen, color: "text-indigo-500" },
    { id: "succession", label: "Succession", icon: Target, color: "text-pink-500" },
    { id: "engagement", label: "Engagement", icon: Heart, color: "text-rose-500" },
    { id: "compensation", label: "Compensation", icon: Award, color: "text-amber-500" },
    { id: "attendance", label: "Attendance", icon: Clock, color: "text-teal-500" },
    { id: "analytics", label: "Analytics", icon: PieChart, color: "text-violet-500" },
    { id: "policies", label: "Policies", icon: Settings, color: "text-slate-500" },
    { id: "onboarding", label: "Onboarding", icon: Zap, color: "text-lime-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Users className="w-8 h-8" />HR & Talent Management</h1>
        <p className="text-muted-foreground text-sm">Manage employees, recruitment, payroll, performance, and talent development</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">245</p><p className="text-xs text-muted-foreground">Total Employees</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">12</p><p className="text-xs text-muted-foreground">Open Positions</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">3.2%</p><p className="text-xs text-muted-foreground">Turnover (YTD)</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">94%</p><p className="text-xs text-muted-foreground">Engagement Score</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {navItems.map((item) => (
          <Link key={item.id} to={item.id === "overview" ? "/hr" : `/hr/${item.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Headcount</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Active: 232</p><p className="text-sm">On Leave: 8</p><p className="text-sm">Contractors: 5</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">HR Metrics</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Turnover: 3.2%</p><p className="text-sm">Engagement: 94%</p><p className="text-sm">Retention: 96.8%</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "employees" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1">
              <CardTitle>Employees</CardTitle>
              <SmartAddButton formMetadata={employeesMetadata} onClick={() => setShowEmployeeForm(true)} />
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSearchWithMetadata
                formMetadata={employeesMetadata}
                value={searchQuery}
                onChange={setSearchQuery}
                data={employees}
                onFilter={setFilteredEmployees}
              />
              <div className="space-y-2">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp: any, idx: number) => (
                    <Card key={emp.id || idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{emp.name}</p><p className="text-sm text-muted-foreground">{emp.email}</p><p className="text-xs text-muted-foreground">{emp.department} - {emp.role}</p></div><Badge variant="secondary">${Number(emp.salary || 0).toLocaleString()}</Badge></div></CardContent></Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No employees found</p>
                )}
              </div>
            </CardContent>
          </Card>
          <EmployeeEntryForm />
        </div>
      )}

      {activeNav === "recruitment" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Recruitment</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Open Positions: 12 | In Progress: 28 | Avg Time to Hire: 32 days</p><Button size="sm" className="mt-4">+ New Position</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "payroll" && (
        <div className="space-y-4">
          {selectedEmployee ? (
            <EmployeeToPayrollForm 
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
            />
          ) : (
            <div className="space-y-4">
              <PayrollForm />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Create Payroll from Employee</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Select an employee to generate payroll entry</p>
                  <div className="space-y-2">
                    {[
                      { id: "1", name: "John Smith", employeeId: "E-001", salary: 85000, department: "Engineering", status: "Active" },
                      { id: "2", name: "Sarah Johnson", employeeId: "E-002", salary: 92000, department: "Finance", status: "Active" },
                      { id: "3", name: "Michael Chen", employeeId: "E-003", salary: 78000, department: "Operations", status: "Active" },
                    ].map((emp) => (
                      <div key={emp.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">{emp.employeeId} • {emp.department} • ${emp.salary.toLocaleString()}</p>
                        </div>
                        <Button size="sm" onClick={() => setSelectedEmployee(emp)} data-testid={`button-payroll-${emp.id}`}>
                          Create Payroll
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeNav === "performance" && <div className="space-y-4"><PerformanceRatingForm /></div>}

      {activeNav === "leave" && <div className="space-y-4"><LeaveRequestForm /></div>}

      {activeNav === "training" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Training & Development</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Active Programs: 24 | Enrollments: 187 | Completion: 92%</p><Button size="sm" className="mt-4">+ Enroll Program</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "succession" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Succession Planning</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Key Positions: 18 | Successors Ready: 14 | Coverage: 78%</p><Button size="sm" className="mt-4">+ Plan Succession</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "engagement" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Employee Engagement</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Survey Participation: 87% | Score: 7.8/10 | eNPS: 45</p><Button size="sm" className="mt-4">+ New Survey</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "compensation" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Compensation</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Total Comp: $14.2M | Reviews Due: 12 | Bonus Pool: $2.1M</p><Button size="sm" className="mt-4">+ Review Comp</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "attendance" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Attendance</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Avg Attendance: 96.2% | Late: 12 | Absences: 8</p><Button size="sm" className="mt-4">+ Track Attendance</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>HR Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Avg Tenure: 4.2 yrs | Cost per Hire: $8.5K | Retention: 96.8%</p><Button size="sm" className="mt-4">+ View Reports</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "policies" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>HR Policies</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">✓ Code of Conduct</p><p className="text-sm">✓ Leave Policy</p><p className="text-sm">✓ Anti-Harassment Policy</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "onboarding" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Onboarding</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">In Progress: 3 | Completed: 242 | Completion Time: 7.2 days</p><Button size="sm" className="mt-4">+ Start Onboarding</Button></CardContent></Card>
        </div>
      )}
    </div>
  );
}
