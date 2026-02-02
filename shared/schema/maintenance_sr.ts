
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { faAssets } from "./fixedAssets";
import { users } from "./common"; // This might still be wrong if users.ts doesn't exist, will check find_by_name result.
import { maintWorkOrders } from "./maintenance";


// 9. Service Requests (Breakdowns / Ticketing)
export const maintServiceRequests = pgTable("maint_service_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    requestNumber: varchar("request_number", { length: 50 }).notNull().unique(), // SR-2026-X

    description: text("description").notNull(),
    priority: varchar("priority", { length: 20 }).default("NORMAL"), // LOW, NORMAL, HIGH, CRITICAL
    status: varchar("status", { length: 20 }).default("NEW"), // NEW, IN_REVIEW, CONVERTED, REJECTED, CLOSED

    // Links
    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),
    requestedBy: varchar("requested_by").references(() => users.id), // If authenticated
    workOrderId: varchar("work_order_id").references(() => maintWorkOrders.id), // Link to created WO



    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const maintServiceRequestsRelations = relations(maintServiceRequests, ({ one }) => ({
    asset: one(faAssets, {
        fields: [maintServiceRequests.assetId],
        references: [faAssets.id],
    }),
    requester: one(users, {
        fields: [maintServiceRequests.requestedBy],
        references: [users.id],
    }),
    workOrder: one(maintWorkOrders, {
        fields: [maintServiceRequests.workOrderId],
        references: [maintWorkOrders.id],
    }),
}));

export const insertMaintServiceRequestSchema = createInsertSchema(maintServiceRequests);
export type MaintServiceRequest = typeof maintServiceRequests.$inferSelect;
