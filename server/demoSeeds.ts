// Industry-specific demo data generators
export const industrySeeds = {
  "Automotive": {
    models: [
      { id: "M001", name: "Sedan Pro", category: "Sedan", price: 25000 },
      { id: "M002", name: "SUV Max", category: "SUV", price: 35000 },
      { id: "M003", name: "Electric EV", category: "EV", price: 45000 }
    ],
    dealers: [
      { id: "D001", name: "Metro Motors", city: "New York", inventory: 150 },
      { id: "D002", name: "City Auto", city: "Los Angeles", inventory: 200 }
    ],
    customers: [
      { id: "C001", name: "John Doe", email: "john@demo.com", phone: "555-0001" },
      { id: "C002", name: "Jane Smith", email: "jane@demo.com", phone: "555-0002" }
    ]
  },
  "Banking": {
    accounts: [
      { id: "ACC001", customer: "John Doe", type: "Checking", balance: 50000 },
      { id: "ACC002", customer: "Jane Smith", type: "Savings", balance: 100000 }
    ],
    loans: [
      { id: "LOAN001", customer: "John Doe", amount: 250000, rate: 3.5 },
      { id: "LOAN002", customer: "Jane Smith", amount: 150000, rate: 2.8 }
    ],
    transactions: [
      { id: "TXN001", account: "ACC001", type: "Deposit", amount: 5000 },
      { id: "TXN002", account: "ACC002", type: "Withdrawal", amount: 2000 }
    ]
  },
  "Healthcare": {
    patients: [
      { id: "P001", name: "Alice Johnson", dob: "1980-05-15", email: "alice@demo.com" },
      { id: "P002", name: "Bob Wilson", dob: "1975-08-20", email: "bob@demo.com" }
    ],
    appointments: [
      { id: "APT001", patient: "P001", doctor: "Dr. Smith", date: "2025-01-15" },
      { id: "APT002", patient: "P002", doctor: "Dr. Jones", date: "2025-01-16" }
    ],
    medications: [
      { id: "MED001", name: "Aspirin", stock: 500, price: 5 },
      { id: "MED002", name: "Ibuprofen", stock: 300, price: 8 }
    ]
  },
  "Retail": {
    products: [
      { id: "SKU001", name: "Running Shoes", category: "Footwear", price: 89.99, stock: 200 },
      { id: "SKU002", name: "T-Shirt", category: "Apparel", price: 29.99, stock: 500 },
      { id: "SKU003", name: "Jeans", category: "Apparel", price: 59.99, stock: 300 }
    ],
    orders: [
      { id: "ORD001", customer: "John Demo", items: 2, total: 179.97, status: "Delivered" },
      { id: "ORD002", customer: "Jane Demo", items: 1, total: 89.99, status: "Processing" }
    ],
    inventory: [
      { id: "INV001", location: "Warehouse A", items: 1500, lastStock: "2025-01-10" }
    ]
  },
  "Manufacturing": {
    bom: [
      { id: "BOM001", product: "Assembly Unit A", components: 15, leadTime: 7 },
      { id: "BOM002", product: "Assembly Unit B", components: 12, leadTime: 5 }
    ],
    workorders: [
      { id: "WO001", product: "Unit A", quantity: 100, status: "In Progress", dueDate: "2025-01-20" },
      { id: "WO002", product: "Unit B", quantity: 50, status: "Scheduled", dueDate: "2025-01-25" }
    ],
    suppliers: [
      { id: "SUP001", name: "Parts Co", leadTime: 7, quality: 98 },
      { id: "SUP002", name: "Supply Ltd", leadTime: 5, quality: 95 }
    ]
  },
  "Education": {
    students: [
      { id: "STU001", name: "Emma Brown", email: "emma@demo.edu", program: "Computer Science" },
      { id: "STU002", name: "Liam Davis", email: "liam@demo.edu", program: "Business Admin" }
    ],
    courses: [
      { id: "CRS001", name: "Data Science", credits: 3, instructor: "Prof. Smith", enrollment: 45 },
      { id: "CRS002", name: "Financial Mgmt", credits: 3, instructor: "Prof. Jones", enrollment: 30 }
    ],
    grades: [
      { id: "GRD001", student: "STU001", course: "CRS001", score: 92, grade: "A" },
      { id: "GRD002", student: "STU002", course: "CRS002", score: 88, grade: "A-" }
    ]
  }
};

export function generateDemoData(industry: string) {
  const seed = industrySeeds[industry as keyof typeof industrySeeds];
  if (!seed) return null;
  
  return {
    industry,
    timestamp: new Date().toISOString(),
    recordCount: Object.values(seed).flat().length,
    data: seed
  };
}
