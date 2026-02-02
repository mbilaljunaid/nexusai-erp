
import { pgTable, text, timestamp, varchar, boolean, integer, numeric, uuid, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { maintWorkOrderOperations } from "./maintenance";

export const maintWorkCenters = pgTable("maint_work_centers", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(), // e.g. "MECH", "ELEC"
    name: varchar("name", { length: 100 }).notNull(),
    plantId: varchar("plant_id"), // Optional: For multi-plant support in future
    capacityPerDay: numeric("capacity_per_day").default("24"), // Hours available per day (e.g. 3 shifts * 8 = 24)
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintWorkCentersRelations = relations(maintWorkCenters, ({ many }) => ({
    operations: many(maintWorkOrderOperations),
}));

export const insertMaintWorkCenterSchema = createInsertSchema(maintWorkCenters);
