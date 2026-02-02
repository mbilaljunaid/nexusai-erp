import { db } from "../../../db";
import { employees, payrollConfigs, type InsertEmployee, type InsertPayrollConfig } from "@shared/schema";
import { eq } from "drizzle-orm";

export class HrService {

    /**
     * listEmployees
     * @param department Optional department filter
     */
    async listEmployees(department?: string) {
        if (department) {
            return await db.select().from(employees).where(eq(employees.department, department));
        }
        return await db.select().from(employees);
    }

    /**
     * getEmployee
     */
    async getEmployee(id: string) {
        const [emp] = await db.select().from(employees).where(eq(employees.id, id));
        return emp;
    }

    /**
     * createEmployee
     */
    async createEmployee(data: InsertEmployee) {
        // Drizzle defaults will handle ID and timestamps
        const [emp] = await db.insert(employees).values(data).returning();
        return emp;
    }

    /**
     * listPayrollConfigs
     */
    async listPayrollConfigs() {
        return await db.select().from(payrollConfigs);
    }

    /**
     * getPayrollConfig
     */
    async getPayrollConfig(id: string) {
        const [config] = await db.select().from(payrollConfigs).where(eq(payrollConfigs.id, id));
        return config;
    }

    /**
     * createPayrollConfig
     */
    async createPayrollConfig(data: InsertPayrollConfig) {
        const [config] = await db.insert(payrollConfigs).values(data).returning();
        return config;
    }
}

export const hrService = new HrService();
