import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const adjustmentSchema = z.object({
  adjustmentType: z.string().min(1, "Adjustment type required"),
  accountCode: z.string().min(1, "Account code required"),
  amount: z.string().min(1, "Amount required"),
  reason: z.string().min(1, "Reason required"),
  date: z.string().min(1, "Date required"),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

export default function AdjustmentEntryForm({ onSubmit }: { onSubmit?: (data: AdjustmentFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { adjustmentType: "", accountCode: "", amount: "", reason: "", date: new Date().toISOString().split('T')[0] },
  });

  const handleSubmit = (data: AdjustmentFormData) => {
    toast({ title: "Success", description: "Adjustment entry saved successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="form-adjustment-entry">
        <FormField control={form.control} name="adjustmentType" render={({ field }) => (
          <FormItem>
            <FormLabel>Adjustment Type</FormLabel>
            <FormControl>
              <Input placeholder="Accrual, Depreciation, etc." {...field} data-testid="input-adjustment-type" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="accountCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Account Code</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 1000-100" {...field} data-testid="input-account-code" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="amount" render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0.00" {...field} data-testid="input-adjustment-amount" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} data-testid="input-adjustment-date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="reason" render={({ field }) => (
          <FormItem>
            <FormLabel>Reason</FormLabel>
            <FormControl>
              <Textarea placeholder="Reason for adjustment" {...field} data-testid="input-adjustment-reason" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" data-testid="button-submit-adjustment">Save Adjustment</Button>
      </form>
    </Form>
  );
}
