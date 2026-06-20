import { DriveModule } from "@/components/drive-module";

export default function DatabasePage() { return <DriveModule title="Base de datos de choferes" source="BASE DE DATOS" description="Catálogo único de vehículos, choferes y estado de factura para evitar registros repetidos o con nombres distintos." items={["Disco / placa normalizada", "Chofer o propietario", "Estado de factura", "Búsqueda reutilizable al registrar una guía"]} actionHref="/guias/nueva" actionLabel="Registrar una guía"/>; }
