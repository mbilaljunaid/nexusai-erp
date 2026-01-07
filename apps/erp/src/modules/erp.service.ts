import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity, EmployeeEntity, InvoiceEntity, ItemEntity, SupplierEntity, PurchaseOrderEntity, ProjectEntity, TaskEntity } from './erp.entities';

@Injectable()
export class ERPService {
    private readonly logger = new Logger(ERPService.name);

    constructor(
        @InjectRepository(LeadEntity) private leadRepo: Repository<LeadEntity>,
        @InjectRepository(EmployeeEntity) private employeeRepo: Repository<EmployeeEntity>,
        @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
        @InjectRepository(ItemEntity) private itemRepo: Repository<ItemEntity>,
        @InjectRepository(SupplierEntity) private supplierRepo: Repository<SupplierEntity>,
        @InjectRepository(PurchaseOrderEntity) private poRepo: Repository<PurchaseOrderEntity>,
        @InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
        @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
    ) { }

    // CRM
    async createLead(tenantId: string, data: any) {
        return this.leadRepo.save(this.leadRepo.create({ ...data, tenantId }));
    }

    async findAllLeads(tenantId: string) {
        return this.leadRepo.find({ where: { tenantId } });
    }

    // HR
    async createEmployee(tenantId: string, data: any) {
        return this.employeeRepo.save(this.employeeRepo.create({ ...data, tenantId }));
    }

    async findAllEmployees(tenantId: string) {
        return this.employeeRepo.find({ where: { tenantId } });
    }

    // Finance
    async createInvoice(tenantId: string, data: any) {
        return this.invoiceRepo.save(this.invoiceRepo.create({ ...data, tenantId }));
    }

    async findAllInvoices(tenantId: string) {
        return this.invoiceRepo.find({ where: { tenantId } });
    }

    // Inventory
    async createItem(tenantId: string, data: any) {
        return this.itemRepo.save(this.itemRepo.create({ ...data, tenantId }));
    }
    async findAllItems(tenantId: string) {
        return this.itemRepo.find({ where: { tenantId } });
    }

    // Procurement
    async createSupplier(tenantId: string, data: any) {
        return this.supplierRepo.save(this.supplierRepo.create({ ...data, tenantId }));
    }
    async findAllSuppliers(tenantId: string) {
        return this.supplierRepo.find({ where: { tenantId } });
    }
    async createPO(tenantId: string, data: any) {
        return this.poRepo.save(this.poRepo.create({ ...data, tenantId }));
    }
    async findAllPOs(tenantId: string) {
        return this.poRepo.find({ where: { tenantId } });
    }

    // Projects
    async createProject(tenantId: string, data: any) {
        return this.projectRepo.save(this.projectRepo.create({ ...data, tenantId }));
    }
    async findAllProjects(tenantId: string) {
        return this.projectRepo.find({ where: { tenantId } });
    }
    async createTask(tenantId: string, data: any) {
        return this.taskRepo.save(this.taskRepo.create({ ...data, tenantId }));
    }
    async findAllTasks(tenantId: string, projectId?: string) {
        if (projectId) {
            return this.taskRepo.find({ where: { tenantId, projectId } });
        }
        return this.taskRepo.find({ where: { tenantId } });
    }
}
