import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const customerSchema = z.object({
  customerName: z.string().min(1, "Customer name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone required"),
  industry: z.string().min(1, "Industry required"),
  address: z.string().min(1, "Address required"),
  creditLimit: z.string().default("0"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerEntryForm({ onSubmit }: { onSubmit?: (data: CustomerFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerName: "", email: "", phone: "", industry: "", address: "", creditLimit: "0" },
  });

  const handleSubmit = (data: CustomerFormData) => {
    toast({ title: "Success", description: "Customer saved successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="form-customer-entry">
        <FormField control={form.control} name="customerName" render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter customer name" {...field} data-testid="input-customer-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="customer@example.com" {...field} data-testid="input-customer-email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="Phone number" {...field} data-testid="input-customer-phone" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="industry" render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <FormControl>
              <Input placeholder="Industry type" {...field} data-testid="input-customer-industry" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder="Customer address" {...field} data-testid="input-customer-address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="creditLimit" render={({ field }) => (
          <FormItem>
            <FormLabel>Credit Limit</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} data-testid="input-credit-limit" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" data-testid="button-submit-customer">Save Customer</Button>
      </form>
    </Form>
  );
}
