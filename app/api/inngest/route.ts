import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processInvoice } from "@/inngest/functions/process-invoice";

// Create an API that serves zero-serverless functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processInvoice,
    ],
});
