import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const payrollSchema = z.object({
  employeeId: z.string().min(1, "Employee ID required"),
  baseSalary: z.string().min(1, "Base salary required"),
  allowances: z.string().default("0"),
  deductions: z.string().default("0"),
  taxAmount: z.string().default("0"),
  payPeriod: z.string().min(1, "Pay period required"),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

export default function PayrollForm({ onSubmit }: { onSubmit?: (data: PayrollFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: { employeeId: "", baseSalary: "", allowances: "0", deductions: "0", taxAmount: "0", payPeriod: "Monthly" },
  });

  const handleSubmit = (data: PayrollFormData) => {
    toast({ title: "Success", description: "Payroll processed successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="form-payroll">
        <FormField control={form.control} name="employeeId" render={({ field }) => (
          <FormItem>
            <FormLabel>Employee ID</FormLabel>
            <FormControl>
              <Input placeholder="EMP001" {...field} data-testid="input-employee-id" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="baseSalary" render={({ field }) => (
          <FormItem>
            <FormLabel>Base Salary</FormLabel>
            <FormControl>
              <Input type="number" placeholder="50000" {...field} data-testid="input-base-salary" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="allowances" render={({ field }) => (
          <FormItem>
            <FormLabel>Allowances</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} data-testid="input-allowances" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="deductions" render={({ field }) => (
          <FormItem>
            <FormLabel>Deductions</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} data-testid="input-deductions" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="taxAmount" render={({ field }) => (
          <FormItem>
            <FormLabel>Tax Amount</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} data-testid="input-tax-amount" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="payPeriod" render={({ field }) => (
          <FormItem>
            <FormLabel>Pay Period</FormLabel>
            <FormControl>
              <Input placeholder="Monthly" {...field} data-testid="input-pay-period" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" data-testid="button-submit-payroll">Process Payroll</Button>
      </form>
    </Form>
  );
}
