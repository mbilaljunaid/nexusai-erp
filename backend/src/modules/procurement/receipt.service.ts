import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptHeader } from './entities/receipt-header.entity';
import { ReceiptLine } from './entities/receipt-line.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLine } from './entities/purchase-order-line.entity';
import { Item } from '../inventory/entities/item.entity';

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
        @InjectRepository(Item) // Direct repo access for MVP, ideally use ItemService
        private itemRepo: Repository<Item>,
    ) { }

    async create(dto: any): Promise<ReceiptHeader> {
        // dto: { purchaseOrderId: string, lines: [{ poLineId: string, quantity: number, itemId: string, inventoryOrganizationId: string }] }

        const po = await this.poRepo.findOne({ where: { id: dto.purchaseOrderId }, relations: ['lines'] });
        if (!po) throw new NotFoundException('PO not found');
        if (po.status !== 'Open') throw new BadRequestException(`Cannot receive against PO in status ${po.status}`);

        const receipt = this.receiptRepo.create({
            receiptNumber: `REC-${Date.now()}`,
            purchaseOrder: po,
            receiptDate: new Date(),
            status: 'Received',
        });

        const savedReceipt = await this.receiptRepo.save(receipt);
        const receiptLines: ReceiptLine[] = [];

        for (const lineDto of dto.lines) {
            const poLine = po.lines.find(l => l.id === lineDto.poLineId);
            if (!poLine) continue;

            const quantityReceived = parseFloat(lineDto.quantity);

            // Update PO Line
            poLine.quantityReceived = (parseFloat(poLine.quantityReceived?.toString() || '0') + quantityReceived);
            await this.poLineRepo.save(poLine);

            // Update Inventory (if Item ID provided)
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
            receiptLines.push(await this.receiptLineRepo.save(receiptLine));
        }

        // Check if PO should be closed (simplistic check: all lines fully received)
        // For now, let's keep it Open unless explicitly closed or handle partials logic later.
        // If we wanted to close:
        const allFullyReceived = po.lines.every(l => Number(l.quantityReceived) >= Number(l.quantity));
        if (allFullyReceived) {
            po.status = 'Closed';
            await this.poRepo.save(po);
        }

        savedReceipt.lines = receiptLines;
        return savedReceipt;
    }

    async findAll(): Promise<ReceiptHeader[]> {
        return this.receiptRepo.find({ relations: ['lines', 'purchaseOrder'] });
    }
}
