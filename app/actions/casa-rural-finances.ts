"use server";

import { prisma } from "@/lib/prisma";

// Helper to separate Base and VAT
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

        // Fetch ALL Expenses (Monthly, Maintenance, Improvement)
        // Note: Casa Rural dashboard logic for "Real Cash" includes everything relevant to cash flow?
        // Actually, the "Real Cash" logic in Casa Rural dashboard:
        // Cash Profit = Gross Income - (Monthly Expenses + Maintenance + Amortized Annual?)
        // WAIT: In the reference file `src/app/casa-rural/page.tsx`:
        // Total Estimated Real Cash = (Gross Profit - IVA Balance) - IRPF Provision
        // Gross Profit = Total Income - Total Expenses (where Total Expenses = Monthly + Maintenance + Amortized Annual)

        const expenseWhere: any = {
            date: { gte: startOfYear, lte: endOfYear },
            OR: [
                { type: 'MONTHLY' },
                { type: 'MAINTENANCE' },
                { type: 'IMPROVEMENT' }
            ]
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

        // Annual Expenses (Amortized for Profit Calculation)
        const totalAnnualExpensesFull = annualExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const prorationFactor = getAnnualExpenseProrationFactor(currentYear);
        const activeMonths = getActiveMonthsInYear(currentYear);

        // Amortized Annual Expense (This is what counts as "Expense" in the P&L for Real Cash estimation)
        const amortizedAnnualExpense = activeMonths > 0 ? (totalAnnualExpensesFull * prorationFactor) / activeMonths * activeMonths : 0;
        // Wait, if we are looking at the WHOLE YEAR, we typically take the whole prorated amount for the year?
        // In `getDashboardData` (monthly), it amortizes per month.
        // In `getYearlyData` (annual view), `monthlyAmortization` is calculated.
        // `activeMonths` in 2026 is 12. Proration is 1. So it's full amount.
        // `activeMonths` in 2025 is ~0.6 months (20 days).

        // Let's stick to the logic: `activeMonths > 0 ? (totalAnnualExpenses * prorationFactor) / activeMonths : 0` is MONTHLY amortization.
        // For the YEARLY totals, we need `monthlyAmortization * activeMonthsInThatYear`? Or just `totalAnnualExpenses * prorationFactor`?
        // `totalAnnualExpenses * prorationFactor` seems correct for the "Expense attributable to this year".
        const totalAmortizedAnnualExpense = totalAnnualExpensesFull * prorationFactor;

        // Total Gross Expenses
        const totalGrossExpenses = totalOtherExpenses + totalAmortizedAnnualExpense;

        // 3. Gross Profit (Cashish)
        const grossProfit = totalIncome - totalGrossExpenses;

        // 4. Tax Calculations
        // IVA Repercutido (10% of Income)
        const ivaRepercutido = totalIncome - (totalIncome / 1.10);

        // IVA Soportado
        // Identify deducible expenses with IVA from ALL fetched expenses
        const allExpenses = [...otherExpenses, ...annualExpenses];

        const deducibleExpensesWithIva = allExpenses.filter(e => e.hasIva && e.deducible !== false);
        const expensesWithIvaTotal = deducibleExpensesWithIva.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // If it's an annual expense, do we take the full IVA or prorated?
        // Usually IVA is deductible when the invoice is received (full amount).
        // The dashboard logic `getYearlyData` does:
        // `monthExpensesWithIva` includes monthly/maintenance.
        // What about Annual? Logic in dashboard is complex.
        // Let's simplify: Real Cash = Money in Pocket.
        // But the user specific formula is: (GrossProfit - IvaBalance) - IRPF.

        // IvaBalance = Repercutido - Soportado.
        const ivaSoportado = expensesWithIvaTotal - (expensesWithIvaTotal / 1.21);
        const ivaBalance = ivaRepercutido - ivaSoportado;

        // Base Gastos (For IRPF)
        // Sum of Deducible Bases
        const baseGastos = allExpenses.reduce((acc, curr) => {
            if (curr.deducible === false) return acc;

            // For Annual expenses, should we use the AMORTIZED amount for base calculation?
            // Yes, IRPF is based on amortized expense.
            // But we have `allExpenses` mixed.

            let amount = Number(curr.amount);
            if (curr.type === 'ANNUAL') {
                // Use prorated amount for the expense base
                amount = amount * prorationFactor;
            }

            if (curr.hasIva) {
                return acc + (amount / 1.21);
            } else {
                return acc + amount;
            }
        }, 0);

        const netIncome = totalIncome / 1.10;
        const fiscalProfit = netIncome - baseGastos;

        // IRPF Provision (20% of positive fiscal profit)
        const irpfProvision = fiscalProfit > 0 ? fiscalProfit * 0.20 : 0;

        // 5. Estimated Real Cash
        // (GrossProfit - PositiveIVABalance) - IRPF
        // Note: If IVA Balance is negative (we are owed money), it doesn't reduce our cash now (we wait for refund), 
        // but often we just count "payment to taxman".
        // Dashboard logic: `(netProfit - (ivaBalance > 0 ? ivaBalance : 0)) - ...`
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
