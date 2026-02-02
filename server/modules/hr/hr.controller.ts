import { Request, Response } from "express";
import { hrService } from "./services/HrService";
import { insertEmployeeSchema, insertPayrollConfigSchema } from "@shared/schema";

export class HrController {

    // @deprecated - Use PersonController
    async listEmployees(req: Request, res: Response) {
        try {
            const department = req.query.department as string;
            const employees = await hrService.listEmployees(department);
            res.json(employees);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to list employees" });
        }
    }

    async getEmployee(req: Request, res: Response) {
        try {
            const employee = await hrService.getEmployee(req.params.id);
            if (!employee) return res.status(404).json({ error: "Employee not found" });
            res.json(employee);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to get employee" });
        }
    }

    async createEmployee(req: Request, res: Response) {
        try {
            const parseResult = insertEmployeeSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const employee = await hrService.createEmployee(parseResult.data);
            res.status(201).json(employee);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to create employee" });
        }
    }

    async listPayrollConfigs(req: Request, res: Response) {
        try {
            const configs = await hrService.listPayrollConfigs();
            res.json(configs);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to list payroll configs" });
        }
    }

    async createPayrollConfig(req: Request, res: Response) {
        try {
            const parseResult = insertPayrollConfigSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const config = await hrService.createPayrollConfig(parseResult.data);
            res.status(201).json(config);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to create payroll config" });
        }
    }
}

export const hrController = new HrController();
