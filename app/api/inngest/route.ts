import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processInvoice } from "@/inngest/functions/process-invoice";
import { cleanupOrphanedBlobs } from "@/inngest/functions/cleanup-blobs";

// Create an API that serves zero-serverless functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processInvoice,
        cleanupOrphanedBlobs,
    ],
});
