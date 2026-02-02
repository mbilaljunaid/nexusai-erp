
import { db } from "../db";
import { supplierDocuments, type InsertSupplierDocument } from "../../shared/schema/scm";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export class DocumentService {
    /**
     * Upload a supplier document record
     */
    async uploadSupplierDocument(data: InsertSupplierDocument) {
        const [doc] = await db.insert(supplierDocuments).values(data).returning();
        return doc;
    }

    /**
     * Get all documents for a specific supplier
     */
    async getSupplierDocuments(supplierId: string) {
        return await db.select().from(supplierDocuments).where(eq(supplierDocuments.supplierId, supplierId));
    }

    /**
     * Update document status (e.g., ARCHIVED, EXPIRED)
     */
    async updateDocumentStatus(id: string, status: string) {
        const [updated] = await db.update(supplierDocuments)
            .set({ status })
            .where(eq(supplierDocuments.id, id))
            .returning();
        return updated;
    }

    /**
     * Ensure upload directory exists
     */
    ensureUploadDir(subDir: string = "supplier_docs") {
        const uploadDir = path.join(process.cwd(), "uploads", subDir);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        return uploadDir;
    }
}

export const documentService = new DocumentService();
