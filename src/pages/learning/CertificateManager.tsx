import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar, FileCheck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { downloadFile } from "@/lib/utils";

interface Certificate {
    id: string;
    courseTitle: string;
    completedAt: string;
    expiresAt?: string;
    certificateNumber: string;
    isActive: boolean;
}

export default function CertificateManager() {
    const { data: certificates = [] } = useQuery<any>({
        queryKey: ["/api/learning/my-certificates"],
    });

    const downloadMutation = useMutation({
        mutationFn: async (certificateId: string) => {
            const res = await fetch(`/api/learning/certificates/${certificateId}/pdf`);
            const blob = await res.blob();
            downloadFile(blob, `certificate-${certificateId}.pdf`);
        },
    });

    const activeCerts = certificates.filter((c: Certificate) => c.isActive);

    const expiredCerts = certificates.filter((c: Certificate) => !c.isActive);

    return (
        <StandardPage title="My Certificates">
            {/* Header */}
            <div>

                <p className="text-muted-foreground">
                    View and download your compliance certificates
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Certificates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{certificates.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{activeCerts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Expired</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{expiredCerts.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Certificates */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Certificates</h2>
                {activeCerts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No active certificates</p>
                            <p className="text-sm">Complete courses to earn certificates</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCerts.map((cert: Certificate) => (
                            <Card key={cert.id} className="border-green-200 bg-green-50/30">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Award className="w-5 h-5 text-green-600" />
                                                <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
                                            </div>
                                            <CardDescription>
                                                Certificate #{cert.certificateNumber}
                                            </CardDescription>
                                        </div>
                                        <StatusBadge status="Active" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <FileCheck className="w-4 h-4" />
                                            Earned: {new Date(cert.completedAt).toLocaleDateString()}
                                        </div>
                                        {cert.expiresAt && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                Expires: {new Date(cert.expiresAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => downloadMutation.mutate(cert.id)}
                                        disabled={downloadMutation.isPending}
                                        className="w-full"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Expired Certificates */}
            {expiredCerts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Expired Certificates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {expiredCerts.map((cert: Certificate) => (
                            <Card key={cert.id} className="border-red-200 bg-red-50/30">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Award className="w-5 h-5 text-red-600" />
                                                <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
                                            </div>
                                            <CardDescription>
                                                Certificate #{cert.certificateNumber}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="destructive">Expired</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <FileCheck className="w-4 h-4" />
                                            Earned: {new Date(cert.completedAt).toLocaleDateString()}
                                        </div>
                                        {cert.expiresAt && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <Calendar className="w-4 h-4" />
                                                Expired: {new Date(cert.expiresAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1">
                                            Retake Course
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => downloadMutation.mutate(cert.id)}
                                            disabled={downloadMutation.isPending}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </StandardPage>
    );
}
