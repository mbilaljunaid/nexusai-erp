
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { documentService } from "../server/services/DocumentService";
import { db } from "../server/db";
import { suppliers } from "../shared/schema/scm";
import fs from "fs";
import path from "path";

async function verify() {
    console.log("Starting Phase 7 Step 1 Verification: Document Upload");

    try {
        // 1. Find or create a supplier
        let [supplier] = await db.select().from(suppliers).limit(1);
        if (!supplier) {
            [supplier] = await db.insert(suppliers).values({ name: "Doc Test Supplier" }).returning();
        }

        console.log(`Using Supplier: ${supplier.name} (${supplier.id})`);

        // 2. Simulate document upload record creation
        console.log("Creating document record...");
        const doc = await documentService.uploadSupplierDocument({
            supplierId: supplier.id,
            documentType: "W-9",
            fileName: "test_w9.pdf",
            filePath: "/tmp/test_w9.pdf",
            status: "ACTIVE"
        });

        console.log(`Document record created with ID: ${doc.id}`);

        // 3. Verify retrieval
        const docs = await documentService.getSupplierDocuments(supplier.id);
        if (docs.some(d => d.id === doc.id)) {
            console.log("SUCCESS: Document retrieved correctly.");
        } else {
            console.error("FAIL: Document not found in list.");
        }

        // 4. Test directory creation
        const uploadDir = documentService.ensureUploadDir("test_verify");
        if (fs.existsSync(uploadDir)) {
            console.log(`SUCCESS: Upload directory ${uploadDir} exists.`);
        } else {
            console.error("FAIL: Upload directory not created.");
        }

        console.log("Phase 7 Step 1 Verification Completed.");
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
