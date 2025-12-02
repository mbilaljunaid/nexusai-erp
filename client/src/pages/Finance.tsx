import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { InvoiceEntryForm } from "@/components/forms/InvoiceEntryForm";
import { ExpenseEntryForm } from "@/components/forms/ExpenseEntryForm";
import { BudgetEntryForm } from "@/components/forms/BudgetEntryForm";
import { BudgetToVarianceReportForm } from "@/components/forms/BudgetToVarianceReportForm";
import { InvoiceToPaymentForm } from "@/components/forms/InvoiceToPaymentForm";
import { ExpenseToGLForm } from "@/components/forms/ExpenseToGLForm";
import { DollarSign, TrendingUp, BarChart3, FileText, PieChart, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Finance() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const invoicesMetadata = getFormMetadata("invoices");
  
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
    retry: false
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "invoices", label: "Invoices", icon: FileText, color: "text-green-500" },
    { id: "expenses", label: "Expenses", icon: DollarSign, color: "text-orange-500" },
    { id: "budgets", label: "Budgets", icon: PieChart, color: "text-purple-500" },
    { id: "reports", label: "Reports", icon: TrendingUp, color: "text-pink-500" },
    { id: "payments", label: "Payments", icon: CreditCard, color: "text-cyan-500" },
  ];

  return (
