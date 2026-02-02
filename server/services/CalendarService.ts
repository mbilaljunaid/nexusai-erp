
export interface CalendarEvent {
    summary: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime: Date;
    organizer?: { name: string; email: string };
    attendee?: { name: string; email: string };
}

export class CalendarService {
    static generateICS(event: CalendarEvent): string {
        const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const now = formatDate(new Date());

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NexusAI//ERP Recruitment//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${now}-${Math.random().toString(36).substr(2, 9)}@nexusai.erp
DTSTAMP:${now}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.summary}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || "Remote"}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    }
}
