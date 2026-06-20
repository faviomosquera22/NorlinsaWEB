export type GuideRow = {
  id: string;
  date: string;
  driver: string;
  vehicle: string;
  shareholder: string;
  invoice: string;
  originalCost: number;
  profitability: number;
  payment: number;
  status: "Pendiente" | "Facturada" | "Pagada";
};

export type DashboardSnapshot = {
  isDemo: boolean;
  totals: { billed: number; profitability: number; driverPayments: number; taxExpenses: number };
  monthly: { month: string; billed: number; profitability: number; expenses: number }[];
  guides: GuideRow[];
};

export const demoSnapshot: DashboardSnapshot = {
  isDemo: true,
  totals: { billed: 19940.2, profitability: 1834.76, driverPayments: 15387.44, taxExpenses: 9183.86 },
  monthly: [
    { month: "Ene", billed: 18502.2, profitability: 1580.5, expenses: 4821.74 },
    { month: "Feb", billed: 18557.6, profitability: 1689.3, expenses: 8933.01 },
    { month: "Mar", billed: 51459.84, profitability: 4435.2, expenses: 10665.12 },
    { month: "Abr", billed: 33723.71, profitability: 2989.4, expenses: 8652.66 },
    { month: "May", billed: 19940.2, profitability: 1834.76, expenses: 9183.86 },
  ],
  guides: [
    { id: "1", date: "2026-05-12", driver: "Mercedes Bosquez", vehicle: "CBO0499", shareholder: "Jorge", invoice: "FACTURA #160", originalCost: 1355, profitability: 135.5, payment: 1219.5, status: "Pagada" },
    { id: "2", date: "2026-05-12", driver: "Cesar Valencia", vehicle: "GBN8190", shareholder: "Daniel", invoice: "FACTURA #160", originalCost: 1110, profitability: 88.8, payment: 1021.2, status: "Pagada" },
    { id: "3", date: "2026-05-12", driver: "Jose Miraba", vehicle: "GBP7113", shareholder: "Jorge", invoice: "FACTURA #160", originalCost: 1465, profitability: 117.2, payment: 1347.8, status: "Facturada" },
    { id: "4", date: "2026-05-12", driver: "Angel Valencia", vehicle: "GBP7538", shareholder: "Jorge", invoice: "FACTURA #160", originalCost: 1100, profitability: 88, payment: 1012, status: "Pendiente" },
  ],
};

export const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
