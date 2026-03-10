
import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class EpmSecurityService {

    /**
     * Checks if a user has access to a specific planning intersection (Row-Level Security).
     * Mock implementation: Checks against hardcoded rules or user context.
     * 
     * @param userId User causing the action
     * @param entityId Entity being accessed
     * @param departmentId Department being accessed
     */
    validateAccess(userId: string, entityId: string, departmentId: string): boolean {
        // Mock Policy: User 'USER_US' can only access 'US' entity.
        if (userId === 'USER_US' && entityId !== 'US') {
            throw new ForbiddenException(`Access Denied: User ${userId} cannot access Entity ${entityId}`);
        }
        return true; // Default allow
    }

    /**
     * Masks sensitive values based on user role (Field-Level Security).
     * e.g. Salary accounts (6xxxx) are masked for non-HR admins.
     * 
     * @param userId User viewing data
     * @param accountId Account being viewed
     * @param value Actual value
     * @returns The value or a masked placeholder
     */
    applyFieldSecurity(userId: string, accountId: string, value: number): number | string {
        // Mock Policy: Accounts starting with '6' (Expenses/Salaries) are restricted.
        const isSensitive = accountId.startsWith('6');
        const hasAccess = userId === 'HR_ADMIN'; // Only HR can see

        if (isSensitive && !hasAccess) {
            return '***'; // Masked
        }
        return value;
    }
}
