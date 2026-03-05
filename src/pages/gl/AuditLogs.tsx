
import { AuditLogViewer } from "@/components/gl/AuditLogViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AuditLogsPage() {
    return (
        <StandardPage
            title="Audit & Compliance"
            description="Review immutable logs and manage data access."
            actions={<LedgerContextBadge />}
        >
            <div className="grid grid-cols-1 gap-6">
                <AuditLogViewer />
            </div>
        </StandardPage>
    );
}
