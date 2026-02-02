import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const performanceSchema = z.object({
  employeeId: z.string().min(1, "Employee ID required"),
  rating: z.string().min(1, "Rating required"),
  competencies: z.string().min(1, "Competencies required"),
  feedback: z.string().min(1, "Feedback required"),
  goals: z.string().optional(),
});

type PerformanceFormData = z.infer<typeof performanceSchema>;

export default function PerformanceRatingForm({ onSubmit }: { onSubmit?: (data: PerformanceFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
    defaultValues: { employeeId: "", rating: "3", competencies: "", feedback: "", goals: "" },
  });

  const handleSubmit = (data: PerformanceFormData) => {
    toast({ title: "Success", description: "Performance rating saved successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="form-performance-rating">
        <FormField control={form.control} name="employeeId" render={({ field }) => (
          <FormItem>
            <FormLabel>Employee ID</FormLabel>
            <FormControl>
              <Input placeholder="EMP001" {...field} data-testid="input-perf-employee-id" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="rating" render={({ field }) => (
          <FormItem>
            <FormLabel>Overall Rating (1-5)</FormLabel>
            <FormControl>
              <Input type="number" min="1" max="5" placeholder="3" {...field} data-testid="input-overall-rating" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="competencies" render={({ field }) => (
          <FormItem>
            <FormLabel>Key Competencies</FormLabel>
            <FormControl>
              <Textarea placeholder="Communication, Technical, Leadership" {...field} data-testid="input-competencies" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="feedback" render={({ field }) => (
          <FormItem>
            <FormLabel>Feedback</FormLabel>
            <FormControl>
              <Textarea placeholder="Provide detailed feedback" {...field} data-testid="input-perf-feedback" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="goals" render={({ field }) => (
          <FormItem>
            <FormLabel>Development Goals (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Goals for next period" {...field} data-testid="input-dev-goals" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" data-testid="button-submit-performance">Save Performance Rating</Button>
      </form>
    </Form>
  );
}
