import React, { useState } from "react";
import { i18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
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
    Trash2,
    Users,
    Heart,
    MessageSquare,
    Shield,
    Activity,
    CreditCard,
    Clock
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ESSActionDialog } from "@/components/hr/ESSActionDialog";

export default function PersonalDetails() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"ADDRESS" | "MARITAL_STATUS">("ADDRESS");

    const { data: activeBenefits, isLoading: loadingBenefits } = useQuery({
        queryKey: ["active-benefits"],
        queryFn: async () => {
            const res = await fetch("/api/me/benefits/active");
            if (!res.ok) throw new Error("Failed to fetch benefits");
            return res.json();
        }
    });

    const documents = [
        { id: 1, name: "Passport_Scan.pdf", type: "Identification", date: "2024-01-15", status: "Verified" },
        { id: 2, name: "Educational_Certificate.pdf", type: "Education", date: "2023-12-10", status: "Pending" },
    ];

    const emergencyContacts = [
        { name: "Jane Doe", relationship: "Spouse", phone: "+1 (555) 999-8888", email: "jane.doe@example.com", isPrimary: true },
        { name: "Richard Roe", relationship: "Father", phone: "+1 (555) 777-6666", email: "richard.roe@example.com", isPrimary: false },
    ];

    const handleSave = () => {
        setIsEditing(false);
        toast({
            title: "Success",
            description: "Personal details updated. Approval request submitted.",
        });
    };

    const openAction = (type: "ADDRESS" | "MARITAL_STATUS") => {
        setActionType(type);
        setActionDialogOpen(true);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/hr/self-service/me">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{i18n.t('hr.personal.details')}</h1>
                    <p className="text-muted-foreground text-sm">Manage your profile and documents of record</p>
                </div>
            </div>

            <ESSActionDialog
                isOpen={actionDialogOpen}
                onClose={() => setActionDialogOpen(false)}
                type={actionType}
            />

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5 md:w-[700px] mb-8 bg-zinc-100/50 dark:bg-zinc-800/50 p-1">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="family">Family & Contacts</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    <TabsTrigger value="time">Time</TabsTrigger>
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
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="address" className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Residential Address</Label>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-teal-600 text-[10px]" onClick={() => openAction("ADDRESS")}>Request Change</Button>
                                        </div>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-teal-500" />
                                            <Input id="address" defaultValue="123 Innovation Drive, Silicon Valley, CA" disabled className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-none h-11 opacity-70" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">Official address changes require HR approval.</p>
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
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-orange-500" /> Biographical Info
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-teal-600 text-[10px]" onClick={() => openAction("MARITAL_STATUS")}>Change Status</Button>
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

                <TabsContent value="benefits" className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <div>
                            <h3 className="text-xl font-bold">Health & Wellness elections</h3>
                            <p className="text-muted-foreground text-sm">Your active coverage and benefit programs</p>
                        </div>
                        <Link href="/hr/self-service/benefits">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                <Plus className="h-4 w-4 mr-2" /> Modify Elections
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingBenefits ? (
                            <p>Loading your benefits...</p>
                        ) : activeBenefits?.length === 0 ? (
                            <Card className="md:col-span-3 border-dashed border-2 py-12 flex flex-col items-center justify-center bg-transparent">
                                <Shield className="h-12 w-12 text-zinc-300 mb-4" />
                                <p className="text-zinc-500 font-medium">No active benefit enrollments found.</p>
                                <Link href="/hr/self-service/benefits">
                                    <Button variant="link" className="text-teal-600 mt-2">Start Enrollment Process</Button>
                                </Link>
                            </Card>
                        ) : activeBenefits?.map((ben: any) => (
                            <Card key={ben.enrollmentId} className="group hover:border-teal-500/50 transition-all border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{ben.planType}</CardTitle>
                                    <Activity className={`h-4 w-4 ${ben.planType === 'MEDICAL' ? 'text-red-500' : 'text-teal-500'}`} />
                                </CardHeader>
                                <CardContent>
                                    <h4 className="text-lg font-bold mb-1">{ben.planName}</h4>
                                    <p className="text-sm text-muted-foreground">{ben.optionName}</p>
                                    <div className="mt-6 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Cost Share</p>
                                            <p className="text-lg font-bold text-teal-600">${ben.employeeCost}<span className="text-xs font-normal text-zinc-400">/mo</span></p>
                                        </div>
                                        <Badge variant="outline" className="bg-teal-500/5 text-teal-600 border-teal-500/20">Active</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-zinc-900 text-white border-zinc-800 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CreditCard className="h-32 w-32" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <h3 className="text-xl font-bold mb-2">Flexible Spending Account (FSA)</h3>
                            <p className="text-zinc-400 max-w-lg mb-6">Manage your tax-advantaged accounts for healthcare and dependent care expenses. Current balance: <span className="text-white font-bold">$1,240.50</span></p>
                            <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
                                View Transactions
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="time" className="space-y-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Time & Attendance Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Weekly Hours</p>
                                    <p className="text-2xl font-bold">38.5</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">OT Hours</p>
                                    <p className="text-2xl font-bold text-amber-600">2.0</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Status</p>
                                    <p className="text-2xl font-bold text-green-600">Active</p>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">Manage your timesheets?</h4>
                                    <p className="text-xs text-muted-foreground">View detailed logs, entries, and submit for approval.</p>
                                </div>
                                <Link href="/hr/self-service/time">
                                    <Button>View Full Time Card</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
