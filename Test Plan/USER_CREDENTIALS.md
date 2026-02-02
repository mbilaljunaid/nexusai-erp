# NexusAI - Test User Credentials

**Date Created**: December 2, 2025  
**Version**: 1.0  
**Environment**: Development / QA Testing

---

## TABLE OF CONTENTS
1. [Master Admin Account](#master-admin-account)
2. [Module-Specific Accounts](#module-specific-accounts)
3. [Role-Based Test Accounts](#role-based-test-accounts)
4. [Industry-Specific Test Accounts](#industry-specific-test-accounts)
5. [Access Restrictions & Permissions](#access-restrictions--permissions)
6. [Account Usage Guidelines](#account-usage-guidelines)

---

## MASTER ADMIN ACCOUNT

### Super Administrator
```
Email: admin@nexusaifirst.cloud
Password: Admin@123456
Role: System Administrator
Permissions: Full access to all modules, settings, user management
Module Access: All 12 modules + Admin Console
Status: ACTIVE
Created: 2025-12-02
```

**Capabilities:**
- Create, edit, delete users
- Assign roles and permissions
- Configure system settings
- View audit logs
- Manage all data across modules
- Access database and API management

---

## MODULE-SPECIFIC ACCOUNTS

### 1. CRM Module Manager
```
Email: crm.manager@nexusaifirst.cloud
Password: CRM@Manager123
Role: CRM Manager
Permissions: Full CRM module access
Module Access: CRM + Reports + Analytics
Status: ACTIVE
```

**Access:**
- Leads management
- Contacts & accounts
- Campaigns & pipeline
- CRM reports & analytics

### 2. Finance Module Manager
```
Email: finance.manager@nexusaifirst.cloud
Password: Finance@Manager123
Role: Finance Manager
Permissions: Full Finance module access
Module Access: Finance + Reports + Analytics
Status: ACTIVE
```

**Access:**
- Invoices & payments
- General ledger
- Accounts payable/receivable
- Budget management
- Financial reports

### 3. HR Module Manager
```
Email: hr.manager@nexusaifirst.cloud
Password: HR@Manager123
Role: HR Manager
Permissions: Full HR module access
Module Access: HR + Reports + Analytics
Status: ACTIVE
```

**Access:**
- Employee directory
- Payroll management
- Attendance tracking
- Leave management
- Recruitment & onboarding
- HR analytics

### 4. Supply Chain Manager
```
Email: supply.chain@nexusaifirst.cloud
Password: SupplyChain@123
Role: Supply Chain Manager
Permissions: Full Supply Chain module access
Module Access: Supply Chain + ERP + Reports
Status: ACTIVE
```

**Access:**
- Purchase orders
- Inventory management
- Warehouse operations
- Vendor management
- Supplier performance

### 5. Manufacturing Manager
```
Email: manufacturing@nexusaifirst.cloud
Password: Manufacturing@123
Role: Manufacturing Manager
Permissions: Full Manufacturing module access
Module Access: Manufacturing + ERP + Reports
Status: ACTIVE
```

**Access:**
- Work orders
- Production scheduling
- Bill of materials (BOM)
- Quality control
- Equipment utilization

### 6. Projects Manager
```
Email: projects.manager@nexusaifirst.cloud
Password: Projects@Manager123
Role: Projects Manager
Permissions: Full Projects module access
Module Access: Projects + Reports + Analytics
Status: ACTIVE
```

**Access:**
- Project management
- Task allocation
- Resource management
- Time tracking
- Budget tracking

### 7. Sales Manager
```
Email: sales.manager@nexusaifirst.cloud
Password: Sales@Manager123
Role: Sales Manager
Permissions: Full Sales module access
Module Access: Sales + CRM + Reports
Status: ACTIVE
```

**Access:**
- Sales opportunities
- Deal management
- Quotes & proposals
- Sales forecasting
- Pipeline analytics

### 8. Service Manager
```
Email: service.manager@nexusaifirst.cloud
Password: Service@Manager123
Role: Service Manager
Permissions: Full Service module access
Module Access: Service + Reports
Status: ACTIVE
```

**Access:**
- Service tickets
- Customer support cases
- SLA management
- Service analytics

### 9. Analytics Manager
```
Email: analytics.manager@nexusaifirst.cloud
Password: Analytics@Manager123
Role: Analytics Manager
Permissions: Full Analytics module access
Module Access: Analytics + Reports + All modules (read-only)
Status: ACTIVE
```

**Access:**
- Dashboards & BI
- Custom reports
- Data analysis
- Predictive insights

### 10. Compliance Officer
```
Email: compliance.officer@nexusaifirst.cloud
Password: Compliance@Officer123
Role: Compliance Officer
Permissions: Full Compliance module access
Module Access: Compliance + Audit + All modules (read-only)
Status: ACTIVE
```

**Access:**
- Compliance monitoring
- Risk assessment
- Audit trails
- Policy management
- Regulatory reporting

---

## ROLE-BASED TEST ACCOUNTS

### Standard User (Read/Write Access to Assigned Modules)
```
Email: standarduser@nexusaifirst.cloud
Password: Standard@User123
Role: Standard User
Permissions: Read, Create, Edit (limited modules)
Module Access: CRM, Finance, Reports (limited)
Status: ACTIVE
```

### Viewer (Read-Only Access)
```
Email: viewer@nexusaifirst.cloud
Password: Viewer@123456
Role: Viewer
Permissions: Read-only on all modules
Module Access: All modules (view only)
Status: ACTIVE
```

**Capabilities:**
- View all module data
- View reports
- Create SmartViews (not save to database)
- No create/edit/delete permissions

### Finance Approver
```
Email: finance.approver@nexusaifirst.cloud
Password: FinanceApprover@123
Role: Finance Approver
Permissions: Approve invoices, payments, expense reports
Module Access: Finance + Reports
Status: ACTIVE
```

**Capabilities:**
- Review finance documents
- Approve/reject transactions
- View financial reports
- No direct data entry

### Data Entry Operator
```
Email: data.entry@nexusaifirst.cloud
Password: DataEntry@123
Role: Data Entry Operator
Permissions: Create & edit records only
Module Access: CRM, Finance, Supply Chain (limited)
Status: ACTIVE
```

**Capabilities:**
- Create new records
- Edit assigned records
- No delete permissions
- No report access

### Department Head
```
Email: dept.head@nexusaifirst.cloud
Password: DeptHead@123456
Role: Department Head
Permissions: Manage department data, approve workflows
Module Access: Assigned department modules + Reports
Status: ACTIVE
```

---

## INDUSTRY-SPECIFIC TEST ACCOUNTS

### Automotive Industry User
```
Email: automotive.user@nexusaifirst.cloud
Password: Automotive@User123
Role: Industry-Specific User
Industry: Automotive
Module Access: CRM, Finance, Manufacturing, Supply Chain, Projects, Analytics
Status: ACTIVE
```

### Healthcare Industry User
```
Email: healthcare.user@nexusaifirst.cloud
Password: Healthcare@User123
Role: Industry-Specific User
Industry: Healthcare
Module Access: CRM, Finance, HR, Compliance, Analytics, Service
Status: ACTIVE
```

### Retail Industry User
```
Email: retail.user@nexusaifirst.cloud
Password: Retail@User123
Role: Industry-Specific User
Industry: Retail
Module Access: CRM, Finance, Supply Chain, Sales, Analytics
Status: ACTIVE
```

### Manufacturing Industry User
```
Email: manufacturing.user@nexusaifirst.cloud
Password: Manufacturing@User123
Role: Industry-Specific User
Industry: Manufacturing
Module Access: Manufacturing, Finance, Supply Chain, HR, ERP, Analytics
Status: ACTIVE
```

---

## ACCESS RESTRICTIONS & PERMISSIONS

### Permission Matrix

| Role | CRM | Finance | HR | Manufacturing | Supply Chain | Projects | Service | Sales | Analytics | Compliance | Admin |
|------|-----|---------|----|----|---|---------|---------|-------|----------|-----------|-------|
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| CRM Manager | ✅ Full | ⚠️ View | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full | ✅ View | ❌ | ❌ |
| Finance Manager | ⚠️ View | ✅ Full | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ❌ | ⚠️ View | ✅ View | ❌ | ❌ |
| HR Manager | ❌ | ⚠️ View | ✅ Full | ❌ | ❌ | ⚠️ View | ❌ | ❌ | ✅ View | ❌ | ❌ |
| Viewer | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View | ⚠️ View |

**Legend:**
- ✅ Full = Create, Read, Edit, Delete
- ⚠️ View = Read-Only
- ❌ = No Access

---

## ACCOUNT USAGE GUIDELINES

### Testing Best Practices

#### 1. Admin Account Usage
- Use only for system configuration & troubleshooting
- Test admin functions in isolated environment
- Verify RBAC restrictions with other user roles
- Monitor all admin activities in audit logs

#### 2. Module Manager Testing
- Test each module independently
- Verify cross-module data access restrictions
- Test workflows and approvals
- Create sample data in each module

#### 3. Role-Based Testing
- Test read-only access with Viewer account
- Test limited edit access with Standard User
- Verify permission boundaries
- Test denied access scenarios

#### 4. Data Isolation Testing
- Verify users see only permitted data
- Test department-level data restrictions
- Verify customer/vendor isolation
- Check multi-tenancy boundaries

#### 5. Workflow Testing
- Create records as Data Entry Operator
- Approve as Finance Approver
- Review as Manager
- Verify audit trail

### Creating Test Data

#### CRM Test Data
```
Lead Record:
  Created By: crm.manager@nexusaifirst.cloud
  Company: Test Company Inc
  Lead Value: $100,000
  Status: Active
  Source: Website
```

#### Finance Test Data
```
Invoice Record:
  Created By: finance.manager@nexusaifirst.cloud
  Customer: Test Customer
  Amount: $50,000
  Due Date: 2025-12-31
  Status: Unpaid
```

#### HR Test Data
```
Employee Record:
  Created By: hr.manager@nexusaifirst.cloud
  Name: Test Employee
  Position: QA Tester
  Department: Engineering
  Start Date: 2025-01-01
```

---

## PASSWORD POLICY

### Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (@#$%)
- Not shared between accounts
- Changed every 90 days for production

### Test Account Password Format
```
[Role]@[Type][Number]
Example: CRM@Manager123
```

---

## ACCOUNT LIFECYCLE

### New Account Setup
1. Create account with temporary password
2. User logs in and changes password
3. Assign to appropriate role
4. Grant module-specific permissions
5. Log setup in audit trail

### Account Deactivation
1. Mark account as INACTIVE
2. Remove from all roles
3. Audit log entry created
4. Data remains (for compliance)
5. Account can be reactivated if needed

### Account Testing
```
Test Scenario: New user onboarding
1. Create new user account
2. Assign CRM role
3. Grant Finance module view access
4. Verify permissions in app
5. Create test record
6. Verify audit log entry
```

---

## SECURITY NOTES

⚠️ **IMPORTANT**
- These are TEST credentials only - for QA/Development environments
- Never use in production
- Change passwords after initial testing
- Rotate accounts every 30 days
- Monitor for unauthorized access
- Audit logs should be reviewed regularly
- 2FA recommended for admin accounts in production

---

## QUICK REFERENCE TABLE

| User Type | Email | Password | Primary Module | Status |
|-----------|-------|----------|-----------------|--------|
| Admin | admin@nexusaifirst.cloud | Admin@123456 | All | ✅ ACTIVE |
| CRM Manager | crm.manager@nexusaifirst.cloud | CRM@Manager123 | CRM | ✅ ACTIVE |
| Finance Manager | finance.manager@nexusaifirst.cloud | Finance@Manager123 | Finance | ✅ ACTIVE |
| HR Manager | hr.manager@nexusaifirst.cloud | HR@Manager123 | HR | ✅ ACTIVE |
| Supply Chain | supply.chain@nexusaifirst.cloud | SupplyChain@123 | Supply Chain | ✅ ACTIVE |
| Manufacturing | manufacturing@nexusaifirst.cloud | Manufacturing@123 | Manufacturing | ✅ ACTIVE |
| Projects Manager | projects.manager@nexusaifirst.cloud | Projects@Manager123 | Projects | ✅ ACTIVE |
| Sales Manager | sales.manager@nexusaifirst.cloud | Sales@Manager123 | Sales | ✅ ACTIVE |
| Service Manager | service.manager@nexusaifirst.cloud | Service@Manager123 | Service | ✅ ACTIVE |
| Analytics Manager | analytics.manager@nexusaifirst.cloud | Analytics@Manager123 | Analytics | ✅ ACTIVE |
| Compliance Officer | compliance.officer@nexusaifirst.cloud | Compliance@Officer123 | Compliance | ✅ ACTIVE |
| Standard User | standarduser@nexusaifirst.cloud | Standard@User123 | Limited | ✅ ACTIVE |
| Viewer | viewer@nexusaifirst.cloud | Viewer@123456 | All (Read-Only) | ✅ ACTIVE |
| Finance Approver | finance.approver@nexusaifirst.cloud | FinanceApprover@123 | Finance | ✅ ACTIVE |
| Data Entry | data.entry@nexusaifirst.cloud | DataEntry@123 | Limited | ✅ ACTIVE |
| Automotive | automotive.user@nexusaifirst.cloud | Automotive@User123 | Industry-Specific | ✅ ACTIVE |
| Healthcare | healthcare.user@nexusaifirst.cloud | Healthcare@User123 | Industry-Specific | ✅ ACTIVE |
| Retail | retail.user@nexusaifirst.cloud | Retail@User123 | Industry-Specific | ✅ ACTIVE |
| Manufacturing | manufacturing.user@nexusaifirst.cloud | Manufacturing@User123 | Industry-Specific | ✅ ACTIVE |

---

## Document Information

**File**: USER_CREDENTIALS.md  
**Version**: 1.0  
**Created**: December 2, 2025  
**Location**: Test Plan folder  
**Status**: Ready for QA Testing ✅

---

⚠️ **CONFIDENTIAL - TEST CREDENTIALS ONLY**  
Do not share with unauthorized personnel. Use only in development/QA environments.
