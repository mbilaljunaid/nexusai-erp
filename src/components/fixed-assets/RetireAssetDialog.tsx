
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
import { FaAsset } from "@shared/schema";
import { Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const retireSchema = z.object({
    bookId: z.string().min(1, "Book is required"),
    retirementDate: z.coerce.date(),
    proceeds: z.coerce.number().min(0),
    removalCost: z.coerce.number().min(0),
});

type RetireFormValues = z.infer<typeof retireSchema>;

export function RetireAssetDialog({ asset }: { asset: FaAsset }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<RetireFormValues>({
        resolver: zodResolver(retireSchema),
        defaultValues: {
            bookId: "CORP-BOOK-1", // Default for Phase 3 MVP
            retirementDate: new Date(),
            proceeds: 0,
            removalCost: 0,
        },
    });

    const retireMutation = useMutation({
        mutationFn: async (data: RetireFormValues) => {
            const res = await apiRequest("POST", `/api/fa/assets/${asset.id}/retire`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
            setOpen(false);
            toast({
                title: "Asset Retired",
                description: `Asset ${asset.assetNumber} has been retired successfully.`,
            });
        },
        onError: (error) => {
            toast({
                title: "Retirement Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: RetireFormValues) {
        retireMutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Retire
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Retire Asset: {asset.assetNumber}</DialogTitle>
                    <DialogDescription>
                        Enter the details for asset disposal. This action will write off the NBV and calculate Gain/Loss.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="retirementDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Retirement Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="proceeds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proceeds of Sale</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="removalCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Removal Cost</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" variant="destructive" disabled={retireMutation.isPending}>
                                {retireMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Retirement
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
