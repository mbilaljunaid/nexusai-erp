import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  salary: number;
  department: string;
  status: string;
}

export function EmployeeToPayrollForm({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { toast } = useToast();
  const [salary, setSalary] = useState(employee.salary.toString());
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");

  const createPayrollMutation = useMutation({
    mutationFn: async () => {
      const salaryAmount = parseFloat(salary);
      return apiRequest("POST", "/api/hr/payroll", {
        employeeId: employee.id,
        employeeName: employee.name,
        payPeriodStart,
        payPeriodEnd,
        baseSalary: salaryAmount,
        grossPay: salaryAmount,
        netPay: salaryAmount * 0.85,
        taxAmount: salaryAmount * 0.15,
        status: "draft",
        linkedEmployeeId: employee.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Payroll created for ${employee.name}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payroll",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Create Payroll from Employee
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Generate payroll entry from employee data</p>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Employee:</span>
              <Badge variant="default">{employee.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Employee ID:</span>
              <span className="text-sm">{employee.employeeId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Annual Salary:</span>
              <span className="font-semibold">${parseFloat(salary).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Department:</span>
              <span className="text-sm">{employee.department}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payroll Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                data-testid="input-salary"
              />
            </div>
            <div>
              <Label htmlFor="period-start">Pay Period Start</Label>
              <Input
                id="period-start"
                type="date"
                value={payPeriodStart}
                onChange={(e) => setPayPeriodStart(e.target.value)}
                data-testid="input-period-start"
              />
            </div>
            <div>
              <Label htmlFor="period-end">Pay Period End</Label>
              <Input
                id="period-end"
                type="date"
                value={payPeriodEnd}
                onChange={(e) => setPayPeriodEnd(e.target.value)}
                data-testid="input-period-end"
              />
            </div>
          </div>

          <Card className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                This will create a payroll record with automatic tax calculations and link to HR records for compliance tracking.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => createPayrollMutation.mutate()} disabled={createPayrollMutation.isPending} className="flex-1" data-testid="button-create-payroll">
          {createPayrollMutation.isPending ? "Creating..." : "Create Payroll"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
