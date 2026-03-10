import { formatDate, formatDateTime } from "@/lib/dateUtils";
import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle2, XCircle, PenLine, Eye } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EsigDoc {
    id: string; document_type: string; applicant_id: string; candidate_name: string;
    candidate_email: string; status: string; sent_at: string; opened_at: string;
    signed_at: string; expires_at: string; created_at: string;
}
interface EsigSummary { pending: number; sent: number; signed: number; declined: number; expired: number; }

const STATUS_CFG: Record<string, { bg: string; text: string; borderL: string }> = {
    Pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', borderL: 'border-l-gray-500' },
    Sent: { bg: 'bg-blue-50 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', borderL: 'border-l-blue-600' },
    Opened: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-600 dark:text-amber-400', borderL: 'border-l-amber-500' },
    Signed: { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-400', borderL: 'border-l-emerald-600' },
    Declined: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-400', borderL: 'border-l-red-600' },
    Expired: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-400', borderL: 'border-l-gray-400' },
};

function fmtDate(d: string) { return d ? formatDate(d) : '—'; }

export default function OfferLetterSign() {
    const [tab, setTab] = useState<'docs' | 'new' | 'sign'>('docs');
    const [signDocId, setSignDocId] = useState('');
    const [form, setForm] = useState({ documentType: 'OFFER_LETTER', applicantId: '', candidateName: '', candidateEmail: '', htmlContent: '', expiresInDays: '7' });
    const [auditDoc, setAuditDoc] = useState<EsigDoc | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [signed, setSigned] = useState(false);
    const qc = useQueryClient();

    const { data: summary } = useQuery<EsigSummary>({ queryKey: ['esig-summary'], queryFn: () => fetch('/api/recruiting/esignature/summary').then(r => r.json()) });
    const { data: docs = [] } = useQuery<EsigDoc[]>({ queryKey: ['esig-docs'], queryFn: () => fetch('/api/recruiting/esignature/documents').then(r => r.json()) });
    const { data: audit } = useQuery<any>({ queryKey: ['esig-audit', auditDoc?.id], enabled: !!auditDoc, queryFn: () => fetch(`/api/recruiting/esignature/documents/${auditDoc!.id}/audit`).then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/recruiting/esignature/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['esig-docs', 'esig-summary'] }); setTab('docs'); } });
    const sendMut = useMutation({ mutationFn: (id: string) => fetch(`/api/recruiting/esignature/documents/${id}/send`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['esig-docs', 'esig-summary'] }) });
    const signMut = useMutation({
        mutationFn: ({ id, sig }: { id: string; sig: string }) => fetch(`/api/recruiting/esignature/documents/${id}/sign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signatureData: sig }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['esig-docs', 'esig-summary'] }); setSigned(true); }
    });
    const declineMut = useMutation({ mutationFn: (id: string) => fetch(`/api/recruiting/esignature/documents/${id}/decline`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['esig-docs', 'esig-summary'] }) });

    // ─── Canvas draw helpers ───────────────────────────────────────────────────
    const startDraw = (e: React.MouseEvent) => { setDrawing(true); const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; const r = canvasRef.current!.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); };
    const draw = (e: React.MouseEvent) => { if (!drawing) return; const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; const r = canvasRef.current!.getBoundingClientRect(); ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); };
    const endDraw = () => setDrawing(false);
    const clearCanvas = () => { const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; ctx.clearRect(0, 0, 500, 120); };
    const captureSignature = () => canvasRef.current?.toDataURL('image/png') ?? '';

    return (
        <StandardPage title="E-Signature &amp; Offer Letters">
            <div className="mb-4">

                <p className="text-[13px] text-muted-foreground mt-1">Digital signature collection · Audit trail · Expiry enforcement</p>
            </div>

            {/* KPI bar */}
            {summary && (
                <div className="flex gap-[10px] mb-[14px]">
                    {([['Pending', summary.pending, STATUS_CFG.Pending], ['Sent', summary.sent, STATUS_CFG.Sent], ['Signed', summary.signed, STATUS_CFG.Signed], ['Declined', summary.declined, STATUS_CFG.Declined], ['Expired', summary.expired, STATUS_CFG.Expired]] as [string, number, typeof STATUS_CFG.Pending][]).map(([l, v, c]) => (
                        <div key={l} className={cn("flex-1 bg-card border border-border border-l-4 rounded-[10px] py-2.5 px-3.5", c.borderL)}>
                            <div className={cn("text-[22px] font-extrabold font-mono", c.text)}>{v ?? 0}</div>
                            <div className="text-[11px] text-muted-foreground">{l}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-3">
                {(['docs', 'new', 'sign'] as const).map(t => (
                    <Button variant={tab === t ? "default" : "secondary"} size="sm" key={t} onClick={() => setTab(t)}>
                        {t === 'docs' ? `All Documents (${docs.length})` : t === 'new' ? '+ New Document' : '✍ Sign Document'}
                    </Button>
                ))}
            </div>

            {/* Documents list */}
            {tab === 'docs' && (
                <div className="flex flex-col gap-[6px]">
                    {docs.map(d => {
                        const cfg = STATUS_CFG[d.status] ?? STATUS_CFG.Pending;
                        return (
                            <div key={d.id} className="bg-card rounded-[10px] py-[12px] px-[16px] flex justify-between items-center border border-border">
                                <div className="flex gap-3 items-center">
                                    <FileText className="h-3.5 w-3.5" color="#9ca3af" />
                                    <div>
                                        <div className="text-[13px] font-bold">{d.document_type.replace(/_/g, ' ')} — {d.candidate_name ?? d.applicant_id}</div>
                                        <div className="text-[11px] text-muted-foreground">{d.candidate_email ?? '—'} · Created {fmtDate(d.created_at)} · Expires {fmtDate(d.expires_at)}</div>
                                    </div>
                                </div>
                                <div className="flex gap-[6px] items-center">
                                    <span className={cn("py-[3px] px-[10px] rounded-full text-[10px] font-bold", cfg.bg, cfg.text)}>{d.status}</span>
                                    {d.status === 'Pending' && <Button variant="default" size="sm" onClick={() => sendMut.mutate(d.id)} >Send</Button>}
                                    {(d.status === 'Sent' || d.status === 'Opened') && <Button variant="default" size="sm" onClick={() => { setSignDocId(d.id); setTab('sign'); setSigned(false); }} >Sign</Button>}
                                    {d.status !== 'Signed' && d.status !== 'Declined' && <Button variant="destructive" size="sm" onClick={() => declineMut.mutate(d.id)} >Decline</Button>}
                                    <Button variant="secondary" size="sm" onClick={() => setAuditDoc(auditDoc?.id === d.id ? null : d)} className="flex items-center gap-1"><Eye className="h-2.5 w-2.5" />Trail</Button>
                                </div>
                            </div>
                        );
                    })}
                    {docs.length === 0 && <div className="text-center text-muted-foreground p-8">No documents — create a new offer letter or agreement</div>}
                    {/* Audit trail inline */}
                    {auditDoc && audit && (
                        <div className="rounded-[10px] p-[14px] bg-muted/30 border border-border">
                            <div className="text-[12px] font-bold mb-2">Audit Trail — {auditDoc.candidate_name}</div>
                            <div className="flex flex-col gap-[6px]">
                                {(audit.audit_trail as any[] ?? []).map((ev: any, i: number) => (
                                    <div key={i} className="flex gap-[10px] text-[11px] items-center">
                                        <span className="py-[1px] px-[7px] rounded text-[10px] bg-foreground text-background">{ev.event}</span>
                                        <span className="text-muted-foreground">{formatDateTime(ev.at)}</span>
                                        {ev.ip && <span className="text-muted-foreground">IP: {ev.ip}</span>}
                                        {ev.reason && <span className="text-destructive">Reason: {ev.reason}</span>}
                                    </div>
                                ))}
                                {(audit.audit_trail as any[] ?? []).length === 0 && <span className="text-[11px] text-muted-foreground">No audit events yet</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* New Document form */}
            {tab === 'new' && (
                <div className="bg-card rounded-xl p-5 border border-border max-w-2xl">
                    <div className="text-[14px] font-bold mb-[14px]">Create New Document</div>
                    <div className="grid gap-[10px] grid-cols-2">
                        <div className="flex flex-col gap-[3px]">
                            <Label className="text-[10px] font-bold">Document Type</Label>
                            <Select value={form.documentType} onValueChange={v => setForm(p => ({ ...p, documentType: v }))}>
                                <SelectTrigger className="py-[7px] px-[10px] rounded-[7px] text-[12px] border-border" aria-label="Document type"><SelectValue /></SelectTrigger>
                                <SelectContent>{['OFFER_LETTER', 'NDA', 'EMPLOYMENT_AGREEMENT', 'POLICY_ACK', 'BACKGROUND_CONSENT'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {[['applicantId', 'Applicant ID', 'text'], ['candidateName', 'Candidate Name', 'text'], ['candidateEmail', 'Candidate Email', 'email'], ['expiresInDays', 'Expires In (days)', 'number']].map(([k, l, t]) => (
                            <div key={k} className="flex flex-col gap-[3px]">
                                <Label className="text-[10px] font-bold">{l}</Label>
                                <Input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="h-9 text-xs" aria-label={l} />
                            </div>
                        ))}
                        <div className="flex flex-col gap-[3px] col-span-2">
                            <Label className="text-[10px] font-bold">Document Content (HTML)</Label>
                            <Textarea rows={4} value={form.htmlContent} onChange={e => setForm(p => ({ ...p, htmlContent: e.target.value }))} placeholder="<p>Dear Candidate, we are delighted to offer you...</p>" className="font-mono text-xs resize-y" aria-label="Document content" />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-[14px]">
                        <Button variant="secondary" size="sm" onClick={() => setTab('docs')} >Cancel</Button>
                        <Button variant="default" size="sm" disabled={!form.applicantId || createMut.isPending} onClick={() => createMut.mutate(form)} >Create Document</Button>
                    </div>
                </div>
            )}

            {/* Sign document */}
            {tab === 'sign' && (
                <div className="bg-card rounded-xl p-5 border border-border max-w-xl">
                    {signed ? (
                        <div className="text-center p-8">
                            <CheckCircle2 className="h-10 w-10 mb-[10px] text-emerald-600 dark:text-emerald-400 mx-auto" />
                            <div className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400">Document Signed Successfully</div>
                            <Button variant="secondary" size="sm" onClick={() => setTab('docs')} className="mt-3.5">Back to Documents</Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-[14px] font-bold mb-[10px]">Sign Document</div>
                            <div className="flex flex-col gap-1 mb-3">
                                <Label className="text-[10px] font-bold">Document ID</Label>
                                <Input value={signDocId} onChange={e => setSignDocId(e.target.value)} placeholder="Paste document ID or use Send → Sign from list" className="h-9 text-xs" aria-label="Document ID" />
                            </div>
                            <div className="text-[11px] font-bold mb-[6px] text-foreground flex items-center gap-1">
                                <PenLine className="h-3 w-3" /> Draw your signature below
                            </div>
                            <canvas ref={canvasRef} width={500} height={120} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} className="border-2 border-dashed border-border rounded-md cursor-crosshair touch-none w-full block bg-muted/20" />
                            <div className="flex gap-2 justify-end mt-[10px]">
                                <Button variant="secondary" size="sm" onClick={clearCanvas} >Clear</Button>
                                <Button variant="secondary" size="sm" onClick={() => setTab('docs')} >Cancel</Button>
                                <Button variant="default" size="sm" disabled={!signDocId || signMut.isPending} onClick={() => signMut.mutate({ id: signDocId, sig: captureSignature() })} >Submit Signature</Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </StandardPage>
    );
}
