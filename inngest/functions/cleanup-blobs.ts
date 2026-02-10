import { inngest } from "@/inngest/client";
import { list, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const cleanupOrphanedBlobs = inngest.createFunction(
    { id: "cleanup-orphaned-blobs" },
    { cron: "0 3 * * *" }, // Run at 3:00 AM every day
    async ({ step }) => {
        const deletedCount = await step.run("check-and-delete-orphans", async () => {
            let hasMore = true;
            let cursor: string | undefined;
            let deleted = 0;

            while (hasMore) {
                // List blobs in batches
                const { blobs, hasMore: more, cursor: nextCursor } = await list({
                    cursor,
                    limit: 100, // Process 100 at a time
                });

                hasMore = more;
                cursor = nextCursor;

                // Configure parallel processing for the batch
                await Promise.all(blobs.map(async (blob) => {
                    // Check if it matches our invoice pattern: Factura-{id}.pdf
                    // Path might be "Factura-123.pdf" or "folder/Factura-123.pdf"
                    const filename = blob.pathname.split('/').pop() || "";
                    const match = filename.match(/^Factura-(\d+)\.pdf$/);

                    if (match) {
                        const expenseId = parseInt(match[1]);

                        // Check if expense exists
                        const expense = await prisma.expense.findUnique({
                            where: { id: expenseId },
                            select: { id: true, pdfUrl: true }
                        });

                        // Criteria for deletion:
                        // 1. Expense does not exist (Orphaned)
                        // 2. Expense exists but pdfUrl is different (Replaced/Unlinked)
                        const isOrphan = !expense;
                        const isReplaced = expense && expense.pdfUrl !== blob.url;

                        if (isOrphan || isReplaced) {
                            console.log(`Deleting orphaned blob: ${blob.pathname} (Expense ID: ${expenseId})`);
                            await del(blob.url);
                            deleted++;
                        }
                    }
                }));
            }

            return deleted;
        });

        return { success: true, deletedBlobs: deletedCount };
    }
);
