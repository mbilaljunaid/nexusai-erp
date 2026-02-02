
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { contractService } from "../server/services/ContractService";
import { db } from "../server/db";
import { suppliers, procurementContracts } from "../shared/schema/scm";
import fs from "fs";

async function verify() {
    console.log("Starting Phase 7 Step 2 & 3 Verification: PDF & E-Signature");

    try {
        // 1. Setup Supplier & Contract
        let [supplier] = await db.select().from(suppliers).limit(1);
        if (!supplier) {
            [supplier] = await db.insert(suppliers).values({ name: "Phase 7 Test Supplier" }).returning();
        }

        console.log(`Using Supplier: ${supplier.name}`);

        const [contract] = await db.insert(procurementContracts).values({
            supplierId: supplier.id,
            contractNumber: `CERT-P7-${Date.now()}`,
            title: "Phase 7 Verification Contract",
            status: "DRAFT"
        }).returning();

        console.log(`Contract created: ${contract.id}`);

        // 2. Test PDF Generation
        console.log("Generating PDF...");
        const pdfPath = await contractService.generateContractPDF(contract.id);
        console.log(`PDF Generated at: ${pdfPath}`);

        if (fs.existsSync(pdfPath)) {
            console.log("SUCCESS: PDF file exists on disk.");
        } else {
            console.error("FAIL: PDF file not found.");
        }

        // 3. Test E-Signature Status Update
        console.log("Sending for E-Signature...");
        const updated = await contractService.updateEsignStatus(contract.id, 'PENDING', 'ENV-VERIFY-123');

        if (updated.esignStatus === 'PENDING' && updated.esignEnvelopeId === 'ENV-VERIFY-123') {
            console.log("SUCCESS: E-Signature status updated in DB.");
        } else {
            console.error("FAIL: E-Signature status not updated correctly.");
        }

        console.log("Phase 7 Step 2 & 3 Verification Completed.");
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
