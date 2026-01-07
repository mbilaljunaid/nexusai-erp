import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";

export default function Calendar() {
  const { data: events = [] } = useQuery({ queryKey: ["/api/calendar/events"] });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          Calendar
        </h1>
        <p className="text-muted-foreground mt-2">Schedule meetings and manage events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event: any) => (
            <div key={event.id} className="p-3 border rounded-lg hover-elevate" data-testid={`event-${event.id}`}>
              <h3 className="font-medium">{event.title}</h3>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(event.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
