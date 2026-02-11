import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: "Helvetica"
    },
    header: {
        marginBottom: 20,
        borderBottom: "2pt solid #000",
        paddingBottom: 10
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
        marginBottom: 3
    },
    section: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
        backgroundColor: "#f0f0f0",
        padding: 5
    },
    recordCard: {
        border: "1pt solid #ddd",
        borderRadius: 4,
        padding: 10,
        marginBottom: 10
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
        paddingBottom: 5,
        borderBottom: "0.5pt solid #ddd"
    },
    recordNumber: {
        fontSize: 11,
        fontWeight: "bold"
    },
    badge: {
        fontSize: 8,
        backgroundColor: "#e0e0e0",
        padding: "2 6",
        borderRadius: 3
    },
    badgeApproved: {
        backgroundColor: "#d4edda",
        color: "#155724"
    },
    badgePending: {
        backgroundColor: "#fff3cd",
        color: "#856404"
    },
    badgeExpired: {
        backgroundColor: "#f8d7da",
        color: "#721c24"
    },
    recordDetail: {
        marginVertical: 3
    },
    label: {
        fontSize: 8,
        color: "#666",
        marginBottom: 1
    },
    value: {
        fontSize: 10
    },
    alertBox: {
        backgroundColor: "#fff3cd",
        border: "1pt solid #ffeeba",
        borderRadius: 4,
        padding: 8,
        marginTop: 5
    },
    alertText: {
        fontSize: 9,
        color: "#856404"
    },
    summaryGrid: {
        flexDirection: "row",
        marginBottom: 15
    },
    summaryCard: {
        flex: 1,
        border: "1pt solid #ddd",
        borderRadius: 4,
        padding: 10,
        marginRight: 10
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 3
    },
    summaryLabel: {
        fontSize: 9,
        color: "#666"
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: "#666",
        textAlign: "center",
        borderTop: "0.5pt solid #ccc",
        paddingTop: 5
    }
});

interface ComplianceRecord {
    id: string;
    recordNumber: string;
    category: string;
    title: string;
    status: "PENDING" | "APPROVED" | "EXPIRED" | "REJECTED";
    issuedDate: string;
    expiryDate?: string;
    issuingAuthority: string;
    notes?: string;
    attachments?: number;
}

interface ComplianceReportData {
    projectName: string;
    projectNumber: string;
    reportDate: string;
    records: ComplianceRecord[];
    companyName?: string;
}

export function CompliancePDFDocument({ data }: { data: ComplianceReportData }) {
    const stats = {
        total: data.records.length,
        approved: data.records.filter(r => r.status === "APPROVED").length,
        pending: data.records.filter(r => r.status === "PENDING").length,
        expired: data.records.filter(r => r.status === "EXPIRED").length,
        expiringSoon: data.records.filter(r => {
            if (!r.expiryDate) return false;
            const daysUntilExpiry = Math.floor((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).length
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case "APPROVED": return [styles.badge, styles.badgeApproved];
            case "PENDING": return [styles.badge, styles.badgePending];
            case "EXPIRED": return [styles.badge, styles.badgeExpired];
            default: return styles.badge;
        }
    };

    const getExpiryWarning = (expiryDate?: string) => {
        if (!expiryDate) return null;
        const daysUntilExpiry = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) return `EXPIRED ${Math.abs(daysUntilExpiry)} days ago`;
        if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days - ACTION REQUIRED`;
        return null;
    };

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Compliance Report</Text>
                    <Text style={styles.subtitle}>{data.projectName}</Text>
                    <Text style={styles.subtitle}>Project #{data.projectNumber}</Text>
                    <Text style={{ fontSize: 9, color: "#666", marginTop: 5 }}>
                        Report Generated: {format(new Date(data.reportDate), "MMMM d, yyyy")}
                    </Text>
                </View>

                {/* Summary Statistics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryValue}>{stats.total}</Text>
                            <Text style={styles.summaryLabel}>Total Records</Text>
                        </View>
                        <View style={[styles.summaryCard, { borderColor: "#28a745" }]}>
                            <Text style={[styles.summaryValue, { color: "#28a745" }]}>{stats.approved}</Text>
                            <Text style={styles.summaryLabel}>Approved</Text>
                        </View>
                        <View style={[styles.summaryCard, { borderColor: "#ffc107" }]}>
                            <Text style={[styles.summaryValue, { color: "#ffc107" }]}>{stats.pending}</Text>
                            <Text style={styles.summaryLabel}>Pending</Text>
                        </View>
                        <View style={[styles.summaryCard, { borderColor: "#dc3545", marginRight: 0 }]}>
                            <Text style={[styles.summaryValue, { color: "#dc3545" }]}>{stats.expiringSoon}</Text>
                            <Text style={styles.summaryLabel}>Expiring Soon</Text>
                        </View>
                    </View>
                </View>

                {/* Expiring Records Alert */}
                {stats.expiringSoon > 0 && (
                    <View style={styles.section}>
                        <View style={styles.alertBox}>
                            <Text style={[styles.alertText, { fontWeight: "bold", marginBottom: 3 }]}>
                                ⚠ {stats.expiringSoon} record(s) expiring within 30 days - Immediate action required
                            </Text>
                        </View>
                    </View>
                )}

                {/* Compliance Records */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compliance Records</Text>
                    {data.records.map(record => {
                        const expiryWarning = getExpiryWarning(record.expiryDate);
                        return (
                            <View key={record.id} style={styles.recordCard}>
                                <View style={styles.recordHeader}>
                                    <Text style={styles.recordNumber}>{record.recordNumber}</Text>
                                    <Text style={getStatusBadgeStyle(record.status)}>{record.status}</Text>
                                </View>

                                <View style={styles.recordDetail}>
                                    <Text style={styles.label}>Category</Text>
                                    <Text style={styles.value}>{record.category}</Text>
                                </View>

                                <View style={styles.recordDetail}>
                                    <Text style={styles.label}>Title</Text>
                                    <Text style={styles.value}>{record.title}</Text>
                                </View>

                                <View style={{ flexDirection: "row", marginVertical: 3 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Issuing Authority</Text>
                                        <Text style={styles.value}>{record.issuingAuthority}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Issued Date</Text>
                                        <Text style={styles.value}>{format(new Date(record.issuedDate), "MMM d, yyyy")}</Text>
                                    </View>
                                </View>

                                {record.expiryDate && (
                                    <View style={styles.recordDetail}>
                                        <Text style={styles.label}>Expiry Date</Text>
                                        <Text style={styles.value}>{format(new Date(record.expiryDate), "MMM d, yyyy")}</Text>
                                    </View>
                                )}

                                {expiryWarning && (
                                    <View style={[styles.alertBox, { marginTop: 5 }]}>
                                        <Text style={styles.alertText}>{expiryWarning}</Text>
                                    </View>
                                )}

                                {record.notes && (
                                    <View style={[styles.recordDetail, { marginTop: 5 }]}>
                                        <Text style={styles.label}>Notes</Text>
                                        <Text style={[styles.value, { fontSize: 9, fontStyle: "italic" }]}>{record.notes}</Text>
                                    </View>
                                )}

                                {record.attachments && record.attachments > 0 && (
                                    <View style={[styles.recordDetail, { marginTop: 3 }]}>
                                        <Text style={{ fontSize: 8, color: "#666" }}>
                                            📎 {record.attachments} attachment(s)
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>
                        {data.companyName || "Construction Management"} • Compliance Report • Page 1 of 1
                    </Text>
                    <Text style={{ marginTop: 2 }}>
                        This report contains {data.records.length} compliance record(s) as of {format(new Date(data.reportDate), "MMMM d, yyyy")}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

// Helper function to generate and download PDF
export async function generateCompliancePDF(data: ComplianceReportData, filename?: string) {
    const doc = <CompliancePDFDocument data={data} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `Compliance_Report_${data.projectNumber}_${format(new Date(data.reportDate), "yyyy-MM-dd")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
