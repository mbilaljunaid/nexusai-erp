const fs = require('fs');

let apService = fs.readFileSync('server/services/ap.ts', 'utf8');
apService = apService.replace(/applyPrepayment\(standardInvoiceId: number, prepayId: number, amount: number, userId: string\)/g, 'applyPrepayment(standardInvoiceId: string, prepayId: string, amount: number, userId: string)');
apService = apService.replace(/unapplyPrepayment\(applicationId: number, userId: string\)/g, 'unapplyPrepayment(applicationId: string, userId: string)');
fs.writeFileSync('server/services/ap.ts', apService);

let apRoutes = fs.readFileSync('server/routes/ap.ts', 'utf8');

apRoutes = apRoutes.replace(/apService\.validateInvoice\(parseInt\(req\.params\.id\)\)/g, "apService.validateInvoice(req.params.id)");
apRoutes = apRoutes.replace(/apService\.matchInvoiceToPO\(parseInt\(req\.params\.id\), req\.body\)/g, "apService.matchInvoiceToPO(req.params.id, req.body)");
apRoutes = apRoutes.replace(/apService\.getInvoiceHolds\(parseInt\(req\.params\.id\)\)/g, "apService.getInvoiceHolds(req.params.id)");
apRoutes = apRoutes.replace(/eq\(apInvoices\.id, parseInt\(req\.params\.id\)\)/g, "eq(apInvoices.id, req.params.id as any)"); // Cast to any to avoid type complaints before sync
apRoutes = apRoutes.replace(/const id = parseInt\(req\.params\.id\);/g, "const id = req.params.id;");
apRoutes = apRoutes.replace(/apService\.releaseHold\(parseInt\(req\.params\.id\)/g, "apService.releaseHold(req.params.id as string)");
apRoutes = apRoutes.replace(/apService\.getPrepayApplications\(parseInt\(req\.params\.id\)\)/g, "apService.getPrepayApplications(req.params.id)");
apRoutes = apRoutes.replace(/apService\.applyPrepayment\(parseInt\(req\.params\.id\)/g, "apService.applyPrepayment(req.params.id)");
apRoutes = apRoutes.replace(/apService\.unapplyPrepayment\(parseInt\(req\.params\.id\)/g, "apService.unapplyPrepayment(req.params.id)");
apRoutes = apRoutes.replace(/const invoiceId = parseInt\(req\.params\.id\);/g, "const invoiceId = req.params.id;");

fs.writeFileSync('server/routes/ap.ts', apRoutes);
console.log("Replaced parseInt in ap routes and updated types");
