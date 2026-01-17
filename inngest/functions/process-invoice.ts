// ... imports
import { inngest } from "@/inngest/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const processInvoice = inngest.createFunction(
    { id: "process-invoice" },
    { event: "invoice/received" },
    async ({ event, step }) => {
        const { pdfBase64, pdfUrl, fileName, from } = event.data;

        if (!pdfBase64 && !pdfUrl) {
            return { error: "No PDF content or URL provided" };
        }

        // 1. Prepare PDF Content (Download if URL, or use Base64)
        const finalPdfBase64 = await step.run("fetch-pdf-content", async () => {
            if (pdfUrl) {
                console.log(`Downloading PDF from URL: ${pdfUrl}`);
                const response = await fetch(pdfUrl);
                if (!response.ok) throw new Error(`Failed to fetch PDF from ${pdfUrl}: ${response.statusText}`);
                const arrayBuffer = await response.arrayBuffer();
                return Buffer.from(arrayBuffer).toString('base64');
            }
            return pdfBase64;
        });

        // 2. Call Gemini to extract data
        const extraction = await step.run("extract-data-with-gemini", async () => {
            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            if (!apiKey) throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview", // Usando la versión experimental solicitada
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `
            Actúa como un experto contable español. Analiza este PDF de factura.
            Extrae los datos para insertarlos en una contabilidad de casa rural.
            
            Campos requeridos:
            - provider: Nombre del proveedor
            - date: Fecha factura (ISO YYYY-MM-DDT00:00:00Z)
            - total: Importe total (number)
            - base: Base imponible (number)
            - iva: Cuota IVA (number)
            - category: Categoría del gasto (TEXTO LIBRE, ej: "Suministros", "Mantenimiento", "Impuestos", etc.)
            - type: "MONTHLY" (gastos recurrentes como luz, agua) o "ANNUAL" (seguros, IBI, basuras). Por defecto MONTHLY.

            Responde con este JSON estricto:
            {
                "provider": string,
                "date": string,
                "total": number,
                "base": number,
                "iva": number,
                "category": string,
                "type": "MONTHLY" | "ANNUAL"
            }
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: finalPdfBase64,
                        mimeType: "application/pdf",
                    },
                },
            ]);

            const text = result.response.text();
            return { text };
        });

        // 3. Validate and Save to Database
        const savedExpense = await step.run("save-to-database", async () => {
            let data;
            try {
                data = JSON.parse(extraction.text);
            } catch (e) {
                throw new Error("Failed to parse Gemini response as JSON: " + extraction.text);
            }

            // Construct Description
            const description = `${data.provider} (Base: ${data.base}€, IVA: ${data.iva}€)`;

            // Create Expense in Prisma (mapped to casarural schema)
            const expense = await prisma.expense.create({
                data: {
                    date: new Date(data.date),
                    amount: new Prisma.Decimal(data.total),
                    type: data.type || "MONTHLY",
                    category: data.category || "OTROS",
                    description: description,
                    applicableYear: new Date(data.date).getFullYear(),
                }
            });

            return expense;
        });

        return { success: true, expenseId: savedExpense.id };
    }
);
