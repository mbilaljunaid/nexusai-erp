
import { Test } from '@nestjs/testing';
import { LeaveService } from '../src/modules/hr/leave.service';
import { DRIZZLE_DB, DrizzleProvider } from '../src/database/drizzle.provider'; // Adjust if DrizzleProvider export needs verification
import * as schema from '../../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { ConfigModule } from '@nestjs/config';

// Mock Config if needed or let DrizzleProvider handle .env
// DrizzleProvider usually uses ConfigService. 

async function verifyHrModule() {
    console.log('🔍 Starting HR Module Verification (Minimal Setup)...');

    // We need ConfigModule for DrizzleProvider to read env vars
    const moduleRef = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })
        ],
        providers: [
            DrizzleProvider,
            LeaveService
        ],
    }).compile();

    const db = moduleRef.get(DRIZZLE_DB);
    const leaveService = moduleRef.get(LeaveService);

    console.log('✅ HR Service Instantiated');

    try {
        // 1. Create Test Employee
        const empEmail = 'hr-test-verify-simple@nexus.ai';
        // Need to cast db or use as any if types issue, but should be fine
        const dbTyped = db as NodePgDatabase<typeof schema>;

        let employee = await dbTyped.query.employees.findFirst({
            where: eq(schema.employees.email, empEmail)
        });

        if (!employee) {
            console.log('👤 Creating Test Employee...');
            const [newEmp] = await dbTyped.insert(schema.employees).values({
                firstName: 'Verify',
                lastName: 'Simple',
                email: empEmail,
                department: 'QA',
                status: 'active',
                hireDate: new Date()
            }).returning();
            employee = newEmp;
        }
        console.log(`✅ Employee ID: ${employee.id}`);

        // 2. Create Leave Request via Service
        console.log('📅 Creating Leave Request...');
        const leaveDto = {
            employeeId: employee.id,
            leaveType: 'Sick',
            startDate: '2024-07-01',
            endDate: '2024-07-03',
            days: '2',
            reason: 'Simple Verification Test',
            status: 'PENDING'
        };

        const leave = await leaveService.create(leaveDto);
        console.log(`✅ Leave Request Created: ${leave.id} (Status: ${leave.status})`);

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        console.log('🏁 Verification Complete');
        process.exit(0);
    }
}

verifyHrModule();
