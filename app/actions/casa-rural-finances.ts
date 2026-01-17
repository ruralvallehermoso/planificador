"use server";

import { prisma } from "@/lib/prisma";

export async function getCasaRuralYearlyBalance() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        // Calculate end of current month for filtering
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        const startOfYear = new Date(currentYear, 0, 1);

        // 1. Income Year-To-Date (up to end of current month)
        const incomeResult = await prisma.$queryRawUnsafe<any[]>(
            `SELECT SUM(amount)::float as total FROM casarural."Income" WHERE date >= $1 AND date <= $2`,
            startOfYear, endOfCurrentMonth
        );

        // 2. Monthly Expenses Year-To-Date (up to end of current month)
        const monthlyExpenseResult = await prisma.$queryRawUnsafe<any[]>(
            `SELECT SUM(amount)::float as total FROM casarural."Expense" 
       WHERE type = 'MONTHLY' AND date >= $1 AND date <= $2`,
            startOfYear, endOfCurrentMonth
        );

        // 3. Annual Expenses (Amortized portion)
        // We take all annual expenses applicable to this year and prorate them by elapsed months
        const annualExpensesResult = await prisma.$queryRawUnsafe<any[]>(
            `SELECT SUM(amount)::float as total FROM casarural."Expense" 
       WHERE type = 'ANNUAL' AND "applicableYear" = $1`,
            currentYear
        );

        const totalIncome = incomeResult[0]?.total || 0;
        const totalMonthlyExpenses = monthlyExpenseResult[0]?.total || 0;
        const totalAnnualExpenses = annualExpensesResult[0]?.total || 0;

        // Amortization logic: (Total Annual / 12) * months elapsed so far (including current)
        const monthsElapsed = currentMonth + 1;
        const amortizedAnnualPortion = (totalAnnualExpenses / 12) * monthsElapsed;

        const totalExpenses = totalMonthlyExpenses + amortizedAnnualPortion;
        const balance = totalIncome - totalExpenses;

        return {
            year: currentYear,
            income: totalIncome,
            expenses: totalExpenses,
            balance: balance,
            isHealthy: balance >= 0,
            success: true
        };
    } catch (error) {
        console.error("Error fetching Casa Rural Yearly Balance:", error);
        return { success: false, error: "Failed to fetch financial data" };
    }
}
