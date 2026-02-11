"use server";

import { prisma } from "@/lib/prisma";

// Helper to separate Base and VAT
function calculateBase(amount: number, hasIva: boolean, rate: number = 0.21) {
    if (!hasIva) return amount;
    return amount / (1 + rate);
}

const BUSINESS_START_DATE = new Date(2025, 11, 12); // December 12, 2025

function getAnnualExpenseProrationFactor(year: number): number {
    const businessStartYear = BUSINESS_START_DATE.getFullYear();
    if (year < businessStartYear) return 0;
    if (year > businessStartYear) return 1;

    const endOfYear = new Date(year, 11, 31);
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const daysInOperation = Math.ceil((endOfYear.getTime() - BUSINESS_START_DATE.getTime()) / millisecondsInDay) + 1;
    const daysInYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;

    return daysInOperation / daysInYear;
}

function getActiveMonthsInYear(year: number): number {
    const businessStartYear = BUSINESS_START_DATE.getFullYear();
    if (year < businessStartYear) return 0;
    if (year > businessStartYear) return 12;
    const startMonth = BUSINESS_START_DATE.getMonth();
    return 12 - startMonth;
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
                date: { gte: startOfYear, lte: endOfYear }
            }
        });

        // Fetch Expenses (Monthly only) - EXCLUDE IMPROVEMENT/MAINTENANCE to match dashboard default
        const expenseWhere: any = {
            date: { gte: startOfYear, lte: endOfYear },
            type: 'MONTHLY'
        };

        const otherExpenses = await prisma.expense.findMany({
            where: expenseWhere
        });

        // Fetch Annual Expenses
        const annualExpenses = await prisma.expense.findMany({
            where: {
                type: 'ANNUAL',
                applicableYear: currentYear
            }
        });

        // --- CALCULATIONS ---

        // 1. Total Income (Gross)
        const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // 2. Expenses
        // Monthly + Maintenance + Improvement (Sum of amounts)
        const totalOtherExpenses = otherExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // Annual Expenses Logic (YTD)
        const prorationFactor = getAnnualExpenseProrationFactor(currentYear);
        const activeMonths = getActiveMonthsInYear(currentYear); // e.g. 12 for 2026

        let monthsToCount = activeMonths;
        if (currentYear === now.getFullYear()) {
            // Current year: count months elapsed (e.g. Feb = 2)
            monthsToCount = now.getMonth() + 1;
        } else if (currentYear > now.getFullYear()) {
            monthsToCount = 0;
        }

        const annualRatio = activeMonths > 0 ? (monthsToCount / activeMonths) : 0;

        const totalAnnualExpensesFull = annualExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // Amortized Annual Expense (YTD) = (Full Year Amortized) * (YTD Ratio)
        const totalAmortizedAnnualExpense = (totalAnnualExpensesFull * prorationFactor) * annualRatio;

        // Total Gross Expenses
        const totalGrossExpenses = totalOtherExpenses + totalAmortizedAnnualExpense;

        // 3. Gross Profit (Cashish)
        const grossProfit = totalIncome - totalGrossExpenses;

        // 4. Tax Calculations
        // IVA Repercutido (10% of Income)
        const ivaRepercutido = totalIncome - (totalIncome / 1.10);

        // IVA Soportado
        // Consistency: Dashboard sums IVA from Monthly expenses. 
        // We should primarily rely on Monthly expenses for IVA Soportado in the "Real Cash" flow view 
        const otherExpensesWithIva = otherExpenses.filter(e => e.hasIva && e.deducible !== false);
        const ivaSoportado = otherExpensesWithIva.reduce((acc, curr) => acc + (Number(curr.amount) - (Number(curr.amount) / 1.21)), 0);

        const ivaBalance = ivaRepercutido - ivaSoportado;

        // Base Gastos (For IRPF)
        // Base from Monthly
        const baseGastosMonthly = otherExpenses.reduce((acc, curr) => {
            if (curr.deducible === false) return acc;
            if (curr.hasIva) return acc + (Number(curr.amount) / 1.21);
            return acc + Number(curr.amount);
        }, 0);

        // Base from Annual (Amortized YTD)
        // Dashboard logic assumes Annual Expenses are gross and divides by 1.21 for tax base.
        const baseGastosAnnualAmortized = totalAmortizedAnnualExpense / 1.21;

        const baseGastosTotal = baseGastosMonthly + baseGastosAnnualAmortized;

        const netIncome = totalIncome / 1.10;
        const fiscalProfit = netIncome - baseGastosTotal;

        // IRPF Provision (20% of positive fiscal profit)
        const irpfProvision = fiscalProfit > 0 ? fiscalProfit * 0.20 : 0;

        // 5. Estimated Real Cash
        const finalIVAPayment = ivaBalance > 0 ? ivaBalance : 0;

        const estimatedRealCash = grossProfit - finalIVAPayment - irpfProvision;

        return {
            year: currentYear,
            income: totalIncome,
            expenses: totalGrossExpenses,
            balance: estimatedRealCash,
            isHealthy: estimatedRealCash >= 0,
            success: true
        };
    } catch (error) {
        console.error("Error fetching Casa Rural Yearly Balance:", error);
        return { success: false, error: "Failed to fetch financial data" };
    }
}
