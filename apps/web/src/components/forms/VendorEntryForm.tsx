import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const vendorSchema = z.object({
  vendorName: z.string().min(1, "Vendor name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone required"),
  paymentTerms: z.string().min(1, "Payment terms required"),
  bankAccount: z.string().min(1, "Bank account required"),
  address: z.string().min(1, "Address required"),
  category: z.string().optional(),
  status: z.string().default("active"),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorEntryForm({ onSubmit }: { onSubmit?: (data: VendorFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorName: "",
      email: "",
      phone: "",
      paymentTerms: "Net 30",
      bankAccount: "",
      address: "",
      category: "",
      status: "active",
    },
  });

  const handleSubmit = (data: VendorFormData) => {
    toast({ title: "Success", description: "Vendor saved successfully" });
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-4xl" data-testid="form-vendor-entry">
        <div>
          <h2 className="text-2xl font-semibold">Vendor Information</h2>
          <p className="text-sm text-muted-foreground">Create and manage vendor records with payment and banking details</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="vendorName" render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name" {...field} data-testid="input-vendor-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="vendor@example.com" {...field} data-testid="input-vendor-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} data-testid="input-vendor-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Street, City, State, ZIP" {...field} data-testid="input-vendor-address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment & Banking</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="paymentTerms" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms *</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="select-payment-terms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Net 90">Net 90</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="bankAccount" render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account *</FormLabel>
                <FormControl>
                  <Input placeholder="Bank account number" {...field} data-testid="input-bank-account" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Classification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Category</FormLabel>
                  <FormControl>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-vendor-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw-materials">Raw Materials</SelectItem>
                        <SelectItem value="components">Components</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-vendor-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" data-testid="button-submit-vendor">Save Vendor</Button>
      </form>
    </Form>
  );
}
