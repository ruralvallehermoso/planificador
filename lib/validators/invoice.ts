import { z } from "zod";

export const InvoiceSchema = z.object({
    provider: z.string().describe("Nombre del proveedor o emisor de la factura"),
    date: z.string().describe("Fecha de la factura en formato ISO (YYYY-MM-DD)"),
    base_imponible: z.number().describe("Base imponible antes de impuestos"),
    iva_porcentaje: z.number().describe("Porcentaje de IVA aplicado (ej. 21, 10, 4)"),
    iva_cuota: z.number().describe("Importe total del IVA"),
    total: z.number().describe("Importe total de la factura"),
    categoria: z.enum(["LUZ", "AGUA", "INTERNET", "LAVANDERIA", "IBI", "OTROS"]).describe("Categoría del gasto"),
});

export type InvoiceData = z.infer<typeof InvoiceSchema>;
