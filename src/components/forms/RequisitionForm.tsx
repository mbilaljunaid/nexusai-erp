import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const requisitionSchema = z.object({
  requisitionNumber: z.string().min(1, "Requisition number required"),
  department: z.string().min(1, "Department required"),
  jobTitle: z.string().min(1, "Job title required"),
  headcount: z.string().min(1, "Headcount required"),
  budget: z.string().min(1, "Budget required"),
  justification: z.string().min(1, "Justification required"),
});

type RequisitionFormData = z.infer<typeof requisitionSchema>;

export default function RequisitionForm({ onSubmit }: { onSubmit?: (data: RequisitionFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: { requisitionNumber: "", department: "", jobTitle: "", headcount: "1", budget: "", justification: "" },
  });

  const handleSubmit = (data: RequisitionFormData) => {
    toast({ title: "Success", description: "Requisition submitted successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="form-requisition">
        <FormField control={form.control} name="requisitionNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Requisition Number</FormLabel>
            <FormControl>
              <Input placeholder="REQ-2025-001" {...field} data-testid="input-req-number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="department" render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Input placeholder="Engineering" {...field} data-testid="input-department" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jobTitle" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <FormControl>
              <Input placeholder="Senior Software Engineer" {...field} data-testid="input-job-title" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="headcount" render={({ field }) => (
          <FormItem>
            <FormLabel>Headcount</FormLabel>
            <FormControl>
              <Input type="number" min="1" placeholder="1" {...field} data-testid="input-headcount" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="budget" render={({ field }) => (
          <FormItem>
            <FormLabel>Budget (Annual)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="150000" {...field} data-testid="input-budget" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="justification" render={({ field }) => (
          <FormItem>
            <FormLabel>Justification</FormLabel>
            <FormControl>
              <Textarea placeholder="Business justification for this hire" {...field} data-testid="input-justification" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" data-testid="button-submit-requisition">Submit Requisition</Button>
      </form>
    </Form>
  );
}
