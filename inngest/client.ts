import { Inngest } from "inngest";
import { InvoiceData } from "@/lib/validators/invoice";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "planificador-app" });

export type InngestEvents = {
    "invoice/received": {
        data: {
            pdfBase64: string;
            fileName?: string;
            from?: string;
        }
    }
}
