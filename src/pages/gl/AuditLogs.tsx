
import { AuditLogViewer } from "@/components/gl/AuditLogViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AuditLogsPage() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/gl/dashboard">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit & Compliance</h1>
                    <p className="text-muted-foreground mt-1">
                        Review immutable logs and manage data access.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AuditLogViewer />
            </div>
        </div>
    );
}
