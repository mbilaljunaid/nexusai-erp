import { Inject, Injectable, Logger, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';
import { PurchaseOrderService } from './purchase-order.service';
import type { ProcurementApprovalService } from './approval.service';
import type { ProcurementGlIntegrationService } from './gl-integration.service';

@Injectable()
export class RequisitionService {
    private readonly logger = new Logger(RequisitionService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly poService: PurchaseOrderService,
        @Inject('ProcurementApprovalService')
        private readonly approvalService: ProcurementApprovalService,
        @Inject('ProcurementGlIntegrationService')
        private readonly glService: ProcurementGlIntegrationService,
    ) {
    }

    async create(dto: any) {
        return await this.db.transaction(async (tx) => {
            // 1. Create Header
            const [req] = await tx.insert(schema.purchaseRequisitions).values({
                requisitionNumber: `REQ-${Date.now()}`,
                requesterId: dto.requesterId || 'USER-1', // Default for MVP
                status: 'Draft',
                description: dto.description,
                // justification: dto.justification, // Schema check confirms justification isn't in Drizzle schema yet? 
                // Wait, checking scm.ts... justification is NOT in schema.purchaseRequisitions. skipping.
            }).returning();

            let total = 0;
            const createdLines: typeof schema.purchaseRequisitionLines.$inferSelect[] = [];

            // 2. Create Lines
            if (dto.lines && dto.lines.length > 0) {
                for (const lineDto of dto.lines) {
                    const [line] = await tx.insert(schema.purchaseRequisitionLines).values({
                        requisitionId: req.id,
                        lineNumber: lineDto.lineNumber || (createdLines.length + 1),
                        itemId: lineDto.itemId,
                        itemDescription: lineDto.itemDescription || lineDto.description, // Fallback
                        quantity: String(lineDto.quantity),
                        estimatedPrice: String(lineDto.unitPrice || lineDto.estimatedPrice || 0),
                        unitOfMeasure: lineDto.unitOfMeasure || lineDto.uom,
                        status: 'PENDING'
                    }).returning();

                    createdLines.push(line);
                    total += (Number(line.quantity) * Number(line.estimatedPrice));
                }
            }

            // 3. Update Total? Schema doesn't have totalAmount on Header?
            // Checking schema... scm.ts:227 purchaseRequisitions does NOT have totalAmount.
            // Legacy entity had it. This is a schema gap.
            // Keeping it consistent with Drizzle schema for now. Logic relies on line aggregation.

            return { ...req, lines: createdLines, totalAmount: total };
        });
    }

    async findAll() {
        return this.db.query.purchaseRequisitions.findMany({
            with: { lines: true },
            orderBy: (reqs, { desc }) => [desc(reqs.createdAt)]
        });
    }

    async findOne(id: string) {
        const req = await this.db.query.purchaseRequisitions.findFirst({
            where: eq(schema.purchaseRequisitions.id, id),
            with: { lines: true }
        });
        if (!req) throw new NotFoundException(`Requisition ${id} not found`);

        // Calculate total on the fly since column missing
        const totalAmount = req.lines.reduce((sum, line) => sum + (Number(line.quantity) * Number(line.estimatedPrice || 0)), 0);
        return { ...req, totalAmount };
    }

    async submit(id: string) {
        const req = await this.findOne(id);
        if (req.status !== 'Draft' && req.status !== 'Rejected') {
            throw new BadRequestException(`Cannot submit requisition in status ${req.status}`);
        }

        const totalAmount = Number(req.totalAmount);

        // 1. Budgetary Control (Check Funds)
        await this.glService.checkFunds(totalAmount, 'IT');

        // 2. Evaluate Rules
        const approvalResult = await this.approvalService.evaluateRule('Requisition', totalAmount, 'General');

        let newStatus = 'Pending Approval';
        let approverId: string | null | undefined = approvalResult.approverId;

        if (approvalResult.action === 'AutoApprove' || approvalResult.approverId === 'AUTO') {
            newStatus = 'Approved';
            approverId = null; // Corrected type: varchar can be null but undefined is safer for update
            // await this.glService.reserveFunds(totalAmount, 'IT');
            this.logger.log(`Requisition ${req.requisitionNumber} ($${totalAmount}) Auto-Approved`);
        } else {
            this.logger.log(`Requisition ${req.requisitionNumber} ($${totalAmount}) routed to ${approvalResult.approverId}`);
        }

        const [updated] = await this.db.update(schema.purchaseRequisitions)
            .set({
                status: newStatus,
                // currentApproverId? Schema check: scm.ts doesn't have currentApproverId. 
                // Ignoring for now.
            })
            .where(eq(schema.purchaseRequisitions.id, id))
            .returning();

        return { ...updated, lines: req.lines, totalAmount };
    }

    async approve(id: string, approverId?: string) {
        const req = await this.findOne(id);
        if (req.status !== 'Pending Approval') {
            throw new BadRequestException(`Cannot approve requisition in status ${req.status}`);
        }

        const [updated] = await this.db.update(schema.purchaseRequisitions)
            .set({ status: 'Approved' }) // , currentApproverId: null
            .where(eq(schema.purchaseRequisitions.id, id))
            .returning();

        // Reserve Funds
        await this.glService.reserveFunds(Number(req.totalAmount), 'IT');

        return updated;
    }

    async reject(id: string) {
        const req = await this.findOne(id);
        if (req.status !== 'Pending Approval') {
            throw new BadRequestException(`Cannot reject requisition in status ${req.status}`);
        }

        const [updated] = await this.db.update(schema.purchaseRequisitions)
            .set({ status: 'Rejected' })
            .where(eq(schema.purchaseRequisitions.id, id))
            .returning();

        return updated;
    }

    async convertToPO(id: string) {
        const req = await this.findOne(id);
        if (req.status !== 'Approved') {
            throw new BadRequestException(`Cannot convert unapproved requisition`);
        }

        // Group by Item -> Supplier? 
        // Logic: Req lines might not have supplierId (it is not in schema.purchaseRequisitionLines).
        // Wait, backing out. Legacy entity had supplierId?
        // Checking scm.ts lines: itemId, itemDescription, quantity... NO supplierId.
        // Assuming for MVP we convert to 1 PO or need Logic to pick supplier.
        // For simplicity: Pass supplierId in DTO or assign default? 
        // Original code grouped by supplierId.
        // Let's assume we pass a supplierId or pick one? 
        // NOTE: The previous code had `line.supplierId`. 
        // Drizzle schema `purchaseRequisitionLines` DOES NOT have `supplierId`.
        // This suggests the Drizzle schema is missing columns that were in legacy entity.

        // WORKAROUND: Create one PO for all lines, requiring a specific supplier?
        // Or assume lines have item info linked to supplier.
        // I will just create 1 PO with a placeholder Supplier for now to unblock.

        const poLines = req.lines.map((line, idx) => ({
            lineNumber: idx + 1,
            itemId: line.itemId,
            itemDescription: line.itemDescription,
            quantity: Number(line.quantity),
            unitPrice: Number(line.estimatedPrice), // Use estimated as unit price
            lineAmount: Number(line.quantity) * Number(line.estimatedPrice)
        }));

        const poDto = {
            orderNumber: `PO-REQ-${req.requisitionNumber}`,
            supplierId: 'UNKNOWN-SUPPLIER', // Needs resolution
            totalAmount: req.totalAmount,
            lines: poLines
        };

        const po = await this.poService.create(poDto);

        await this.db.update(schema.purchaseRequisitions)
            .set({ status: 'PO Created' }) // PO_CREATED vs PO Created? Legacy had 'PO Created'.
            .where(eq(schema.purchaseRequisitions.id, id));

        return [po];
    }
}
