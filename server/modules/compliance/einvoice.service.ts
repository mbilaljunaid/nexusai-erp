import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * EInvoiceService — COMP-OG-01
 *
 * Multi-standard e-invoicing:
 * - ZATCA (Saudi Arabia Phase 2 — Fatoorah)
 * - SDI (Italy — Sistema di Interscambio)
 * - CFDI (Mexico — SAT)
 * - GST IRN (India — NIC IRP)
 * - PEPPOL (EU / international)
 *
 * Architecture: creates a canonical document record,
 * builds the jurisdiction-appropriate XML payload,
 * and tracks submission + acceptance lifecycle.
 */
export class EInvoiceService {

    /**
     * Generate and submit an e-invoice for a given AP/AR invoice
     */
    async submitInvoice(params: {
        tenantId: string;
        invoiceId: string;
        invoiceType: 'AP' | 'AR';
        standard: 'ZATCA' | 'SDI' | 'CFDI' | 'GST_IRN' | 'PEPPOL';
        countryCode: string;
        invoiceData: {
            invoiceNumber: string;
            issueDate: string;         // ISO date
            sellerName: string;
            sellerTaxId: string;
            buyerName: string;
            buyerTaxId: string;
            lineItems: Array<{
                description: string;
                quantity: number;
                unitPrice: number;
                taxRate: number;
                taxAmount: number;
                lineTotal: number;
            }>;
            subtotal: number;
            taxTotal: number;
            grandTotal: number;
            currencyCode: string;
        };
        createdBy: string;
    }) {
        const { tenantId, invoiceId, invoiceType, standard, countryCode, invoiceData, createdBy } = params;

        // Build the XML payload for the target standard
        const xmlPayload = this._buildXML(standard, invoiceData);
        const uuid = crypto.randomUUID();
        const qrCode = Buffer.from(JSON.stringify({
            seller: invoiceData.sellerName,
            vatNo: invoiceData.sellerTaxId,
            timestamp: new Date().toISOString(),
            total: invoiceData.grandTotal,
            vat: invoiceData.taxTotal,
        })).toString('base64');

        const [doc] = (await db.execute(sql`
            INSERT INTO einvoice_documents (
                tenant_id, invoice_id, invoice_type, standard, country_code,
                uuid, qr_code, xml_payload, status, created_by
            ) VALUES (
                ${tenantId}, ${invoiceId}, ${invoiceType}, ${standard}, ${countryCode},
                ${uuid}, ${qrCode}, ${xmlPayload}, 'Pending', ${createdBy}
            )
            RETURNING *
        `)) as any;

        // Simulate async submission (in production: call tax authority API)
        await this._submitToAuthority(doc.id, standard, xmlPayload, invoiceData);

        return { documentId: doc.id, uuid, qrCode, status: 'Submitted' };
    }

    /**
     * Cancel a previously submitted e-invoice
     */
    async cancelInvoice(documentId: string, reason: string) {
        await db.execute(sql`
            UPDATE einvoice_documents
            SET status = 'Cancelled', cancelled_at = NOW(),
                error_message = ${reason}, updated_at = NOW()
            WHERE id = ${documentId} AND status IN ('Submitted', 'Accepted')
        `);
        return { documentId, status: 'Cancelled' };
    }

    async getDocument(documentId: string) {
        return (await db.execute(sql`
            SELECT * FROM einvoice_documents WHERE id = ${documentId}
        `) as any).rows?.[0] ?? null;
    }

    async listDocuments(tenantId: string, filters?: { status?: string; standard?: string; periodStart?: string }) {
        let query = `
            SELECT id, invoice_id, standard, country_code, uuid, status,
                   submitted_at, accepted_at, created_at
            FROM einvoice_documents
            WHERE tenant_id = $1
        `;
        const params: any[] = [tenantId];
        if (filters?.status) { params.push(filters.status); query += ` AND status = $${params.length}`; }
        if (filters?.standard) { params.push(filters.standard); query += ` AND standard = $${params.length}`; }
        query += ' ORDER BY created_at DESC LIMIT 200';

        return (await db.execute(sql.raw(query, ...params)) as any).rows ?? [];
    }

    async getStats(tenantId: string) {
        return (await db.execute(sql`
            SELECT standard, status, COUNT(*) AS count
            FROM einvoice_documents
            WHERE tenant_id = ${tenantId}
            GROUP BY standard, status
            ORDER BY standard, status
        `) as any).rows;
    }

    /** Build jurisdiction XML */
    private _buildXML(standard: string, data: any): string {
        const items = data.lineItems.map((l: any, i: number) => `
        <cac:InvoiceLine>
          <cbc:ID>${i + 1}</cbc:ID>
          <cbc:InvoicedQuantity unitCode="EA">${l.quantity}</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID="${data.currencyCode}">${l.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
          <cac:Item><cbc:Name>${l.description}</cbc:Name></cac:Item>
          <cac:Price><cbc:PriceAmount currencyID="${data.currencyCode}">${l.unitPrice.toFixed(2)}</cbc:PriceAmount></cac:Price>
        </cac:InvoiceLine>`).join('');

        // PEPPOL BIS 3.0 / UBL 2.1 base (extended per-standard)
        return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:CustomizationID>${this._customizationId(standard)}</cbc:CustomizationID>
  <cbc:ProfileID>${standard}</cbc:ProfileID>
  <cbc:ID>${data.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${data.currencyCode}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${data.sellerName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${data.sellerTaxId}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${data.buyerName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${data.buyerTaxId}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${data.currencyCode}">${data.taxTotal.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="${data.currencyCode}">${data.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${data.currencyCode}">${data.grandTotal.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${data.currencyCode}">${data.grandTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${items}
</Invoice>`;
    }

    private _customizationId(standard: string): string {
        const map: Record<string, string> = {
            ZATCA: 'urn:gs1:bis:gs1_ubl_invoice:ver3.0:extended:zatca:ver3.0',
            SDI: 'urn:cen.eu:en16931:2017#conformant#urn:UBL.BE:1.0.0.20180214',
            CFDI: 'urn:sat.gob.mx:cfdi:3.3',
            GST_IRN: 'urn:nic:einvoice:ver1.1',
            PEPPOL: 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
        };
        return map[standard] ?? 'urn:cen.eu:en16931:2017';
    }

    /** Simulate tax authority API call (replace with real HTTP calls per standard) */
    private async _submitToAuthority(documentId: string, standard: string, xml: string, data: any) {
        // In production: call ZATCA API / SDI / SAT / NIC IRP etc.
        // For now: mark as Submitted immediately
        const irn = standard === 'GST_IRN'
            ? `${data.invoiceNumber}/${data.sellerTaxId}/${data.issueDate.replace(/-/g, '')}`
            : undefined;

        await db.execute(sql`
            UPDATE einvoice_documents
            SET status = 'Submitted',
                submitted_at = NOW(),
                irn = ${irn ?? null},
                submission_id = ${'SUB-' + documentId.slice(0, 8).toUpperCase()},
                updated_at = NOW()
            WHERE id = ${documentId}
        `);
    }
}

export const eInvoiceService = new EInvoiceService();
