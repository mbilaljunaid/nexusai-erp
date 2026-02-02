import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    User,
    MapPin,
    Phone,
    Mail,
    FileText,
    Plus,
    Save,
    ChevronLeft,
    Calendar,
    ShieldCheck,
    Download,
    Trash2
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PersonalDetails() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    const documents = [
        { id: 1, name: "Passport_Scan.pdf", type: "Identification", date: "2024-01-15", status: "Verified" },
        { id: 2, name: "Educational_Certificate.pdf", type: "Education", date: "2023-12-10", status: "Pending" },
    ];

    const handleSave = () => {
        setIsEditing(false);
        toast({
            title: "Success",
            description: "Personal details updated. Approval request submitted.",
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/me">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Personal Details</h1>
                    <p className="text-muted-foreground text-sm">Manage your profile and documents of record</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px] mb-8 bg-zinc-100/50 dark:bg-zinc-800/50 p-1">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="family">Family</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-teal-500/10 to-transparent border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg">Contact Information</CardTitle>
                                    <CardDescription>Primary communication details</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>
                                            <Save className="h-4 w-4 mr-2" /> Save & Submit
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Work Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-teal-500" />
                                            <Input id="email" defaultValue="john.doe@nexusai.com" disabled={!isEditing} className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-none h-11" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Mobile Phone</Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-teal-500" />
                                            <Input id="phone" defaultValue="+1 (555) 000-1234" disabled={!isEditing} className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-none h-11" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Residential Address</Label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-teal-500" />
                                            <Input id="address" defaultValue="123 Innovation Drive, Silicon Valley, CA" disabled={!isEditing} className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-none h-11" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-500" /> Identification Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-900">
                                    <span className="text-sm text-muted-foreground">National Identifier</span>
                                    <span className="font-mono font-medium">XXX-XX-9012</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-900">
                                    <span className="text-sm text-muted-foreground">Passport Number</span>
                                    <span className="font-mono font-medium">A1234567</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-orange-500" /> Biographical Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-900">
                                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                                    <span className="font-medium">10-May-1990</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-900">
                                    <span className="text-sm text-muted-foreground">Marital Status</span>
                                    <span className="font-medium">Married</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            <Plus className="h-4 w-4 mr-2" /> Upload New
                        </Button>
                    </div>

                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-background">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="px-6 py-4 text-left font-semibold">Document Name</th>
                                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                                    <th className="px-6 py-4 text-left font-semibold">Date Added</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                                <FileText className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <span className="font-medium">{doc.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{doc.type}</td>
                                        <td className="px-6 py-4 font-mono text-zinc-500">{doc.date}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={doc.status === "Verified" ? "default" : "outline"} className={doc.status === "Verified" ? "bg-green-500/10 text-green-600 border-green-200" : ""}>
                                                {doc.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
