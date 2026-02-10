
import { prisma } from '../lib/prisma';

async function main() {
    const totalExpenses = await prisma.expense.count();
    const expensesWithPdf = await prisma.expense.count({
        where: {
            pdfUrl: {
                not: null
            }
        }
    });

    console.log(`Total Expenses: ${totalExpenses}`);
    console.log(`Expenses with PDF: ${expensesWithPdf}`);

    if (expensesWithPdf > 0) {
        const sample = await prisma.expense.findFirst({
            where: { pdfUrl: { not: null } },
            select: { id: true, date: true, pdfUrl: true, category: true }
        });
        console.log('Sample Expense:', sample);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
