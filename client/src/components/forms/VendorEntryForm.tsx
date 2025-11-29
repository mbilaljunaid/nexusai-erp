import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const vendorSchema = z.object({
  vendorName: z.string().min(1, "Vendor name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone required"),
  paymentTerms: z.string().min(1, "Payment terms required"),
  bankAccount: z.string().min(1, "Bank account required"),
  address: z.string().min(1, "Address required"),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorEntryForm({ onSubmit }: { onSubmit?: (data: VendorFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { vendorName: "", email: "", phone: "", paymentTerms: "Net 30", bankAccount: "", address: "" },
  });

  const handleSubmit = (data: VendorFormData) => {
    toast({ title: "Success", description: "Vendor saved successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="form-vendor-entry">
        <FormField control={form.control} name="vendorName" render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter vendor name" {...field} data-testid="input-vendor-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="vendor@example.com" {...field} data-testid="input-vendor-email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="Phone number" {...field} data-testid="input-vendor-phone" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="paymentTerms" render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Terms</FormLabel>
            <FormControl>
              <Input placeholder="Net 30" {...field} data-testid="input-payment-terms" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="bankAccount" render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Account</FormLabel>
            <FormControl>
              <Input placeholder="Bank account number" {...field} data-testid="input-bank-account" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder="Vendor address" {...field} data-testid="input-vendor-address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" data-testid="button-submit-vendor">Save Vendor</Button>
      </form>
    </Form>
  );
}
