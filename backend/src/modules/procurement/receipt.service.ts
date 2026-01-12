import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptHeader } from './entities/receipt-header.entity';
import { ReceiptLine } from './entities/receipt-line.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLine } from './entities/purchase-order-line.entity';
import { Item } from '../inventory/entities/item.entity';
import { ApService } from './ap.service';
import { GlIntegrationService } from './gl-integration.service';

@Injectable()
export class ReceiptService {
    private readonly logger = new Logger(ReceiptService.name);

    constructor(
        @InjectRepository(ReceiptHeader)
        private receiptRepo: Repository<ReceiptHeader>,
        @InjectRepository(ReceiptLine)
        private receiptLineRepo: Repository<ReceiptLine>,
        @InjectRepository(PurchaseOrder)
        private poRepo: Repository<PurchaseOrder>,
        @InjectRepository(PurchaseOrderLine)
        private poLineRepo: Repository<PurchaseOrderLine>,
        @InjectRepository(Item)
        private itemRepo: Repository<Item>,
        private readonly apService: ApService,
        private readonly glService: GlIntegrationService,
    ) { }

    async create(dto: any): Promise<ReceiptHeader> {
        const po = await this.poRepo.findOne({ where: { id: dto.purchaseOrderId }, relations: ['lines'] });
        if (!po) throw new NotFoundException('PO not found');
        if (po.status !== 'Open') throw new BadRequestException(`Cannot receive against PO in status ${po.status}`);

        const receipt = this.receiptRepo.create({
            receiptNumber: `REC-${Date.now()}`,
            purchaseOrder: po,
            receiptDate: new Date(),
            status: 'Received',
            accountingStatus: 'Pending'
        });

        const savedReceipt = await this.receiptRepo.save(receipt);
        const receiptLines: ReceiptLine[] = [];

        let totalReceiptAmount = 0;

        for (const lineDto of dto.lines) {
            const poLine = po.lines.find(l => l.id === lineDto.poLineId);
            if (!poLine) continue;

            const quantityReceived = parseFloat(lineDto.quantity);

            poLine.quantityReceived = (parseFloat(poLine.quantityReceived?.toString() || '0') + quantityReceived);
            await this.poLineRepo.save(poLine);

            if (lineDto.itemId) {
                const item = await this.itemRepo.findOne({ where: { id: lineDto.itemId } });
                if (item) {
                    item.quantityOnHand = (parseFloat(item.quantityOnHand?.toString() || '0') + quantityReceived);
                    await this.itemRepo.save(item);
                }
            }

            const receiptLine = this.receiptLineRepo.create({
                header: savedReceipt,
                poLine: poLine,
                itemId: lineDto.itemId,
                quantityReceived: quantityReceived,
                inventoryOrganizationId: lineDto.inventoryOrganizationId
            });
            const savedLine = await this.receiptLineRepo.save(receiptLine);
            receiptLines.push(savedLine);

            totalReceiptAmount += (Number(quantityReceived) * Number(poLine.unitPrice));
        }

        const allFullyReceived = po.lines.every(l => Number(l.quantityReceived) >= Number(l.quantity));
        if (allFullyReceived) {
            po.status = 'Closed';
            await this.poRepo.save(po);
        }

        savedReceipt.lines = receiptLines;

        // GL Integration: Post Accrual Journal
        await this.glService.postJournal({
            source: 'Purchasing',
            category: 'Receiving',
            description: `Receipt ${savedReceipt.receiptNumber} Accrual`,
            lines: [
                { account: '1000-Inventory', debit: totalReceiptAmount },
                { account: '2001-Accrual', credit: totalReceiptAmount }
            ]
        });
        // In future: savedReceipt.accountingStatus = 'Accounted';

        return savedReceipt;
    }

    async returnItems(dto: any): Promise<any> {
        const receiptLine = await this.receiptLineRepo.findOne({ where: { id: dto.receiptLineId }, relations: ['header', 'poLine', 'header.purchaseOrder', 'header.purchaseOrder.supplier'] });
        if (!receiptLine) throw new NotFoundException('Receipt Line not found');

        const qtyToReturn = Number(dto.quantityToReturn);
        const received = Number(receiptLine.quantityReceived);
        const returned = Number(receiptLine.quantityReturned || 0);

        if (qtyToReturn > (received - returned)) {
            throw new BadRequestException('Cannot return more than quantity available on receipt');
        }

        receiptLine.quantityReturned = returned + qtyToReturn;
        await this.receiptLineRepo.save(receiptLine);

        if (receiptLine.itemId) {
            const item = await this.itemRepo.findOne({ where: { id: receiptLine.itemId } });
            if (item) {
                item.quantityOnHand = parseFloat(item.quantityOnHand?.toString() || '0') - qtyToReturn;
                await this.itemRepo.save(item);
            }
        }

        const amount = qtyToReturn * Number(receiptLine.poLine.unitPrice);
        await this.apService.createDebitMemo({
            invoiceNumber: `DM-${receiptLine.header.receiptNumber}-${Date.now()}`,
            supplierId: receiptLine.header.purchaseOrder.supplier.id,
            purchaseOrderId: receiptLine.header.purchaseOrder.id,
            amount: -amount,
            description: `Return of ${qtyToReturn} items from Receipt ${receiptLine.header.receiptNumber}`,
            lines: [{
                description: `Return: ${receiptLine.poLine.itemDescription}`,
                amount: -amount,
                poLineId: receiptLine.poLine.id
            }]
        });

        return { message: 'Return processed successfully and Debit Memo created' };
    }

    async findAll(): Promise<ReceiptHeader[]> {
        return this.receiptRepo.find({ relations: ['lines', 'purchaseOrder'] });
    }
}
