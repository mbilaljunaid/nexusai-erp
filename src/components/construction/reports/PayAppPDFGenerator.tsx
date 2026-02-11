import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { format } from "date-fns";

// Define styles for AIA G702/G703 format
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: "Helvetica"
    },
    header: {
        marginBottom: 20,
        borderBottom: "1pt solid #000"
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center"
    },
    subtitle: {
        fontSize: 10,
        marginBottom: 10,
        textAlign: "center"
    },
    section: {
        marginBottom: 15
    },
    row: {
        flexDirection: "row",
        borderBottom: "0.5pt solid #ccc",
        paddingVertical: 4
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#f0f0f0",
        borderTop: "1pt solid #000",
        borderBottom: "1pt solid #000",
        paddingVertical: 5,
        fontWeight: "bold"
    },
    col1: { width: "8%", paddingHorizontal: 3 },
    col2: { width: "40%", paddingHorizontal: 3 },
    col3: { width: "13%", paddingHorizontal: 3, textAlign: "right" },
    col4: { width: "13%", paddingHorizontal: 3, textAlign: "right" },
    col5: { width: "13%", paddingHorizontal: 3, textAlign: "right" },
    col6: { width: "13%", paddingHorizontal: 3, textAlign: "right" },
    infoGrid: {
        flexDirection: "row",
        marginBottom: 10
    },
    infoColumn: {
        flex: 1,
        paddingRight: 10
    },
    infoLabel: {
        fontSize: 7,
        color: "#666",
        marginBottom: 2
    },
    infoValue: {
        fontSize: 9,
        marginBottom: 8
    },
    totalRow: {
        flexDirection: "row",
        paddingVertical: 5,
        borderTop: "1pt solid #000",
        marginTop: 5
    },
    signatureSection: {
        marginTop: 30,
        borderTop: "1pt solid #000",
        paddingTop: 15
    },
    signatureRow: {
        flexDirection: "row",
        marginBottom: 20
    },
    signatureBlock: {
        flex: 1,
        paddingRight: 20
    },
    signatureLine: {
        borderTop: "1pt solid #000",
        marginTop: 30,
        marginBottom: 5
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 7,
        color: "#666",
        textAlign: "center",
        borderTop: "0.5pt solid #ccc",
        paddingTop: 5
    }
});

interface PayAppLineItem {
    itemNumber: string;
    description: string;
    scheduledValue: number;
    workCompleted: number;
    materialsStored: number;
    totalCompleted: number;
}

export interface PayAppData {
    applicationNumber: number;
    periodEnding: string;
    projectNumber: string;
    projectName: string;
    contractorName: string;
    ownerName: string;
    contractDate: string;
    originalContractSum: number;
    changeOrders: number;
    currentContractSum: number;
    lineItems: PayAppLineItem[];
    retainageRate: number;
    companyName?: string;
    companyLogo?: string;
}

export function PayAppPDFDocument({ data }: { data: PayAppData }) {
    const totalScheduled = data.lineItems.reduce((sum, item) => sum + item.scheduledValue, 0);
    const totalCompleted = data.lineItems.reduce((sum, item) => sum + item.totalCompleted, 0);
    const retainageAmount = totalCompleted * (data.retainageRate / 100);
    const amountDue = totalCompleted - retainageAmount;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        APPLICATION AND CERTIFICATE FOR PAYMENT
                    </Text>
                    <Text style={styles.subtitle}>
                        AIA Document G702™ – 1992
                    </Text>
                </View>

                {/* Project Information */}
                <View style={styles.section}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>TO (Owner):</Text>
                            <Text style={styles.infoValue}>{data.ownerName}</Text>
                        </View>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>FROM (Contractor):</Text>
                            <Text style={styles.infoValue}>{data.contractorName}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>PROJECT:</Text>
                            <Text style={styles.infoValue}>{data.projectName}</Text>
                        </View>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>PROJECT NO:</Text>
                            <Text style={styles.infoValue}>{data.projectNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>APPLICATION NO:</Text>
                            <Text style={styles.infoValue}>#{data.applicationNumber}</Text>
                        </View>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>PERIOD ENDING:</Text>
                            <Text style={styles.infoValue}>{format(new Date(data.periodEnding), "MMMM d, yyyy")}</Text>
                        </View>
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>CONTRACT DATE:</Text>
                            <Text style={styles.infoValue}>{format(new Date(data.contractDate), "MMMM d, yyyy")}</Text>
                        </View>
                    </View>
                </View>

                {/* Contract Summary */}
                <View style={styles.section}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>CONTRACT SUMMARY</Text>
                    <View style={styles.row}>
                        <Text style={{ flex: 1 }}>Original Contract Sum</Text>
                        <Text style={{ width: "20%", textAlign: "right" }}>
                            ${data.originalContractSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={{ flex: 1 }}>Net Change by Change Orders</Text>
                        <Text style={{ width: "20%", textAlign: "right" }}>
                            ${data.changeOrders.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={[styles.row, { borderBottom: "1pt solid #000", fontWeight: "bold" }]}>
                        <Text style={{ flex: 1 }}>Current Contract Sum</Text>
                        <Text style={{ width: "20%", textAlign: "right" }}>
                            ${data.currentContractSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* Line Items (G703 Continuation Sheet) */}
                <View style={styles.section}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>
                        CONTINUATION SHEET (G703)
                    </Text>
                    <View style={styles.headerRow}>
                        <Text style={styles.col1}>Item</Text>
                        <Text style={styles.col2}>Description</Text>
                        <Text style={styles.col3}>Scheduled Value</Text>
                        <Text style={styles.col4}>Work Complete</Text>
                        <Text style={styles.col5}>Materials Stored</Text>
                        <Text style={styles.col6}>Total Complete</Text>
                    </View>
                    {data.lineItems.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.col1}>{item.itemNumber}</Text>
                            <Text style={styles.col2}>{item.description}</Text>
                            <Text style={styles.col3}>
                                ${item.scheduledValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={styles.col4}>
                                ${item.workCompleted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={styles.col5}>
                                ${item.materialsStored.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={styles.col6}>
                                ${item.totalCompleted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.section}>
                    <View style={styles.totalRow}>
                        <Text style={{ flex: 1, fontWeight: "bold" }}>Total Work Completed and Stored to Date</Text>
                        <Text style={{ width: "20%", textAlign: "right", fontWeight: "bold" }}>
                            ${totalCompleted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={{ flex: 1 }}>Less Retainage ({data.retainageRate}%)</Text>
                        <Text style={{ width: "20%", textAlign: "right" }}>
                            ${retainageAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={[styles.totalRow, { backgroundColor: "#f0f0f0" }]}>
                        <Text style={{ flex: 1, fontWeight: "bold", fontSize: 11 }}>AMOUNT DUE THIS APPLICATION</Text>
                        <Text style={{ width: "20%", textAlign: "right", fontWeight: "bold", fontSize: 11 }}>
                            ${amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* Signatures */}
                <View style={styles.signatureSection}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 10 }}>CERTIFICATION</Text>
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBlock}>
                            <Text style={{ fontSize: 8, marginBottom: 5 }}>CONTRACTOR:</Text>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 7 }}>Signature</Text>
                            <Text style={{ fontSize: 8, marginTop: 3 }}>{data.contractorName}</Text>
                            <Text style={{ fontSize: 7, color: "#666" }}>Date: {format(new Date(), "MM/dd/yyyy")}</Text>
                        </View>
                        <View style={styles.signatureBlock}>
                            <Text style={{ fontSize: 8, marginBottom: 5 }}>ARCHITECT:</Text>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 7 }}>Signature</Text>
                            <Text style={{ fontSize: 7, color: "#666", marginTop: 10 }}>Date: _______________</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>
                        {data.companyName || "Construction Management"} • Application for Payment • Page 1 of 1
                    </Text>
                    <Text style={{ marginTop: 2 }}>
                        Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

// Helper function to generate and download PDF
export async function generatePayAppPDF(data: PayAppData, filename?: string) {
    const doc = <PayAppPDFDocument data={data} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `PayApp_${data.applicationNumber}_${format(new Date(data.periodEnding), "yyyy-MM-dd")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
