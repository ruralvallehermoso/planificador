import { prisma } from "../lib/prisma";

async function main() {
    const count = await prisma.expense.count();
    console.log(`Total Expenses: ${count}`);

    const latest = await prisma.expense.findFirst({
        orderBy: { createdAt: 'desc' },
    });

    if (latest) {
        console.log("Latest Expense Entry (Casa Rural):");
        console.log(`ID: ${latest.id}`);
        console.log(`Date: ${latest.date}`);
        console.log(`Amount: ${latest.amount}`);
        console.log(`Category: ${latest.category}`);
        console.log(`Type: ${latest.type}`);
        console.log(`Description: ${latest.description}`);
    } else {
        console.log("No expenses found in Casa Rural DB.");
    }

    const logs = await prisma.webhookLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(`\nLast 5 Webhook Logs:`);
    logs.forEach(l => console.log(`- ${l.createdAt.toISOString()} (${l.provider})`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
