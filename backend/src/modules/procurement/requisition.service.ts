import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequisitionHeader } from './entities/requisition-header.entity';
import { RequisitionLine } from './entities/requisition-line.entity';
import { PurchaseOrderService } from './purchase-order.service';
import { ApprovalService } from './approval.service';

@Injectable()
export class RequisitionService {
    private readonly logger = new Logger(RequisitionService.name);

    constructor(
        @InjectRepository(RequisitionHeader)
        private reqRepo: Repository<RequisitionHeader>,
        @InjectRepository(RequisitionLine)
        private reqLineRepo: Repository<RequisitionLine>,
        private readonly poService: PurchaseOrderService,
        private readonly approvalService: ApprovalService,
    ) { }

    async create(dto: any): Promise<RequisitionHeader> {
        const req = this.reqRepo.create({
            reqNumber: `REQ-${Date.now()}`,
            requesterId: dto.requesterId || 'USER-1', // Default for MVP
            status: 'Draft',
            description: dto.description,
            justification: dto.justification,
            totalAmount: 0 // Will calculate
        });
        const savedReq = await this.reqRepo.save(req);

        let total = 0;
        const lines = [];
        if (dto.lines && dto.lines.length > 0) {
            for (const lineDto of dto.lines) {
                const line = this.reqLineRepo.create({
                    header: savedReq,
                    ...lineDto
                });
                const savedLine = await this.reqLineRepo.save(line);
                lines.push(savedLine);
                total += (Number(savedLine.quantity) * Number(savedLine.unitPrice));
            }
        }

        savedReq.lines = lines;
        savedReq.totalAmount = total;
        return this.reqRepo.save(savedReq);
    }

    async findAll(): Promise<RequisitionHeader[]> {
        return this.reqRepo.find({ relations: ['lines'], order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<RequisitionHeader> {
        const req = await this.reqRepo.findOne({ where: { id }, relations: ['lines'] });
        if (!req) throw new NotFoundException(`Requisition ${id} not found`);
        return req;
    }

    async submit(id: string): Promise<RequisitionHeader> {
        const req = await this.findOne(id);
        if (req.status !== 'Draft' && req.status !== 'Rejected') {
            throw new BadRequestException(`Cannot submit requisition in status ${req.status}`);
        }

        // Evaluate Rules
        const approverId = await this.approvalService.evaluateRule('Requisition', Number(req.totalAmount));

        if (approverId && approverId !== 'AUTO') {
            req.status = 'Pending Approval';
            req.currentApproverId = approverId;
            this.logger.log(`Requisition ${req.reqNumber} ($${req.totalAmount}) routed to ${approverId}`);
        } else {
            req.status = 'Approved'; // Auto-approve
            req.currentApproverId = undefined;
            this.logger.log(`Requisition ${req.reqNumber} ($${req.totalAmount}) Auto-Approved`);
        }

        return this.reqRepo.save(req);
    }

    async approve(id: string, approverId?: string): Promise<RequisitionHeader> {
        const req = await this.findOne(id);
        if (req.status !== 'Pending Approval') {
            throw new BadRequestException(`Cannot approve requisition in status ${req.status}`);
        }
        // Validation: Check if request.user.id matches req.currentApproverId (Skipped for simple MVP, assuming caller is auth'd correctly)

        req.status = 'Approved';
        req.currentApproverId = undefined;
        return this.reqRepo.save(req);
    }

    async reject(id: string): Promise<RequisitionHeader> {
        const req = await this.findOne(id);
        if (req.status !== 'Pending Approval') {
            throw new BadRequestException(`Cannot reject requisition in status ${req.status}`);
        }
        req.status = 'Rejected';
        req.currentApproverId = undefined;
        return this.reqRepo.save(req);
    }

    async convertToPO(id: string): Promise<any> {
        const req = await this.findOne(id);
        if (req.status !== 'Approved') {
            throw new BadRequestException(`Cannot convert unapproved requisition`);
        }

        // Group by Supplier
        const linesBySupplier = new Map<string, RequisitionLine[]>();
        const linesWithoutSupplier: RequisitionLine[] = [];

        for (const line of req.lines) {
            if (line.supplierId) {
                if (!linesBySupplier.has(line.supplierId)) {
                    linesBySupplier.set(line.supplierId, []);
                }
                linesBySupplier.get(line.supplierId)?.push(line);
            } else {
                linesWithoutSupplier.push(line);
            }
        }

        const createdPOs = [];

        // Create PO for each supplier
        for (const [supplierId, lines] of linesBySupplier.entries()) {
            const poDto = {
                poNumber: `PO-REQ-${req.reqNumber}-${supplierId.substring(0, 4)}`, // Simple unique-ish number
                supplierId: supplierId,
                status: 'Draft',
                lines: lines.map((line, idx) => ({
                    lineNumber: idx + 1,
                    itemId: line.itemId,
                    itemDescription: line.description,
                    categoryName: line.categoryName || 'General',
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    lineAmount: Number(line.quantity) * Number(line.unitPrice)
                }))
            };
            const po = await this.poService.create(poDto);
            createdPOs.push(po);
        }

        if (createdPOs.length > 0) {
            req.status = 'PO Created';
            await this.reqRepo.save(req);
        }

        return createdPOs;
    }
}
