"use server";

import { prisma } from "@/lib/prisma";

// Helper to separate Base and VAT
function calculateBase(amount: number, hasIva: boolean, rate: number = 0.21) {
    if (!hasIva) return amount;
    return amount / (1 + rate);
}

export async function getCasaRuralYearlyBalance() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        // Fetch Incomes
        const incomes = await prisma.income.findMany({
            where: {
                date: {
                    gte: startOfYear,
                    lte: endOfYear
                }
            }
        });

        // Fetch Expenses (Monthly + Maintenance)
        const monthlyExpenses = await prisma.expense.findMany({
            where: {
                date: {
                    gte: startOfYear,
                    lte: endOfYear
                },
                type: { in: ['MONTHLY', 'MAINTENANCE', 'IMPROVEMENT'] }
            }
        });

        // Fetch Annual Expenses
        const annualExpenses = await prisma.expense.findMany({
            where: {
                type: 'ANNUAL',
                applicableYear: currentYear
            }
        });

        // --- CALCULATE NET (FISCAL) METRICS ---
        // 1. Net Income (Base Imponible)
        // Assuming 10% VAT for incomes as per business rule
        const INCOME_VAT_RATE = 0.10;
        const totalNetIncome = incomes.reduce((acc, curr) => {
            const amount = Number(curr.amount);
            const base = curr.hasIva ? amount / (1 + INCOME_VAT_RATE) : amount;
            return acc + base;
        }, 0);

        // 2. Net Expenses (Base Imponible)
        // Assuming 21% VAT for general expenses
        const EXPENSE_VAT_RATE = 0.21;

        // Monthly + Maintenance Net
        const totalNetMonthlyExpenses = monthlyExpenses.reduce((acc, curr) => {
            const amount = Number(curr.amount);
            const base = curr.hasIva ? amount / (1 + EXPENSE_VAT_RATE) : amount;
            return acc + base;
        }, 0);

        // Annual Net (Amortized)
        // Logic: Calculate total annual net, then prorate by active months
        const totalNetAnnualExpenses = annualExpenses.reduce((acc, curr) => {
            const amount = Number(curr.amount);
            const base = curr.hasIva ? amount / (1 + EXPENSE_VAT_RATE) : amount;
            return acc + base;
        }, 0);

        // Proration Logic (Simple for now: if current year, prorate by month. If past, 100%)
        // Actually, the main app uses a config date. Here we'll use a simple approximation for the dashboard card:
        // If current year -> prorate by months elapsed. 
        const currentMonth = now.getMonth(); // 0-11
        const monthsElapsed = currentMonth + 1;
        const amortizedAnnualNet = (totalNetAnnualExpenses / 12) * monthsElapsed;

        const totalNetExpenses = totalNetMonthlyExpenses + amortizedAnnualNet;
        const netBalance = totalNetIncome - totalNetExpenses;

        return {
            year: currentYear,
            income: totalNetIncome,
            expenses: totalNetExpenses,
            balance: netBalance,
            isHealthy: netBalance >= 0,
            success: true
        };
    } catch (error) {
        console.error("Error fetching Casa Rural Yearly Balance:", error);
        return { success: false, error: "Failed to fetch financial data" };
    }
}
