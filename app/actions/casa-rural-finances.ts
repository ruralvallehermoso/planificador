"use server";

import { prisma } from "@/lib/prisma";

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

/**
 * Replicates the Casa Rural dashboard's "Beneficio Real" calculation.
 * 
 * The Casa Rural dashboard computes Real Cash PER MONTH independently,
 * then sums them up. This is critical because max(0, x) applied per-month
 * produces different results than max(0, sum(x)).
 * 
 * Formula per month:
 *   monthEstimatedRealCash = (monthGrossProfit - max(0, monthIvaBalance)) - max(0, monthFiscalProfit * 0.20)
 * 
 * Where:
 *   monthGrossProfit = monthIncome - (monthDirectExpenses + monthlyAmortization)
 *   monthIvaBalance = monthIvaRepercutido - monthIvaSoportado
 *   monthFiscalProfit = (monthIncome / 1.10) - monthFiscalBaseGastos
 */
export async function getCasaRuralYearlyBalance() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        // Fetch all incomes for the year
        const incomes = await prisma.income.findMany({
            where: { date: { gte: startOfYear, lte: endOfYear } }
        });

        // Fetch all monthly expenses for the year
        const monthlyExpenses = await prisma.expense.findMany({
            where: {
                type: 'MONTHLY',
                date: { gte: startOfYear, lte: endOfYear }
            }
        });

        // Fetch annual expenses
        const annualExpenses = await prisma.expense.findMany({
            where: {
                type: 'ANNUAL',
                applicableYear: currentYear
            }
        });

        // Calculate annual amortization per month
        const totalAnnualExpenses = annualExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const prorationFactor = getAnnualExpenseProrationFactor(currentYear);
        const activeMonths = getActiveMonthsInYear(currentYear);
        const monthlyAmortization = activeMonths > 0 ? (totalAnnualExpenses * prorationFactor) / activeMonths : 0;

        const startYear = BUSINESS_START_DATE.getFullYear();
        const startMonth = BUSINESS_START_DATE.getMonth();

        // Calculate per-month, then sum — matching Casa Rural dashboard exactly
        let totalRealCash = 0;
        let totalIncome = 0;
        let totalExpenses = 0;

        for (let i = 0; i <= currentMonth; i++) {
            // Check if this month is active for the business
            let isMonthActive = true;
            if (currentYear < startYear) isMonthActive = false;
            else if (currentYear === startYear && i < startMonth) isMonthActive = false;

            const monthStart = new Date(currentYear, i, 1);
            const monthEnd = new Date(currentYear, i + 1, 0); // last day of month

            // Month Income
            const monthIncome = incomes
                .filter(inc => inc.date >= monthStart && inc.date <= monthEnd)
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            // Month Direct Expenses (MONTHLY type only, no maintenance)
            const monthDirectExpenses = monthlyExpenses
                .filter(e => e.date >= monthStart && e.date <= monthEnd)
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            // Month Total Expenses (direct + amortized annual)
            const monthTotalExpenses = monthDirectExpenses + (isMonthActive ? monthlyAmortization : 0);

            // Gross Profit
            const monthGrossProfit = monthIncome - monthTotalExpenses;

            // IVA
            const monthIvaRepercutido = monthIncome - (monthIncome / 1.10);

            const monthExpensesWithIva = monthlyExpenses
                .filter(e => e.date >= monthStart && e.date <= monthEnd && e.hasIva && e.deducible !== false)
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            const monthIvaSoportado = monthExpensesWithIva - (monthExpensesWithIva / 1.21);
            const monthIvaBalance = monthIvaRepercutido - monthIvaSoportado;

            // Fiscal Base Gastos (for IRPF)
            const monthBaseGastos = monthlyExpenses
                .filter(e => e.date >= monthStart && e.date <= monthEnd && e.deducible !== false)
                .reduce((acc, curr) => {
                    if (curr.hasIva) {
                        return acc + (Number(curr.amount) / 1.21);
                    } else {
                        return acc + Number(curr.amount);
                    }
                }, 0);

            // Add amortized annual base contribution (assumes annual expenses have IVA at 21%)
            const amortizedBaseContribution = isMonthActive ? (monthlyAmortization / 1.21) : 0;
            const monthFiscalBaseGastos = monthBaseGastos + amortizedBaseContribution;

            const monthFiscalBaseIngresos = monthIncome / 1.10;
            const monthNetProfitFiscal = monthFiscalBaseIngresos - monthFiscalBaseGastos;

            // Estimated Real Cash for this month
            const monthEstimatedRealCash =
                (monthGrossProfit - (monthIvaBalance > 0 ? monthIvaBalance : 0)) -
                (monthNetProfitFiscal > 0 ? monthNetProfitFiscal * 0.20 : 0);

            totalRealCash += monthEstimatedRealCash;
            totalIncome += monthIncome;
            totalExpenses += monthTotalExpenses;
        }

        return {
            year: currentYear,
            income: totalIncome,
            expenses: totalExpenses,
            balance: Number(totalRealCash.toFixed(2)),
            isHealthy: totalRealCash >= 0,
            success: true
        };
    } catch (error) {
        console.error("Error fetching Casa Rural Yearly Balance:", error);
        return { success: false, error: "Failed to fetch financial data" };
    }
}
