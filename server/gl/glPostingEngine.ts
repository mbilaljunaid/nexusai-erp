
export interface GLPostRequest {
    source: string;
    referenceId: string;
    amount: number;
    currency: string;
    debitAccount: string;
    creditAccount: string;
    description?: string;
    date: Date;
    tenantId?: string;
}

export interface GLPostResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export class GLPostingEngine {
    async postTransaction(request: GLPostRequest): Promise<GLPostResult> {
        console.log("GLPostingEngine: Posting transaction", request);
        return { success: true, transactionId: "mock-tx-id" };
    }

    async validateTransaction(request: GLPostRequest): Promise<boolean> {
        return true;
    }
}

export const glPostingEngine = new GLPostingEngine();
