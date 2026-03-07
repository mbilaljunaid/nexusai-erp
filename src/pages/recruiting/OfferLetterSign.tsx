import { formatDate, formatDateTime } from "@/lib/dateUtils";
import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle2, XCircle, PenLine, Eye } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EsigDoc {
    id: string; document_type: string; applicant_id: string; candidate_name: string;
    candidate_email: string; status: string; sent_at: string; opened_at: string;
    signed_at: string; expires_at: string; created_at: string;
}
interface EsigSummary { pending: number; sent: number; signed: number; declined: number; expired: number; }

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Pending: { bg: '#f3f4f6', color: '#6b7280' },
    Sent: { bg: '#eff6ff', color: '#1d4ed8' },
    Opened: { bg: '#fef3c7', color: '#d97706' },
    Signed: { bg: '#d1fae5', color: '#059669' },
    Declined: { bg: '#fee2e2', color: '#dc2626' },
    Expired: { bg: '#f3f4f6', color: '#9ca3af' },
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
            <div style={{ marginBottom: 16 }}>

                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Digital signature collection · Audit trail · Expiry enforcement</p>
            </div>

            {/* KPI bar */}
            {summary && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    {([['Pending', summary.pending, '#6b7280'], ['Sent', summary.sent, '#1d4ed8'], ['Signed', summary.signed, '#059669'], ['Declined', summary.declined, '#dc2626'], ['Expired', summary.expired, '#9ca3af']] as [string, number, string][]).map(([l, v, c]) => (
                        <div key={l} style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 14px' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: c }}>{v ?? 0}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{l}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {(['docs', 'new', 'sign'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {t === 'docs' ? `All Documents (${docs.length})` : t === 'new' ? '+ New Document' : '✍ Sign Document'}
                    </button>
                ))}
            </div>

            {/* Documents list */}
            {tab === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {docs.map(d => {
                        const cfg = STATUS_CFG[d.status] ?? STATUS_CFG.Pending;
                        return (
                            <div key={d.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <FileText size={14} color="#9ca3af" />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{d.document_type.replace(/_/g, ' ')} — {d.candidate_name ?? d.applicant_id}</div>
                                        <div style={{ fontSize: 11, color: '#6b7280' }}>{d.candidate_email ?? '—'} · Created {fmtDate(d.created_at)} · Expires {fmtDate(d.expires_at)}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{d.status}</span>
                                    {d.status === 'Pending' && <button onClick={() => sendMut.mutate(d.id)} style={{ padding: '4px 10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>Send</button>}
                                    {(d.status === 'Sent' || d.status === 'Opened') && <button onClick={() => { setSignDocId(d.id); setTab('sign'); setSigned(false); }} style={{ padding: '4px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>Sign</button>}
                                    {d.status !== 'Signed' && d.status !== 'Declined' && <button onClick={() => declineMut.mutate(d.id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>Decline</button>}
                                    <button onClick={() => setAuditDoc(auditDoc?.id === d.id ? null : d)} style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Eye size={10} />Trail</button>
                                </div>
                            </div>
                        );
                    })}
                    {docs.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No documents — create a new offer letter or agreement</div>}
                    {/* Audit trail inline */}
                    {auditDoc && audit && (
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Audit Trail — {auditDoc.candidate_name}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {(audit.audit_trail as any[] ?? []).map((ev: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 11, alignItems: 'center' }}>
                                        <span style={{ padding: '1px 7px', borderRadius: 4, background: '#111827', color: '#fff', fontSize: 10 }}>{ev.event}</span>
                                        <span style={{ color: '#6b7280' }}>{formatDateTime(ev.at)}</span>
                                        {ev.ip && <span style={{ color: '#9ca3af' }}>IP: {ev.ip}</span>}
                                        {ev.reason && <span style={{ color: '#dc2626' }}>Reason: {ev.reason}</span>}
                                    </div>
                                ))}
                                {(audit.audit_trail as any[] ?? []).length === 0 && <span style={{ fontSize: 11, color: '#9ca3af' }}>No audit events yet</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* New Document form */}
            {tab === 'new' && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, maxWidth: 640 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Create New Document</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Label style={{ fontSize: 10, fontWeight: 700 }}>Document Type</Label>
                            <Select value={form.documentType} onValueChange={v => setForm(p => ({ ...p, documentType: v }))}>
                                <SelectTrigger style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12 }} aria-label="Document type"><SelectValue /></SelectTrigger>
                                <SelectContent>{['OFFER_LETTER', 'NDA', 'EMPLOYMENT_AGREEMENT', 'POLICY_ACK', 'BACKGROUND_CONSENT'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {[['applicantId', 'Applicant ID', 'text'], ['candidateName', 'Candidate Name', 'text'], ['candidateEmail', 'Candidate Email', 'email'], ['expiresInDays', 'Expires In (days)', 'number']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Label style={{ fontSize: 10, fontWeight: 700 }}>{l}</Label>
                                <Input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="h-9 text-xs" aria-label={l} />
                            </div>
                        ))}
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Label style={{ fontSize: 10, fontWeight: 700 }}>Document Content (HTML)</Label>
                            <Textarea rows={4} value={form.htmlContent} onChange={e => setForm(p => ({ ...p, htmlContent: e.target.value }))} placeholder="<p>Dear Candidate, we are delighted to offer you...</p>" className="font-mono text-xs resize-y" aria-label="Document content" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                        <button onClick={() => setTab('docs')} style={{ padding: '7px 16px', background: '#f3f4f6', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.applicantId || createMut.isPending} onClick={() => createMut.mutate(form)} style={{ padding: '7px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Create Document</button>
                    </div>
                </div>
            )}

            {/* Sign document */}
            {tab === 'sign' && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, maxWidth: 540 }}>
                    {signed ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>
                            <CheckCircle2 size={40} color="#059669" style={{ marginBottom: 10 }} />
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>Document Signed Successfully</div>
                            <button onClick={() => setTab('docs')} style={{ marginTop: 14, padding: '8px 18px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Back to Documents</button>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Sign Document</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                                <Label style={{ fontSize: 10, fontWeight: 700 }}>Document ID</Label>
                                <Input value={signDocId} onChange={e => setSignDocId(e.target.value)} placeholder="Paste document ID or use Send → Sign from list" className="h-9 text-xs" aria-label="Document ID" />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <PenLine size={12} /> Draw your signature below
                            </div>
                            <canvas ref={canvasRef} width={500} height={120} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                                style={{ border: '2px dashed #e5e7eb', borderRadius: 8, cursor: 'crosshair', touchAction: 'none', width: '100%', display: 'block', background: '#fafafa' }} />
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                                <button onClick={clearCanvas} style={{ padding: '6px 14px', background: '#f3f4f6', border: 'none', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>Clear</button>
                                <button onClick={() => setTab('docs')} style={{ padding: '6px 14px', background: '#f3f4f6', border: 'none', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                <button disabled={!signDocId || signMut.isPending} onClick={() => signMut.mutate({ id: signDocId, sig: captureSignature() })} style={{ padding: '6px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Submit Signature</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </StandardPage>
    );
}
