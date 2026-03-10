/**
 * statusUtils.ts
 * Centralized mapping from ERP status strings to Shadcn Badge variant names.
 * Use <StatusBadge status={...} /> instead of hardcoding Badge className colors.
 */

import type { BadgeProps } from "@/components/ui/badge";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/** Maps a status string to the appropriate Badge variant */
export function getStatusVariant(status: string | null | undefined): BadgeVariant {
    if (!status) return "outline";

    const normalized = status.trim().toUpperCase().replace(/[-\s]/g, "_");

    switch (normalized) {
        // ── Success / Green ────────────────────────────────────────────────────
        case "ACTIVE":
        case "ACTIVATED":
        case "APPROVED":
        case "COMPLETED":
        case "COMPLETE":
        case "CONFIRMED":
        case "PAID":
        case "POSTED":
        case "MATCHED":
        case "RECONCILED":
        case "PUBLISHED":
        case "QUALIFIED":
        case "GRADUATED":
        case "PROCESSED":
        case "PASSED":
        case "PASS":
        case "ON_TRACK":
        case "SUCCESS":
        case "SUCCESSFUL":
        case "ACCEPTED":
        case "VERIFIED":
        case "VALID":
        case "VALID_":
        case "HEALTHY":
        case "RESOLVED":
        case "WON":
            return "success";

        // ── Warning / Amber ────────────────────────────────────────────────────
        case "PENDING":
        case "PENDING_APPROVAL":
        case "PENDING_REVIEW":
        case "IN_PROGRESS":
        case "IN_REVIEW":
        case "DRAFT":
        case "OPEN":
        case "PROCESSING":
        case "SUBMITTED":
        case "UNDER_REVIEW":
        case "SHORTLISTED":
        case "SCHEDULED":
        case "PARTIALLY_PAID":
        case "PARTIAL":
        case "LATE":
        case "AT_RISK":
        case "REVIEW":
        case "REVIEWING":
        case "NEEDS_REVIEW":
            return "warning";

        // ── Destructive / Red ──────────────────────────────────────────────────
        case "REJECTED":
        case "DECLINED":
        case "FAILED":
        case "FAILURE":
        case "ERROR":
        case "OVERDUE":
        case "CANCELLED":
        case "CANCELED":
        case "VOIDED":
        case "VOID":
        case "TERMINATED":
        case "EXPIRED":
        case "LOST":
        case "BLOCKED":
        case "HIGH":          // risk level
        case "CRITICAL":      // priority
        case "URGENT":
            return "destructive";

        // ── Secondary / Grey ───────────────────────────────────────────────────
        case "INACTIVE":
        case "CLOSED":
        case "SUSPENDED":
        case "ON_HOLD":
        case "DEACTIVATED":
        case "DISABLED":
        case "ARCHIVED":
        case "RETIRED":
        case "CANCELLED_BY_CUSTOMER":
        case "N/A":
        case "NA":
        case "NOT_STARTED":
        case "LOW":           // risk level
        case "MEDIUM":        // risk level (neutral)
            return "secondary";

        // ── Default ────────────────────────────────────────────────────────────
        default:
            return "outline";
    }
}

/** Formats a status string for display: replaces underscores/hyphens with spaces and title-cases */
export function formatStatusLabel(status: string | null | undefined): string {
    if (!status) return "";
    return status
        .replace(/[_-]/g, " ")
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
