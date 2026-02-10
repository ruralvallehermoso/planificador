'use server';

import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canAccessModule } from '@/lib/auth/permissions';
import { MODULES } from '@/lib/auth/config';

export type QuarterlyInvoice = {
    id: number;
    date: Date; // Keep as Date object
    pdfUrl: string | null;
    provider: string | null; // Usamos descripción si no hay provider explícito, o supplierName
    amount: number;
    category: string;
};

export type FiscalYearData = {
    year: number;
    quarters: {
        quarter: number;
        invoices: QuarterlyInvoice[];
    }[];
};

export async function getFiscalityData(): Promise<FiscalYearData[]> {
    // 1. Obtener todos los gastos que tengan PDF (o que sean relevantes)
    // Ordenados por fecha descendente
    const expenses = await prisma.expense.findMany({
        where: {
            pdfUrl: {
                not: null
            },
            // Opcional: filtrar por esquema casarural si fuera necesario, 
            // pero prisma.expense ya apunta al modelo correcto.
        },
        orderBy: {
            date: 'desc',
        },
        select: {
            id: true,
            date: true,
            pdfUrl: true,
            amount: true,
            category: true,
            description: true,
            supplierName: true,
        }
    });

    // 2. Agrupar por Año y Trimestre
    const groupedData: Record<number, Record<number, QuarterlyInvoice[]>> = {};

    for (const expense of expenses) {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-12
        const quarter = Math.ceil(month / 3);

        if (!groupedData[year]) {
            groupedData[year] = {};
        }
        if (!groupedData[year][quarter]) {
            groupedData[year][quarter] = [];
        }

        groupedData[year][quarter].push({
            id: expense.id,
            date: expense.date,
            pdfUrl: expense.pdfUrl,
            provider: expense.supplierName || expense.description || 'Sin proveedor',
            amount: Number(expense.amount),
            category: expense.category,
        });
    }

    // 3. Convertir a array ordenado para el frontend
    const result: FiscalYearData[] = Object.keys(groupedData)
        .map(Number)
        .sort((a, b) => b - a) // Años más recientes primero
        .map(year => {
            const quartersObj = groupedData[year];
            const quarters = Object.keys(quartersObj)
                .map(Number)
                .sort((a, b) => b - a) // Trimestres más recientes primero
                .map(quarter => {
                    const invoices = quartersObj[quarter];
                    return {
                        quarter,
                        invoices: invoices
                    };
                });

            return {
                year,
                quarters
            };
        });

    return result;
}

export async function deleteInvoicePdf(expenseId: number) {
    const session = await auth();
    if (!session?.user || !canAccessModule(session.user, MODULES.CASA_RURAL)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            select: { pdfUrl: true }
        });

        if (!expense || !expense.pdfUrl) {
            return { success: false, error: 'PDF not found' };
        }

        // 1. Delete from Vercel Blob
        await del(expense.pdfUrl);

        // 2. Update database
        await prisma.expense.update({
            where: { id: expenseId },
            data: { pdfUrl: null }
        });

        revalidatePath('/casa-rural/contabilidad/facturas');
        return { success: true };

    } catch (error) {
        console.error('Error deleting invoice PDF:', error);
        return { success: false, error: 'Failed to delete PDF' };
    }
}
