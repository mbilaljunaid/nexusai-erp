
/**
 * Mock Email Service
 * In a real application, this would integrate with SendGrid, AWS SES, or similar.
 */
export class EmailService {
    static async sendEmail(to: string[], subject: string, body: string, attachments: any[] = []) {
        console.log(`\n[EmailService] ---------------------------------------------------`);
        console.log(`[EmailService] To: ${to.join(", ")}`);
        console.log(`[EmailService] Subject: ${subject}`);
        console.log(`[EmailService] Body: ${body}`);
        if (attachments.length > 0) {
            console.log(`[EmailService] Attachments: ${attachments.length} file(s)`);
        }
        console.log(`[EmailService] ---------------------------------------------------\n`);
        return true;
    }
}
