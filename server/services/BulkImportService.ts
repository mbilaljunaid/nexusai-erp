
import Papa from "papaparse";
import { partyService } from "./PartyService";
import { itemService } from "./ItemService";
import { InsertParty, InsertOrganization, InsertPerson } from "../../shared/schema/parties";
import { InsertEgpSystemItem } from "../../shared/schema/pim";

type ImportResult = {
    total: number;
    success: number;
    failed: number;
    errors: { row: number; reason: string; data: any }[];
};

export class BulkImportService {

    /**
     * Process a CSV Import
     */
    async processImport(entityType: "PARTY" | "ITEM", csvContent: string): Promise<ImportResult> {
        const parseResult = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
        });

        if (parseResult.errors.length > 0) {
            throw new Error(`CSV Parsing Error: ${parseResult.errors[0].message}`);
        }

        const data = parseResult.data as any[];
        const result: ImportResult = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                if (entityType === "PARTY") {
                    await this.importParty(row);
                } else if (entityType === "ITEM") {
                    await this.importItem(row);
                }
                result.success++;
            } catch (error: any) {
                result.failed++;
                result.errors.push({
                    row: i + 2, // 1-based + header
                    reason: error.message,
                    data: row
                });
            }
        }

        return result;
    }

    private async importParty(row: any) {
        // Basic Mapped Validation
        if (!row.partyName || !row.partyType) {
            throw new Error("Missing required fields: partyName, partyType");
        }

        const partyNumber = `BLK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const partyData: Partial<InsertParty> = {
            partyNumber,
            partyName: row.partyName,
            status: "A"
        };

        if (row.partyType === "ORGANIZATION") {
            await partyService.createOrganization(
                partyData as InsertParty,
                { organizationName: row.partyName }
            );
        } else if (row.partyType === "PERSON") {
            const nameParts = row.partyName.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || "Unknown";

            await partyService.createPerson(
                partyData as InsertParty,
                { personFirstName: firstName, personLastName: lastName }
            );
        } else {
            throw new Error(`Invalid Party Type: ${row.partyType}`);
        }
    }

    private async importItem(row: any) {
        if (!row.itemNumber || !row.itemName || !row.uomCode) {
            throw new Error("Missing required fields: itemNumber, itemName, uomCode");
        }

        const itemInput: Partial<InsertEgpSystemItem> = {
            itemNumber: row.itemNumber,
            itemName: row.itemName,
            description: row.description || row.itemName,
            primaryUomCode: row.uomCode,
            itemType: row.itemType || "PURCHASED",
            inventoryItemStatusCode: "Active",
            organizationId: 1, // Defaulting to Org 1 for now
            enabledFlag: true
        };

        await itemService.createItem(itemInput as InsertEgpSystemItem);
    }
}

export const bulkImportService = new BulkImportService();
