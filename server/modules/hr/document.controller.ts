import { Request, Response } from "express";
import { db } from "@db";
import { hrDocuments, insertDocumentSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class DocumentController {

    async getDocumentsByPerson(req: Request, res: Response) {
        try {
            const personId = req.params.personId;
            if (!personId) return res.status(400).json({ error: "Person ID required" });

            const docs = await db.select()
                .from(hrDocuments)
                .where(eq(hrDocuments.personId, personId))
                .orderBy(desc(hrDocuments.createdAt));

            res.json(docs);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to list documents" });
        }
    }

    async uploadDocument(req: Request, res: Response) {
        try {
            // For MVP, we assume the file is already uploaded to a blob store 
            // and the client sends the URL, OR we just store metadata.
            const parseResult = insertDocumentSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }

            const [doc] = await db.insert(hrDocuments)
                .values(parseResult.data)
                .returning();

            res.status(201).json(doc);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to create document record" });
        }
    }
}

export const documentController = new DocumentController();
