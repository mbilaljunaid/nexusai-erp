import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const transferSchema = z.object({
    toLocationId: z.string().min(1, "Target Location is required"),
    toCcid: z.string().optional(),
    transactionDate: z.coerce.date(),
    description: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransferAssetDialog({ assetId, assetNumber }: { assetId: string, assetNumber: string }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            toLocationId: "",
            toCcid: "",
            transactionDate: new Date(),
            description: "",
        },
    });

    const transferMutation = useMutation({
        mutationFn: async (data: TransferFormValues) => {
            const res = await apiRequest("POST", `/api/fa/assets/${assetId}/transfer`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
            setOpen(false);
            toast({
                title: "Asset Transferred",
                description: `Asset ${assetNumber} transfer recorded successfully.`,
            });
        },
        onError: (error) => {
            toast({
                title: "Transfer Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: TransferFormValues) {
        transferMutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Asset: {assetNumber}</DialogTitle>
                    <DialogDescription>
                        Record a physical location transfer or cost center change.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="transactionDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transfer Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="toLocationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Location ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. LOC-NYC-01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="toCcid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Cost Center (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 101.00.2000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Reason for transfer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={transferMutation.isPending}>
                                {transferMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Transfer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
