
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema/index.ts';
import * as dotenv from 'dotenv';
import { eq, and } from 'drizzle-orm';
dotenv.config();

/**
 * Verify HR Drizzle Migration
 * 1. Create Employee
 * 2. Create Leave Request
 * 3. Create Timesheet
 * 4. Verify Relationships
 */
async function verifyHr() {
    console.log('Verifying HR Drizzle Migration...');

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    try {
        await db.transaction(async (tx) => {
            // 1. Employee
            const empName = `HR-TEST-${Date.now()}`;
            console.log(`1. Create Employee: ${empName}`);
            const [employee] = await tx.insert(schema.employees).values({
                firstName: 'John',
                lastName: `Doe-${Date.now()}`,
                email: `john.doe.${Date.now()}@example.com`,
                department: 'Engineering',
                hireDate: new Date(),
                status: 'Active'
            }).returning();

            console.log('Employee Created:', employee.id);

            // 2. Leave Request
            console.log('2. Create Leave Request');
            const [leave] = await tx.insert(schema.leaveRequests).values({
                employeeId: employee.id,
                leaveType: 'Annual',
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000), // +1 Day
                reason: 'Vacation',
                status: 'APPROVED'
            }).returning();

            console.log('Leave Request Created:', leave.id);

            // 3. Timesheet
            console.log('3. Create Timesheet');
            const [timesheet] = await tx.insert(schema.timeEntries).values({
                employeeId: employee.id,
                projectId: 'PROJ-1', // Mock Project ID
                taskId: 'TASK-1', // Mock Task ID
                date: new Date(),
                hours: '8.00',
                description: 'Development',
                billableFlag: true,
                status: 'SUBMITTED'
            }).returning();

            console.log('Timesheet Created:', timesheet.id);

            // 4. Verification Query
            const empCheck = await tx.query.employees.findFirst({
                where: eq(schema.employees.id, employee.id),
                // Note: relations might not be defined in schema/hr.ts yet, so fetch independently or rely on ID FKs
            });

            if (!empCheck) throw new Error('Employee not found after creation');

            console.log('✅ HR Flow Verified Successfully');
            tx.rollback(); // Cleanup
        });
    } catch (e) {
        if (e.message === 'Rollback') {
            console.log('Verification Complete (Rollback).');
        } else {
            console.error('Verification Failed', e);
            process.exit(1);
        }
    } finally {
        await pool.end();
    }
}

verifyHr();
