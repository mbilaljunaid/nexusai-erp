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
import { Users, BarChart3, Briefcase, DollarSign, TrendingUp, Calendar, BookOpen, Target, Heart, Award, Clock, PieChart, Settings, Zap, Search } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HR() {
  const [match, params] = useRoute("/hr/:page");
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
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
