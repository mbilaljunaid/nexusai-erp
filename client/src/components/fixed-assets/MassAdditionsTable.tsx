
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaMassAddition, FaCategory, FaBook } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const postMassAdditionSchema = z.object({
    assetNumber: z.string().min(1, "Asset number is required"),
    bookId: z.string().min(1, "Book is required"),
    categoryId: z.string().min(1, "Category is required"),
});

type PostMassAdditionValues = z.infer<typeof postMassAdditionSchema>;

export function MassAdditionsTable() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedItem, setSelectedItem] = useState<FaMassAddition | null>(null);

    const { data: items, isLoading } = useQuery<FaMassAddition[]>({
        queryKey: ["/api/fa/mass-additions"],
    });

    const { data: categories } = useQuery<FaCategory[]>({
        queryKey: ["/api/gl/fa-categories"], // Mock or real endpoint needed
        // Workaround: Use ad-hoc list if query fails or for simplicity in Phase 2
    });

    const scanMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/fa/mass-additions/prepare");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/mass-additions"] });
            toast({
                title: "Scan Complete",
                description: data.message,
            });
        },
    });

    const postMutation = useMutation({
        mutationFn: async (values: PostMassAdditionValues & { id: string }) => {
            const res = await apiRequest("POST", `/api/fa/mass-additions/${values.id}/post`, values);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/mass-additions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
            setSelectedItem(null);
            toast({
                title: "Asset Created",
                description: "The mass addition record has been converted to a fixed asset.",
            });
        },
    });

    const form = useForm<PostMassAdditionValues>({
        resolver: zodResolver(postMassAdditionSchema),
        defaultValues: {
            assetNumber: "",
            bookId: "CORP-BOOK-1",
            categoryId: "CAT-1",
        }
    });

    function onPost(values: PostMassAdditionValues) {
        if (!selectedItem) return;
        postMutation.mutate({ ...values, id: selectedItem.id });
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Mass Additions Queue</h3>
                <Button
                    variant="outline"
                    onClick={() => scanMutation.mutate()}
                    disabled={scanMutation.isPending}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
                    Scan AP Invoices
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items?.filter(i => i.status === 'QUEUE').map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.invoiceNumber}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.vendorName}</TableCell>
                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right font-medium text-blue-600">
                                    ${Number(item.amount).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                        Queue
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={() => {
                                        setSelectedItem(item);
                                        form.setValue("assetNumber", `AST-${item.invoiceNumber || 'NEW'}`);
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Post
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {items?.filter(i => i.status === 'QUEUE').length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    The mass additions queue is empty.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Post to Asset Register</DialogTitle>
                        <DialogDescription>
                            Assign a book and category to convert this invoice line into a fixed asset.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onPost)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="assetNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bookId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Book</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Book" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CORP-BOOK-1">Corporate Book</SelectItem>
                                                <SelectItem value="TAX-BOOK-1">Tax Book</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CAT-1">Furniture</SelectItem>
                                                <SelectItem value="CAT-2">Computers</SelectItem>
                                                <SelectItem value="CAT-3">Vehicles</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="submit" disabled={postMutation.isPending}>
                                    {postMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate Asset
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
