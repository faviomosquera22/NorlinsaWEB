#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

const [file] = process.argv.slice(2);
if (!file) throw new Error("Uso: node scripts/import-workbook.mjs /ruta/libro.xlsx");
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
if (!url || !key) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data: organization, error: orgError } = await supabase.from("organizations").select("id").eq("slug", "norlinsa").single();
if (orgError) throw orgError;

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(file);
const raw = (value) => value && typeof value === "object" && "result" in value ? value.result : value;
const asNumber = (value) => typeof raw(value) === "number" ? raw(value) : Number(String(raw(value) ?? "").replace(/[$,]/g, "")) || 0;
const asDate = (value) => { const candidate = raw(value); return candidate instanceof Date ? candidate.toISOString().slice(0, 10) : candidate ? new Date(String(candidate)).toISOString().slice(0, 10) : null; };
const text = (value) => String(raw(value) ?? "").trim();
const normalize = (value) => text(value).toUpperCase().replace(/\s+/g, " ");
const chunk = (items, size = 250) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

const driverCache = new Map();
const shareholderCache = new Map();
async function idFor(table, cache, name) {
  if (!name) return null;
  const cacheKey = normalize(name);
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const { data, error } = await supabase.from(table).upsert({ organization_id: organization.id, name: name.trim() }, { onConflict: "organization_id,name" }).select("id").single();
  if (error) throw error;
  cache.set(cacheKey, data.id);
  return data.id;
}

let importedGuides = 0;
for (const worksheet of workbook.worksheets.filter(({ name }) => name.toUpperCase().includes("CONTROL DE GUIAS"))) {
  const sheetName = worksheet.name;
  const headers = Array.from(worksheet.getRow(2).values).map(normalize);
  const column = (label) => headers.findIndex((header) => header === label);
  const dateCol = column("FECHA DE COMPRA"), guideCol = column("GUIA"), vehicleCol = column("DISCO"), driverCol = column("NOMBRE CHOFERES"), rateCol = column("PORCENTAJE COBRADO"), advanceCol = column("ABONO"), costCol = column("COSTO DE GUIA ORIGINAL"), shareholderCol = column("ACCIONISTA"), invoiceCol = column("#FACTURA"), physicalCol = column("GUIA FISICA");
  const records = [];
  for (let index = 3; index <= worksheet.rowCount; index += 1) {
    const row = worksheet.getRow(index);
    const cell = (columnIndex) => columnIndex > 0 ? row.getCell(columnIndex).value : null;
    const purchaseDate = asDate(cell(dateCol));
    const cost = asNumber(cell(costCol));
    if (!purchaseDate || !cost) continue;
    const driverId = await idFor("drivers", driverCache, text(cell(driverCol)));
    const shareholderId = await idFor("shareholders", shareholderCache, text(cell(shareholderCol)));
    records.push({ organization_id: organization.id, purchase_date: purchaseDate, guide_number: text(cell(guideCol)) || null, vehicle_identifier: text(cell(vehicleCol)) || null, driver_id: driverId, shareholder_id: shareholderId, invoice_number: text(cell(invoiceCol)) || null, physical_status: text(cell(physicalCol)) || null, original_cost: cost, profitability_rate: asNumber(cell(rateCol)), advance: asNumber(cell(advanceCol)), source_sheet: sheetName, source_row: index });
  }
  for (const batch of chunk(records)) { const { error } = await supabase.from("guides").upsert(batch, { onConflict: "organization_id,source_sheet,source_row" }); if (error) throw error; importedGuides += batch.length; }
}

const taxSheet = workbook.getWorksheet("GASTOS SRI DECLARADOS");
let importedTaxExpenses = 0;
if (taxSheet) {
  for (let index = 7; index <= taxSheet.rowCount; index += 1) {
    const row = taxSheet.getRow(index);
    const cell = (columnIndex) => row.getCell(columnIndex).value;
    if (!cell(1) || normalize(cell(1)) === "RUC_EMISOR") continue;
    const subtotal = asNumber(cell(9)); const total = asNumber(cell(11));
    if (!subtotal && !total) continue;
    const authorizationValue = raw(cell(6));
    const record = { organization_id: organization.id, supplier_ruc: text(cell(1)) || null, supplier_name: text(cell(2)) || "Sin proveedor", receipt_type: text(cell(3)) || null, receipt_number: text(cell(4)) || null, access_key: text(cell(5)) || null, authorization_date: authorizationValue ? new Date(String(authorizationValue)).toISOString() : null, issue_date: asDate(cell(7)), recipient_identification: text(cell(8)) || null, subtotal, vat: asNumber(cell(10)), total, assigned_to: text(cell(12)) || null, source_sheet: "GASTOS SRI DECLARADOS", source_row: index };
    const { error } = await supabase.from("tax_expenses").upsert(record, { onConflict: "organization_id,source_sheet,source_row" }); if (error) throw error; importedTaxExpenses += 1;
  }
}
console.log(`Importación terminada: ${importedGuides} guías y ${importedTaxExpenses} gastos SRI.`);
