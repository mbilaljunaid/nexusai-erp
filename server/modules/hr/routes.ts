import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertEmployeeSchema, insertPayrollConfigSchema } from "../../../shared/schema";

export function registerHrRoutes(app: Express) {
    // Employees
    app.get("/api/employees", async (req, res) => {
        try {
            const employees = await storage.listEmployees(req.query.department as string);
            res.json(employees);
        } catch (error) {
            res.status(500).json({ error: "Failed to list employees" });
        }
    });

    app.get("/api/employees/:id", async (req, res) => {
        try {
            const employee = await storage.getEmployee(req.params.id);
            if (!employee) return res.status(404).json({ error: "Employee not found" });
            res.json(employee);
        } catch (error) {
            res.status(500).json({ error: "Failed to get employee" });
        }
    });

    app.post("/api/employees", async (req, res) => {
        try {
            const parseResult = insertEmployeeSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const employee = await storage.createEmployee(parseResult.data);
            res.status(201).json(employee);
        } catch (error) {
            res.status(500).json({ error: "Failed to create employee" });
        }
    });

    // Payroll Config
    app.get("/api/payroll/config", async (req, res) => {
        try {
            const configs = await storage.listPayrollConfigs();
            res.json(configs);
        } catch (error) {
            res.status(500).json({ error: "Failed to list payroll configs" });
        }
    });

    app.post("/api/payroll/config", async (req, res) => {
        try {
            const parseResult = insertPayrollConfigSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const config = await storage.createPayrollConfig(parseResult.data);
            res.status(201).json(config);
        } catch (error) {
            res.status(500).json({ error: "Failed to create payroll config" });
        }
    });
}
