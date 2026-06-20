import { DriveModule } from "@/components/drive-module";

export default function InvestmentPage() { return <DriveModule title="Gastos, facturas e inversión" source="Gastos facturas y empresas" description="Consolidado de inversiones de creación, aportes de accionistas y pagos asociados." items={["Inversión por accionista", "Porcentaje de participación", "Pagos y saldo de inversión", "Detalle de cheque, beneficiario y concepto"]} actionHref="/guias" actionLabel="Ver operaciones de guías"/>; }
