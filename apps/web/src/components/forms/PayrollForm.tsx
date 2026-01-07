import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const payrollSchema = z.object({
  employeeId: z.string().min(1, "Employee ID required"),
  baseSalary: z.string().min(1, "Base salary required"),
  allowances: z.string().default("0"),
  deductions: z.string().default("0"),
  taxAmount: z.string().default("0"),
  payPeriod: z.string().min(1, "Pay period required"),
  status: z.string().default("draft"),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

export default function PayrollForm({ onSubmit }: { onSubmit?: (data: PayrollFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: "",
      baseSalary: "",
      allowances: "0",
      deductions: "0",
      taxAmount: "0",
      payPeriod: "Monthly",
      status: "draft",
    },
  });

  const handleSubmit = (data: PayrollFormData) => {
    const baseSalary = parseFloat(data.baseSalary) || 0;
    const allowances = parseFloat(data.allowances) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    const taxAmount = parseFloat(data.taxAmount) || 0;
    const netSalary = baseSalary + allowances - deductions - taxAmount;

    toast({
      title: "Success",
      description: `Payroll processed: Net Salary = $${netSalary.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    });
    onSubmit?.(data);
  };

  const baseSalary = parseFloat(form.getValues("baseSalary")) || 0;
  const allowances = parseFloat(form.getValues("allowances")) || 0;
  const deductions = parseFloat(form.getValues("deductions")) || 0;
  const taxAmount = parseFloat(form.getValues("taxAmount")) || 0;
  const netSalary = baseSalary + allowances - deductions - taxAmount;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-4xl" data-testid="form-payroll">
        <div>
          <h2 className="text-2xl font-semibold">Payroll Processing</h2>
          <p className="text-sm text-muted-foreground">Process employee payroll with salary, allowances, and deductions</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Employee & Period Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="employeeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP001" {...field} data-testid="input-employee-id" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="payPeriod" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay Period *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-pay-period">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Salary Components</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="baseSalary" render={({ field }) => (
              <FormItem>
                <FormLabel>Base Salary *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">$</span>
                    <Input type="number" placeholder="50000" {...field} className="pl-6" data-testid="input-base-salary" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="allowances" render={({ field }) => (
                <FormItem>
                  <FormLabel>Allowances</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">$</span>
                      <Input type="number" placeholder="0" {...field} className="pl-6" data-testid="input-allowances" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="deductions" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deductions</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">$</span>
                      <Input type="number" placeholder="0" {...field} className="pl-6" data-testid="input-deductions" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="taxAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">$</span>
                    <Input type="number" placeholder="0" {...field} className="pl-6" data-testid="input-tax-amount" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
          <CardHeader><CardTitle className="text-base">Net Salary</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100" data-testid="text-net-salary">
              ${netSalary.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {baseSalary > 0 ? "Ready to process" : "Complete salary fields"}
            </p>
          </CardContent>
        </Card>

        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger data-testid="select-payroll-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full" data-testid="button-submit-payroll">Process Payroll</Button>
      </form>
    </Form>
  );
}
