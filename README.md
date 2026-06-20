# NORLINSA · Control financiero

Aplicación Next.js para reemplazar el libro de control por un sistema compartido. Conserva los datos fuente y calcula rentabilidad, pago a chofer y transferencia en PostgreSQL.

## Puesta en marcha

1. Cree un proyecto de Supabase y ejecute `supabase/migrations/20260620_initial_schema.sql` y después `supabase/seed.sql` en SQL Editor.
2. En Authentication, cree o invite a los tres integrantes. Inserte sus UUID en `organization_members` siguiendo el ejemplo de `seed.sql`, o defina los tres correos y ejecute `npm run create:team` localmente.
3. Copie `.env.example` a `.env.local` y complete las credenciales.
4. Importe el libro: `NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-workbook.mjs /ruta/al/libro.xlsx`.
5. Ejecute `npm run dev`. Para Vercel, agregue solamente las dos variables `NEXT_PUBLIC_*`; la clave de servicio se usa solo de forma local para importar.

El acceso usa correo y contraseña. No guarde las contraseñas iniciales de los usuarios en Git ni en Vercel; el script local las utiliza una sola vez para crear las cuentas.

## Lo que se importa y automatiza

- Hojas `CONTROL DE GUIAS MES *`: guías, chofer, vehículo, accionista, factura, abono y costo.
- `GASTOS SRI DECLARADOS`: comprobantes, subtotal, IVA y total.
- Fórmulas migradas a campos generados de PostgreSQL: `rentabilidad = costo × porcentaje`, `pago_chofer = costo − rentabilidad − abono`, `transferencia = pago_chofer − comisión`.
- Políticas RLS: los tres usuarios autorizados leen y escriben el mismo negocio; cualquier usuario externo queda bloqueado.
- Auditoría de inserciones, cambios y eliminaciones de guías y gastos.

El libro no incluye catálogo de cuentas ni asientos de doble partida; por ello esta primera versión modela el control operativo-financiero existente. Para contabilidad formal/SRI completa falta definir ese catálogo, centros de costo y reglas de cierre.
