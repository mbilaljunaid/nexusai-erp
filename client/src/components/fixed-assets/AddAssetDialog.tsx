
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertFaAssetSchema, InsertFaAsset } from "@shared/schema";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function AddAssetDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<InsertFaAsset>({
        resolver: zodResolver(insertFaAssetSchema),
        defaultValues: {
            assetNumber: "",
            description: "",
            originalCost: "0",
            lifeYears: 5,
            method: "STL",
            datePlacedInService: new Date(),
            bookId: "CORP-BOOK-1", // Temp hardcode needed or fetch
            categoryId: "CAT-1",   // Temp hardcode
            recoverableCost: "0", // Should be calc
            status: "ACTIVE"
        },
    });

    const createAsset = useMutation({
        mutationFn: async (data: InsertFaAsset) => {
            // Ensure numeric strings are preserved or processed
            const res = await apiRequest("POST", "/api/fa/assets", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
            setOpen(false);
            form.reset();
            toast({
                title: "Asset Created",
                description: "The asset has been successfully added to the register.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: InsertFaAsset) {
        // Auto-calc recoverable if 0
        if (data.recoverableCost === "0" || !data.recoverableCost) {
            data.recoverableCost = data.originalCost;
        }
        createAsset.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new asset. Click save when done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="assetNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="AST-001" {...field} />
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
                                        <Input placeholder="MacBook Pro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="originalCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lifeYears"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Life (Years)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Note: Simplified form. Needs Category Picker real implementation */}

                        <DialogFooter>
                            <Button type="submit" disabled={createAsset.isPending}>
                                {createAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Asset
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
