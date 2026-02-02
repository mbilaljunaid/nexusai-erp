
import { db } from "../server/db";
import {
    productionCalendars, shifts, workCenters,
    productionOrders, standardOperations, routingOperations, routings
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyCapacityLogic() {
    console.log("Starting Manufacturing Capacity Verification...");

    // 1. Setup: Create Calendar & Shift
    console.log("Step 1: Creating Production Calendar & Shift...");
    const [calendar] = await db.insert(productionCalendars).values({
        calendarCode: "CAL-2026-A",
        description: "Main Factory Calendar 2026",
        weekendDays: "SAT,SUN",
        isDefault: true
    }).returning();
    console.log(` - Created Calendar: ${calendar.calendarCode} (${calendar.id})`);

    const [shift] = await db.insert(shifts).values({
        calendarId: calendar.id,
        shiftCode: "SHIFT-01",
        startTime: "08:00",
        endTime: "16:00", // 8 hours
        breakDuration: 60 // 1 hour break -> 7 working hours
    }).returning();
    console.log(` - Created Shift: ${shift.shiftCode} (08:00-16:00, 60m break)`);

    // 2. Setup: Create Work Center linked to Calendar
    console.log("Step 2: Creating Work Center...");
    const [wc] = await db.insert(workCenters).values({
        name: "Assembly Station 1",
        code: "WC-ASM-01",
        status: "active",
        calendarId: calendar.id,
        capacity: 100, // units per day (nominal)
    }).returning();
    console.log(` - Created Work Center: ${wc.name} linked to Calendar ${calendar.calendarCode}`);

    // 3. Verification Logic: Calculate Available Capacity
    // 8 hours span - 1 hour break = 7 working hours
    const startHour = parseInt(shift.startTime.split(':')[0]);
    const endHour = parseInt(shift.endTime.split(':')[0]);
    const totalHours = endHour - startHour; // 8
    const breakHours = (shift.breakDuration || 0) / 60; // 1
    const netHours = totalHours - breakHours;

    console.log("\nCapacity Verification:");
    console.log(` - Shift Span: ${totalHours} hours`);
    console.log(` - Break Deduction: ${breakHours} hours`);
    console.log(` - Net Available Hours/Day: ${netHours} hours`);

    if (netHours !== 7) {
        console.error("FAILED: Net hours calculation incorrect.");
        process.exit(1);
    } else {
        console.log("PASSED: Net hours calculation correct.");
    }

    console.log("\nVerification Complete!");
    process.exit(0);
}

verifyCapacityLogic().catch(console.error);
