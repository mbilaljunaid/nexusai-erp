import { db } from "@db";
import { hrHdlImports } from "@shared/schema";
import { PersonService } from "./PersonService";
import { eq, desc } from "drizzle-orm";

export class HdlService {

    // Process Worker Import (CSV content)
    static async importWorkers(tenantId: string, userId: string, csvContent: string, fileName: string) {
        // 1. Create Import Record
        const [importRecord] = await db.insert(hrHdlImports).values({
            tenantId,
            fileName,
            businessObject: "WORKER",
            uploadedBy: userId,
            status: "PROCESSING",
            totalLines: "0"
        }).returning();

        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const dataLines = lines.slice(1).filter(l => l.trim().length > 0);

        // Update total lines
        await db.update(hrHdlImports)
            .set({ totalLines: dataLines.length.toString() })
            .where(eq(hrHdlImports.id, importRecord.id));

        let successCount = 0;
        let failCount = 0;
        const errors: any[] = [];

        // 2. Process Lines
        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const values = line.split(',');
            const row: any = {};

            headers.forEach((h, index) => {
                row[h] = values[index]?.trim();
            });

            try {
                // Validate required fields
                if (!row.PersonNumber || !row.LastName || !row.StartDate) {
                    throw new Error("Missing required fields: PersonNumber, LastName, StartDate");
                }

                // Construct Hire Payload
                const hireData = {
                    person: {
                        personNumber: row.PersonNumber,
                        firstName: row.FirstName,
                        lastName: row.LastName,
                        email: row.Email,
                        dateOfBirth: row.DateOfBirth ? new Date(row.DateOfBirth) : undefined,
                        nationalId: row.NationalId
                    },
                    workRelationship: {
                        legalEmployerId: row.LegalEmployer || "1", // Default/Lookups needs better handling
                        workerType: row.WorkerType || "EMPLOYEE",
                        dateStart: new Date(row.StartDate)
                    },
                    assignment: {
                        jobId: row.JobCode, // Assumes ID passed or we need lookup logic (skipped for Lite)
                        departmentId: row.DeptName, // Assumes ID/Name
                        locationId: row.Location
                    }
                };

                await PersonService.hireWorker(hireData, tenantId, userId);
                successCount++;

            } catch (err: any) {
                failCount++;
                errors.push({ line: i + 2, error: err.message, raw: line });
            }
        }

        // 3. Complete
        await db.update(hrHdlImports)
            .set({
                status: failCount > 0 ? (successCount > 0 ? "PARTIAL" : "FAILED") : "COMPLETED",
                successLines: successCount.toString(),
                failedLines: failCount.toString(),
                errorReport: errors,
                completedAt: new Date()
            })
            .where(eq(hrHdlImports.id, importRecord.id));

        return { importId: importRecord.id, success: successCount, failed: failCount };
    }

    static async getRecentImports(tenantId: string) {
        return db.select().from(hrHdlImports)
            .where(eq(hrHdlImports.tenantId, tenantId))
            .orderBy(desc(hrHdlImports.createdAt))
            .limit(10);
    }
}
