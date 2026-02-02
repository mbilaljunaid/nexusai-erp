
import {
    LeaseHeader, LeasePayment, LeaseSchedule
} from "../../shared/schema/lease";
import { addMonths, differenceInMonths, startOfMonth, endOfMonth } from "date-fns";

export class LeaseCalculationsService {

    /**
     * Calculate Net Present Value (NPV) of Lease Payments
     * Formula: Payment / (1 + Rate)^Period
     * Iterates through payment streams and expands them to monthly cash flows.
     */
    calculateNPV(payments: LeasePayment[], discountRate: number, commencementDate: Date): number {
        let npv = 0;
        const monthlyRate = discountRate / 12;

        for (const stream of payments) {
            const start = new Date(stream.startDate);
            const end = new Date(stream.endDate);
            const amount = Number(stream.amount);

            // Iterate months from start to end (Assuming MONTHLY frequency)
            let currentDate = new Date(start);
            // Ensure we don't loop forever or go past expiration
            while (currentDate <= end) {
                // Calculate period offset from Lease Commencement
                // Period 1 = Month 1
                const monthsFromStart = differenceInMonths(currentDate, commencementDate);
                const period = monthsFromStart + 1;

                if (period > 0) {
                    const pv = amount / Math.pow(1 + monthlyRate, period);
                    npv += pv;
                }

                // Advance 1 month
                currentDate = addMonths(currentDate, 1);
            }
        }

        return Number(npv.toFixed(2));
    }

    /**
     * Generate Amortization Schedule (IFRS 16)
     * Tracks Liability and ROU Asset over the lease term.
     */
    generateSchedule(
        header: LeaseHeader,
        payments: LeasePayment[],
        initialLiability: number
    ): Partial<LeaseSchedule>[] {
        const schedule: Partial<LeaseSchedule>[] = [];

        const monthlyRate = Number(header.discountRate) / 12;
        let currentLiability = initialLiability;
        let currentRou = initialLiability + Number(header.initialDirectCosts || 0) + Number(header.prepaidLeasePayments || 0) - Number(header.leaseIncentives || 0);

        const totalMonths = Number(header.termMonths);
        const monthlyDepreciation = currentRou / totalMonths;

        let currentDate = new Date(header.commencementDate);

        for (let i = 1; i <= totalMonths; i++) {
            // 1. Calculate Interest on Opening Liability
            const interest = currentLiability * monthlyRate;

            // 2. Determine Payment for this period
            // Check if any payment stream is active for this date
            const paymentStream = payments.find(p =>
                new Date(p.startDate) <= currentDate && new Date(p.endDate) >= currentDate
            );
            const paymentAmount = paymentStream ? Number(paymentStream.amount) : 0;

            // 3. Closing Liability
            const closingLiability = currentLiability + interest - paymentAmount;

            // 4. ROU Amortization (Straight Line)
            const rouClosing = currentRou - monthlyDepreciation;

            schedule.push({
                period: i,
                date: new Date(currentDate),
                openingLiability: currentLiability.toFixed(2),
                interestExpense: interest.toFixed(2),
                paymentAmount: paymentAmount.toFixed(2),
                // Handle near-zero precision issues at end of term
                closingLiability: i === totalMonths && Math.abs(closingLiability) < 10 ? "0.00" : closingLiability.toFixed(2),
                rouOpeningBalance: currentRou.toFixed(2),
                amortizationExpense: monthlyDepreciation.toFixed(2),
                rouClosingBalance: i === totalMonths && Math.abs(rouClosing) < 10 ? "0.00" : rouClosing.toFixed(2)
            });

            // Rollover
            currentLiability = Number(schedule[schedule.length - 1].closingLiability);
            currentRou = Number(schedule[schedule.length - 1].rouClosingBalance);
            currentDate = addMonths(currentDate, 1);
        }

        return schedule;
    }
}

export const leaseCalculationsService = new LeaseCalculationsService();
