import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, MapPin, Gauge } from "lucide-react";

export default function IoT() {
  const [activeTab, setActiveTab] = useState("devices");

  const { data: devices = [] } = useQuery({ queryKey: ["/api/iot/devices"] });
  const { data: sensors = [] } = useQuery({ queryKey: ["/api/iot/sensors"] });
  const { data: jobs = [] } = useQuery({ queryKey: ["/api/field-service/jobs"] });

  const tabs = [
    { id: "devices", label: "IoT Devices", icon: Activity, count: devices.length },
    { id: "sensors", label: "Sensor Readings", icon: Gauge, count: sensors.length },
    { id: "jobs", label: "Field Service", icon: Zap, count: jobs.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IoT & Field Service</h1>
        <p className="text-muted-foreground mt-2">Manage IoT devices, sensor data, and field service jobs</p>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
            data-testid={`button-tab-${tab.id}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <Badge variant="secondary">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {activeTab === "devices" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device: any) => (
            <Card key={device.id} data-testid={`card-device-${device.id}`}>
              <CardHeader>
                <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                <Badge variant="outline">{device.deviceType}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{device.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={device.status === "active" ? "default" : "secondary"}>{device.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">S/N: {device.serialNumber}</div>
                <Button size="sm" variant="outline" className="w-full" data-testid={`button-edit-device-${device.id}`}>
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "sensors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensors.map((sensor: any) => (
            <Card key={sensor.id} data-testid={`card-sensor-${sensor.id}`}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{sensor.sensorType}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">{sensor.readingValue} {sensor.unit}</div>
                <div className="text-sm text-muted-foreground">Device: {sensor.deviceId}</div>
                <div className="text-sm text-muted-foreground">Reading time: {new Date(sensor.timestamp).toLocaleTimeString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Card key={job.id} data-testid={`card-job-${job.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{job.jobNumber}</h4>
                    <p className="text-sm text-muted-foreground">{job.technician}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={job.priority === "high" ? "destructive" : "secondary"}>{job.priority}</Badge>
                    <Badge variant={job.status === "completed" ? "default" : "outline"}>{job.status}</Badge>
                    <Button size="sm" variant="outline" data-testid={`button-update-job-${job.id}`}>
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
