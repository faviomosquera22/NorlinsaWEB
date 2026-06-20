import { DriveModule } from "@/components/drive-module";

export default function CompanyExpensesPage() { return <DriveModule title="Control de gastos 2026" source="Control de gastos 2026" description="Registro de egresos de empresa, beneficiarios, conceptos y saldo operativo." items={["Fecha, concepto, tipo y beneficiario", "Ingresos, egresos y saldo acumulado", "Compras de factura por accionista", "Trazabilidad del movimiento de origen"]} actionHref="/gastos" actionLabel="Ver gastos SRI"/>; }
