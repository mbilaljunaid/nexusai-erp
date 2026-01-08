// server/services/ap.ts
import { storage } from "../storage";
import { InsertApSupplier, InsertApInvoice, InsertApPayment, InsertApApproval } from "@shared/schema";

export const apService = {
    // Suppliers
    async listSuppliers() {
        return await storage.listApSuppliers();
    },
    async createSupplier(data: InsertApSupplier) {
        return await storage.createApSupplier(data);
    },
    async getSupplier(id: string) {
        return await storage.getApSupplier(id);
    },
    async updateSupplier(id: string, data: Partial<InsertApSupplier>) {
        return await storage.updateApSupplier(id, data);
    },
    async deleteSupplier(id: string) {
        return await storage.deleteApSupplier(id);
    },

    // Invoices
    async listInvoices() {
        return await storage.listApInvoices();
    },
    async createInvoice(data: InsertApInvoice) {
        return await storage.createApInvoice(data);
    },
    async getInvoice(id: string) {
        return await storage.getApInvoice(id);
    },
    async updateInvoice(id: string, data: Partial<InsertApInvoice>) {
        return await storage.updateApInvoice(id, data);
    },
    async deleteInvoice(id: string) {
        return await storage.deleteApInvoice(id);
    },

    // Payments
    async listPayments() {
        return await storage.listApPayments();
    },
    async createPayment(data: InsertApPayment) {
        return await storage.createApPayment(data);
    },
    async getPayment(id: string) {
        return await storage.getApPayment(id);
    },
    async updatePayment(id: string, data: Partial<InsertApPayment>) {
        return await storage.updateApPayment(id, data);
    },
    async deletePayment(id: string) {
        return await storage.deleteApPayment(id);
    },

    // Approvals (for invoices)
    async listApprovals() {
        return await storage.listApApprovals();
    },
    async createApproval(data: InsertApApproval) {
        return await storage.createApApproval(data);
    },
    async getApproval(id: string) {
        return await storage.getApApproval(id);
    },
    async updateApproval(id: string, data: Partial<InsertApApproval>) {
        return await storage.updateApApproval(id, data);
    },
    async deleteApproval(id: string) {
        return await storage.deleteApApproval(id);
    },
};
