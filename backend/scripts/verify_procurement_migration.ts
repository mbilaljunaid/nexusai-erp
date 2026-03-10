import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../src/database/database.module';
import { PurchaseOrderService } from '../src/modules/procurement/purchase-order.service';
import { RequisitionService } from '../src/modules/procurement/requisition.service';
import { ProcurementApprovalService } from '../src/modules/procurement/approval.service';
import { ProcurementGlIntegrationService } from '../src/modules/procurement/gl-integration.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Mocks to avoid complex dependency chains
const mockApprovalService = {
    evaluateRule: async () => ({ action: 'AutoApprove', approverId: 'AUTO' })
} as any;

const mockGlService = {
    checkFunds: async () => true,
    reserveFunds: async () => true
} as any;

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
    ],
    providers: [
        PurchaseOrderService,
        RequisitionService,
        { provide: 'ProcurementApprovalService', useValue: mockApprovalService },
        { provide: 'ProcurementGlIntegrationService', useValue: mockGlService }
    ],
})
class TestModule { }

async function run() {
    console.log("Starting Procurement (PO + Req) Verification...");

    try {
        const app = await NestFactory.createApplicationContext(TestModule);

        const reqService = app.get(RequisitionService);

        // console.log("PO Service initialized");
        // await app.close();
        // return;

        console.log("Creating Test Requisition...");
        const reqData = {
            requesterId: 'USER-TEST',
            description: 'Test Requisition',
            lines: [
                {
                    lineNumber: 1,
                    description: "Requested Item 1",
                    quantity: 10,
                    estimatedPrice: 20,
                    uom: 'Each'
                }
            ]
        };

        const req = await reqService.create(reqData);
        console.log("Requisition Created:", req.requisitionNumber, "Status:", req.status);

        console.log("Submitting Requisition...");
        const submittedReq = await reqService.submit(req.id);
        console.log("Requisition Submitted. New Status:", submittedReq.status);

        if (submittedReq.status === 'Approved') {
            console.log("Converting to PO...");
            const pos = await reqService.convertToPO(req.id);
            console.log("PO Created from Req count:", pos.length);

            if (pos.length > 0) {
                const po = pos[0];
                console.log("Generatd PO:", po.orderNumber);

                // Verify DB persistence of PO
                const fetchedPo = await poService.findOne(po.id);
                if (fetchedPo) {
                    console.log("✅ Verified: PO persisted correctly from Requisition conversion.");
                } else {
                    console.error("❌ Verification Failed: Generated PO not found in DB.");
                }
            } else {
                console.error("❌ Verification Failed: No POs returned from conversion.");
            }

        } else {
            console.warn("⚠️ Requisition was not AutoApproved (mock might be ignored if strict token usage). Manual approval required?");
        }

        await app.close();

    } catch (e) {
        console.error("FAILURE:", e);
        process.exit(1);
    }
}

run();
