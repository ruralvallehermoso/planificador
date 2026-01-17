
const { PrismaClient } = require('./prisma/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    try {
        const year = 2026;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const incomes = await prisma.$queryRawUnsafe(
            `SELECT id, amount, date, description FROM casarural."Income" WHERE date >= $1 AND date <= $2`,
            startDate, endDate
        );

        const expenses = await prisma.$queryRawUnsafe(
            `SELECT id, amount, date, type, category, "applicableYear" FROM casarural."Expense" WHERE date >= $1 AND date <= $2`,
            startDate, endDate
        );

        const annualExpensesForYear = await prisma.$queryRawUnsafe(
            `SELECT id, amount, "applicableYear" FROM casarural."Expense" WHERE type = 'ANNUAL' AND "applicableYear" = $1`,
            year
        );

        console.log('--- INGRESOS 2026 ---');
        console.table(incomes);

        console.log('--- GASTOS 2026 (por fecha) ---');
        console.table(expenses);

        console.log('--- GASTOS ANUALES (aplicables a 2026) ---');
        console.table(annualExpensesForYear);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
