import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Search,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Wrench,
    ArrowRight,
    User,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { serviceRequestService, type ServiceRequest as ServiceRequestType } from "@/services/maintenance.service";

// Map API service request type to component interface
interface ServiceRequest {
    id: string;
    number: string;
    title: string;
    description: string;
    requestorName: string;
    requestorEmail: string;
    location?: string;
    assetId?: string;
    assetName?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CONVERTED_TO_WO";
    submittedDate: string;
    reviewedDate?: string;
    workOrderId?: string;
    priorityScore?: number;
}

// Helper to map API response to component format
const mapServiceRequest = (apiSR: ServiceRequestType): ServiceRequest => ({
    id: apiSR.id,
    number: apiSR.srNumber,
    title: apiSR.title,
    description: apiSR.description,
    requestorName: apiSR.requestedBy,
    requestorEmail: apiSR.requestedByEmail,
    location: apiSR.location,
    assetName: apiSR.assetName,
    priority: apiSR.priority,
    status: apiSR.status,
    submittedDate: apiSR.submittedDate,
    workOrderId: apiSR.convertedWoNumber,
    priorityScore: apiSR.priorityScore,
});

interface ServiceRequestForm {
    title: string;
    description: string;
    location: string;
    assetId: string;
    assetName: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export function ServiceRequestPortal() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [formData, setFormData] = useState<ServiceRequestForm>({
        title: "",
        description: "",
        location: "",
        assetId: "",
        assetName: "",
        priority: "MEDIUM"
    });

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALL - Replace mock data with service layer
            const apiRequests = await serviceRequestService.getServiceRequests();
            const mappedRequests = apiRequests.map(mapServiceRequest);
            setRequests(mappedRequests);
        } catch (error) {
            console.error("Failed to load service requests:", error);
            // Fallback: keep empty array on error
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // ✅ LIVE API CALL - Create service request via service layer
            const apiResponse = await serviceRequestService.createServiceRequest({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                assetName: formData.assetName,
                priority: formData.priority,
            });

            const newRequest = mapServiceRequest(apiResponse);

            setRequests([newRequest, ...requests]);
            setShowForm(false);
            setFormData({
                title: "",
                description: "",
                location: "",
                assetId: "",
                assetName: "",
                priority: "MEDIUM"
            });
        } catch (error) {
            console.error("Failed to submit service request:", error);
            // TODO: Show error toast to user
        }
    };

    const handleConvertToWO = async (requestId: string) => {
        try {
            // ✅ LIVE API CALL - Convert SR to WO via service layer
            const result = await serviceRequestService.convertToWorkOrder(requestId);

            setRequests(prev => prev.map(req =>
                req.id === requestId
                    ? { ...req, status: "CONVERTED_TO_WO", workOrderId: result.woNumber, reviewedDate: new Date().toISOString() }
                    : req
            ));

            // TODO: Show success toast with WO number
        } catch (error) {
            console.error("Failed to convert SR to WO:", error);
            // TODO: Show error toast to user
        }
    };

    const getPriorityConfig = (priority: ServiceRequest["priority"]) => {
        switch (priority) {
            case "URGENT":
                return { color: "bg-red-100 text-red-800 border-red-300", icon: AlertCircle, label: "Urgent" };
            case "HIGH":
                return { color: "bg-orange-100 text-orange-800 border-orange-300", icon: AlertCircle, label: "High" };
            case "MEDIUM":
                return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock, label: "Medium" };
            default:
                return { color: "bg-blue-100 text-blue-800 border-blue-300", icon: FileText, label: "Low" };
        }
    };

    const getStatusConfig = (status: ServiceRequest["status"]) => {
        switch (status) {
            case "CONVERTED_TO_WO":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Converted to WO" };
            case "APPROVED":
                return { color: "bg-blue-100 text-blue-800", icon: CheckCircle2, label: "Approved" };
            case "UNDER_REVIEW":
                return { color: "bg-purple-100 text-purple-800", icon: Clock, label: "Under Review" };
            case "REJECTED":
                return { color: "bg-red-100 text-red-800", icon: AlertCircle, label: "Rejected" };
            default:
                return { color: "bg-gray-100 text-gray-800", icon: FileText, label: "Submitted" };
        }
    };

    const filteredRequests = requests
        .filter(req => statusFilter === "all" || req.status === statusFilter)
        .filter(req =>
            searchTerm === "" ||
            req.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between"
      actions={<Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                </Button>}
    >

            <Tabs defaultValue="inbox" className="w-full">
                <TabsList>
                    <TabsTrigger value="inbox">Inbox ({requests.filter(r => r.status !== "CONVERTED_TO_WO").length})</TabsTrigger>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="converted">Converted ({requests.filter(r => r.status === "CONVERTED_TO_WO").length})</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="space-y-4">
                    {showForm ? (
                        <Card className="border-2 border-primary">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="text-base">New Service Request</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmitRequest} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Request Title *</label>
                                        <Input
                                            placeholder="Brief description of the issue..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Detailed Description *</label>
                                        <Textarea
                                            placeholder="Provide detailed information about the issue, what you observed, when it started, etc."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Location</label>
                                            <Input
                                                placeholder="Building, floor, room..."
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Asset/Equipment</label>
                                            <Input
                                                placeholder="Equipment name or ID (if applicable)"
                                                value={formData.assetName}
                                                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Priority *</label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low - Routine maintenance</SelectItem>
                                                <SelectItem value="MEDIUM">Medium - Needs attention soon</SelectItem>
                                                <SelectItem value="HIGH">High - Impacting operations</SelectItem>
                                                <SelectItem value="URGENT">Urgent - Safety or critical breakdown</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1">
                                            Submit Request
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search requests..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Request List */}
                    <div className="space-y-4">
                        {filteredRequests.filter(r => r.status !== "CONVERTED_TO_WO").map(request => {
                            const priorityConfig = getPriorityConfig(request.priority);
                            const statusConfig = getStatusConfig(request.status);
                            const PriorityIcon = priorityConfig.icon;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <Card key={request.id} className={cn("border-l-4", priorityConfig.color.split(' ')[2])}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg">{request.title}</h3>
                                                    <Badge variant="outline" className={priorityConfig.color}>
                                                        <PriorityIcon className="h-3 w-3 mr-1" />
                                                        {priorityConfig.label}
                                                    </Badge>
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mb-3">
                                                    {request.number} • Submitted {format(new Date(request.submittedDate), "MMM dd, yyyy HH:mm")}
                                                </div>
                                            </div>
                                            {request.priorityScore && (
                                                <div className="text-right">
                                                    <div className="text-xs text-muted-foreground">Priority Score</div>
                                                    <div className="text-2xl font-bold">{request.priorityScore}</div>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm mb-3">{request.description}</p>

                                        <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>{request.requestorName}</span>
                                            </div>
                                            {request.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>{request.location}</span>
                                                </div>
                                            )}
                                            {request.assetName && (
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                                    <span>{request.assetName}</span>
                                                </div>
                                            )}
                                        </div>

                                        {request.status === "APPROVED" && !request.workOrderId && (
                                            <Button
                                                onClick={() => handleConvertToWO(request.id)}
                                                size="sm"
                                                className="w-full"
                                            >
                                                <ArrowRight className="h-4 w-4 mr-2" />
                                                Convert to Work Order
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    {/* Same as inbox but shows all */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search all requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {filteredRequests.map(request => {
                            const priorityConfig = getPriorityConfig(request.priority);
                            const statusConfig = getStatusConfig(request.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <Card key={request.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm text-muted-foreground">{request.number}</span>
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                    {request.workOrderId && (
                                                        <Badge variant="outline" className="bg-green-50 text-green-800">
                                                            WO: {request.workOrderId}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="font-medium">{request.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {request.requestorName} • {format(new Date(request.submittedDate), "MMM dd, yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="converted" className="space-y-4">
                    <div className="space-y-4">
                        {requests.filter(r => r.status === "CONVERTED_TO_WO").map(request => {
                            const statusConfig = getStatusConfig(request.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <Card key={request.id} className="border-green-200">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                    <Badge className="bg-green-600">WO: {request.workOrderId}</Badge>
                                                </div>
                                                <div className="font-bold text-lg mb-1">{request.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Converted on {request.reviewedDate && format(new Date(request.reviewedDate), "MMM dd, yyyy HH:mm")}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm mb-3">{request.description}</p>
                                        <Button variant="outline" size="sm">View Work Order</Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ServiceRequestPortal;
