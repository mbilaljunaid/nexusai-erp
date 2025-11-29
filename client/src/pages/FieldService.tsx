import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

export default function FieldService() {
  const technicians = [
    { id: "1", name: "John Smith", status: "in_progress", currentJob: "JOB-101", location: "Downtown", jobs: 4 },
    { id: "2", name: "Sarah Johnson", status: "available", currentJob: null, location: "West Side", jobs: 0 },
    { id: "3", name: "Mike Davis", status: "in_progress", currentJob: "JOB-105", location: "North District", jobs: 2 },
  ];

  const jobs = [
    { id: "JOB-101", customer: "ABC Corp", address: "123 Main St", priority: "high", status: "in_progress", duration: "2h", techId: "1" },
    { id: "JOB-102", customer: "XYZ Inc", address: "456 Oak Ave", priority: "medium", status: "pending", duration: "1.5h", techId: null },
    { id: "JOB-103", customer: "Tech Startup", address: "789 Pine Rd", priority: "low", status: "pending", duration: "1h", techId: null },
    { id: "JOB-104", customer: "Global Ltd", address: "321 Elm St", priority: "high", status: "assigned", duration: "3h", techId: "3" },
    { id: "JOB-105", customer: "Local Services", address: "555 Maple Dr", priority: "medium", status: "in_progress", duration: "2.5h", techId: "3" },
  ];

  const routes = [
    { id: "RT-001", techId: "1", jobs: 4, distance: "45.2 km", duration: "6h 30m", optimized: true },
    { id: "RT-002", techId: "3", jobs: 3, distance: "38.5 km", duration: "5h 45m", optimized: true },
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-blue-600 text-white",
    completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Field Service Management</h1>
          <p className="text-muted-foreground mt-2">Technician dispatch, routing & mobile tracking</p>
        </div>
        <Button data-testid="button-new-job">
          <Plus className="h-4 w-4 mr-2" />
          New Service Job
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Service Jobs</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        {/* Service Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 mt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{jobs.filter((j) => j.status === "in_progress").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{jobs.filter((j) => j.status === "pending").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">15.5h</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Service Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 border rounded-lg" data-testid={`job-${job.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{job.customer}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.address}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={priorityColors[job.priority as keyof typeof priorityColors]}>
                        {job.priority}
                      </Badge>
                      <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.duration}
                    </span>
                    <span className="text-muted-foreground">
                      {job.techId ? `Assigned to Tech #${job.techId}` : "Unassigned"}
                    </span>
                    {job.status === "pending" && (
                      <Button size="sm" variant="outline" data-testid={`button-assign-${job.id}`}>
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technicians Tab */}
        <TabsContent value="technicians" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Technicians</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {technicians.map((tech) => (
                <div key={tech.id} className="p-4 border rounded-lg flex items-start justify-between" data-testid={`technician-${tech.id}`}>
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      {tech.name}
                      <Badge
                        variant={tech.status === "available" ? "default" : "secondary"}
                      >
                        {tech.status}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Navigation className="h-3 w-3" />
                      Current: {tech.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Jobs: {tech.jobs}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-view-tech-${tech.id}`}>
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispatch New Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Select Technician</label>
                <select className="w-full p-2 border rounded mt-1" data-testid="select-technician">
                  <option>Sarah Johnson (Available)</option>
                  {technicians
                    .filter((t) => t.status === "available")
                    .map((t) => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                </select>
              </div>
              <Button className="w-full">Dispatch Job</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimized Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {routes.map((route) => {
                const techName = technicians.find((t) => t.id === route.techId)?.name;
                return (
                  <div key={route.id} className="p-4 border rounded-lg" data-testid={`route-${route.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{techName}'s Route</h4>
                        <p className="text-sm text-muted-foreground">
                          {route.jobs} jobs | {route.distance} | {route.duration}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <p className="font-medium text-xs mb-1">Optimized Sequence:</p>
                      <p className="text-xs text-muted-foreground">
                        JOB-101 → JOB-103 → JOB-105 → JOB-104
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3" data-testid={`button-view-route-${route.id}`}>
                      View Map
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Real-time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Map view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
