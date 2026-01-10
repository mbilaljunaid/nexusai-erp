import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tags, Plus, Loader2, Search, Filter, BookOpen, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SourceCategorySetup() {
    const { toast } = useToast();
    const [sourceSearch, setSourceSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");

    const { data: sources, isLoading: sourcesLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/config/sources"],
    });

    const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/config/categories"],
    });

    const createSourceMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/gl/config/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create source");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/config/sources"] });
            toast({ title: "Source Created", description: "Journal source has been successfully added." });
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/gl/config/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create category");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/config/categories"] });
            toast({ title: "Category Created", description: "Journal category has been successfully added." });
        },
    });

    if (sourcesLoading || categoriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl">
                        <Tags className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sources & Categories</h1>
                        <p className="text-muted-foreground italic">Standard Origins: Manual, Spreadsheet, Intercompany, Payables, Receivables</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="sources" className="space-y-4">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="sources" className="flex items-center gap-2">
                        <Database className="h-4 w-4" /> Journal Sources
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Journal Categories
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sources" className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search sources..."
                                className="pl-9"
                                value={sourceSearch}
                                onChange={(e) => setSourceSearch(e.target.value)}
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                                    <Plus className="h-4 w-4" /> Create Source
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Journal Source</DialogTitle>
                                    <DialogDescription>Add a new entry point for journal transactions.</DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4 py-4" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createSourceMutation.mutate({
                                        sourceName: formData.get("sourceName"),
                                        description: formData.get("description"),
                                        importJournalLines: formData.get("import") === "on",
                                        freezeJournals: formData.get("freeze") === "on",
                                        requireApproval: formData.get("approval") === "on",
                                    });
                                }}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sourceName">Source Name</Label>
                                        <Input id="sourceName" name="sourceName" placeholder="e.g., Manual, Payroll" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input id="description" name="description" placeholder="Short description" />
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="space-y-0.5">
                                            <Label>Import Journal Lines</Label>
                                            <p className="text-xs text-muted-foreground">Allow lines to be imported via API/Spreadsheet</p>
                                        </div>
                                        <Switch name="import" />
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="space-y-0.5">
                                            <Label>Freeze Journals</Label>
                                            <p className="text-xs text-muted-foreground">Prevent modifications once imported</p>
                                        </div>
                                        <Switch name="freeze" />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createSourceMutation.isPending}>
                                            {createSourceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Save Source
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="border-none shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="pl-6 w-[200px]">Source Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Import Lines</TableHead>
                                    <TableHead>Freeze</TableHead>
                                    <TableHead>Approval Req.</TableHead>
                                    <TableHead className="text-right pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sources?.filter(s => s.sourceName.toLowerCase().includes(sourceSearch.toLowerCase())).map((source) => (
                                    <TableRow key={source.id} className="hover:bg-amber-50/30">
                                        <TableCell className="pl-6 font-semibold">{source.sourceName}</TableCell>
                                        <TableCell className="text-muted-foreground">{source.description}</TableCell>
                                        <TableCell>{source.importJournalLines ? "Yes" : "No"}</TableCell>
                                        <TableCell>{source.freezeJournals ? "Yes" : "No"}</TableCell>
                                        <TableCell>{source.requireApproval ? "Yes" : "No"}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-9"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                                    <Plus className="h-4 w-4" /> Create Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Journal Category</DialogTitle>
                                    <DialogDescription>Define a new classification for journals.</DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4 py-4" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createCategoryMutation.mutate({
                                        categoryName: formData.get("categoryName"),
                                        description: formData.get("description"),
                                    });
                                }}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="categoryName">Category Name</Label>
                                        <Input id="categoryName" name="categoryName" placeholder="e.g., Adjustment, Accrual" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input id="description" name="description" placeholder="Short description" />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createCategoryMutation.isPending}>
                                            {createCategoryMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Save Category
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="border-none shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="pl-6">Category Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories?.filter(c => c.categoryName.toLowerCase().includes(categorySearch.toLowerCase())).map((category) => (
                                    <TableRow key={category.id} className="hover:bg-amber-50/30">
                                        <TableCell className="pl-6 font-semibold">{category.categoryName}</TableCell>
                                        <TableCell className="text-muted-foreground">{category.description}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
