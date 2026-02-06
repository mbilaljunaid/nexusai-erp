
import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../shared/schema';
import { eq, desc, ilike, or, sql } from 'drizzle-orm';

@Injectable()
export class SupplierService {
    private readonly logger = new Logger(SupplierService.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(createSupplierDto: any): Promise<typeof schema.suppliers.$inferSelect> {
        this.logger.log(`Creating supplier: ${createSupplierDto.supplierName}`);
        const [supplier] = await this.db.insert(schema.suppliers).values({
            ...createSupplierDto,
            supplierNumber: createSupplierDto.supplierNumber || `SUP-${Date.now()}`,
            status: createSupplierDto.status || 'Active'
        }).returning();
        return supplier;
    }

    async findAll(query?: { search?: string; limit?: number; offset?: number }): Promise<{ data: (typeof schema.suppliers.$inferSelect)[]; total: number }> {
        const whereClause = query?.search
            ? or(
                ilike(schema.suppliers.name, `%${query.search}%`),
                ilike(schema.suppliers.supplierNumber, `%${query.search}%`)
            )
            : undefined;

        const data = await this.db.query.suppliers.findMany({
            where: whereClause,
            orderBy: [desc(schema.suppliers.createdAt)],
            limit: query?.limit,
            offset: query?.offset,
            with: {
                sites: true // Include sites by default or as needed
            }
        });

        // Count total
        const [countResult] = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.suppliers)
            .where(whereClause);

        return { data, total: Number(countResult.count) };
    }

    async findOne(id: string): Promise<typeof schema.suppliers.$inferSelect & { sites: (typeof schema.supplierSites.$inferSelect)[] }> {
        const supplier = await this.db.query.suppliers.findFirst({
            where: eq(schema.suppliers.id, id),
            with: {
                sites: true,
            },
        });

        if (!supplier) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
        return supplier;
    }

    async update(id: string, updateData: any): Promise<typeof schema.suppliers.$inferSelect> {
        await this.findOne(id); // Ensure exists
        const [updated] = await this.db.update(schema.suppliers)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(schema.suppliers.id, id))
            .returning();
        return updated;
    }

    async remove(id: string): Promise<void> {
        const [deleted] = await this.db.delete(schema.suppliers)
            .where(eq(schema.suppliers.id, id))
            .returning();

        if (!deleted) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
    }

    async addSite(supplierId: string, siteData: any): Promise<typeof schema.supplierSites.$inferSelect> {
        await this.findOne(supplierId); // Verify supplier exists

        const [site] = await this.db.insert(schema.supplierSites).values({
            ...siteData,
            supplierId,
        }).returning();
        return site;
    }

    async getSites(supplierId: string): Promise<(typeof schema.supplierSites.$inferSelect)[]> {
        return this.db.query.supplierSites.findMany({
            where: eq(schema.supplierSites.supplierId, supplierId),
            orderBy: [desc(schema.supplierSites.createdAt)]
        });
    }

    async updateSite(siteId: string, updateData: any): Promise<typeof schema.supplierSites.$inferSelect> {
        const [updated] = await this.db.update(schema.supplierSites)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(schema.supplierSites.id, siteId))
            .returning();

        if (!updated) throw new NotFoundException(`Site with ID ${siteId} not found`);
        return updated;
    }

    async removeSite(siteId: string): Promise<void> {
        const [deleted] = await this.db.delete(schema.supplierSites)
            .where(eq(schema.supplierSites.id, siteId))
            .returning();

        if (!deleted) {
            throw new NotFoundException(`Site with ID ${siteId} not found`);
        }
    }
}
