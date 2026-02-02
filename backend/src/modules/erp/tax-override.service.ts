import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';

export interface User {
    id: string;
    username: string;
    roles: string[];
    tenantId: string;
}

@Injectable()
export class TaxOverrideService {
    private readonly logger = new Logger(TaxOverrideService.name);

    constructor(private readonly auditService: AuditService) { }

    /**
     * Allows a privileged user to override tax details on a transaction.
     * Requires 'tax_reviewer' role.
     * Logs the action for audit purposes.
     */
    async overrideTaxTransaction(
        user: User,
        transactionId: string,
        overrideDetails: { taxAmount?: number; taxRate?: number; reason: string },
    ) {
        if (!user.roles.includes('tax_reviewer') && !user.roles.includes('admin')) {
            throw new UnauthorizedException('User does not have permission to override tax transactions.');
        }

        this.logger.log(`User ${user.username} is overriding tax for transaction ${transactionId}`);

        // Logic to actually update the transaction would go here.
        // For now, we stub it.

        // Audit Log
        this.auditService.log(
            user.tenantId,
            'TAX_OVERRIDE',
            'Transaction',
            transactionId,
            {
                taxOverride: {
                    before: {}, // In real world, fetch prior state
                    after: overrideDetails,
                },
            },
            user.id,
        );

        return {
            status: 'SUCCESS',
            transactionId,
            appliedOverride: overrideDetails,
            audited: true,
        };
    }
}
