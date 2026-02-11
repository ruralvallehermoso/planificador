'use server';

import { prisma } from '@/lib/prisma';
import { list, del } from '@vercel/blob';

export async function getOrphanedBlobs() {
    const session = await auth();
    if (!session?.user || !canAccessModule(session.user, MODULES.CASA_RURAL)) {
        return [];
    }

    try {
        // 1. Get all blobs
        const { blobs } = await list();

        // 2. Get all expense PDF URLs
        const expenses = await prisma.expense.findMany({
            where: { pdfUrl: { not: null } },
            select: { pdfUrl: true }
        });

        const validUrls = new Set(expenses.map(e => e.pdfUrl));

        // 3. Filter orphans
        const orphans = blobs.filter(blob => !validUrls.has(blob.url));

        return orphans.map(blob => ({
            url: blob.url,
            pathname: blob.pathname,
            size: blob.size,
            uploadedAt: blob.uploadedAt
        }));

    } catch (error) {
        console.error('Error fetching orphaned blobs:', error);
        return [];
    }
}
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
    // 1. Get all DB expenses with PDF
    const expenses = await prisma.expense.findMany({
        where: {
            pdfUrl: { not: null },
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

    // 2. Get all blobs to find "manual" uploads (orphans)
    let orphans: any[] = [];
    try {
        const { blobs } = await list();
        const validUrls = new Set(expenses.map(e => e.pdfUrl));
        orphans = blobs.filter(blob => !validUrls.has(blob.url));
    } catch (err) {
        console.error("Error fetching blobs for orphans:", err);
    }

    // 3. Combine Data
    // Map orphans to "QuarterlyInvoice" shape
    const manualInvoices: QuarterlyInvoice[] = orphans.map((blob, index) => ({
        id: -1 * (index + 1), // Negative ID for manual
        date: blob.uploadedAt,
        pdfUrl: blob.url,
        provider: 'Archivo Manual (Blob)',
        amount: 0,
        category: 'MANUAL'
    }));

    const dbInvoices: QuarterlyInvoice[] = expenses.map(e => ({
        id: e.id,
        date: e.date,
        pdfUrl: e.pdfUrl,
        provider: e.supplierName || e.description || 'Sin proveedor',
        amount: Number(e.amount),
        category: e.category,
    }));

    const allInvoices = [...dbInvoices, ...manualInvoices];

    // 4. Group by Year and Quarter
    const groupedData: Record<number, Record<number, QuarterlyInvoice[]>> = {};

    for (const inv of allInvoices) {
        const date = new Date(inv.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-12
        const quarter = Math.ceil(month / 3);

        if (!groupedData[year]) {
            groupedData[year] = {};
        }
        if (!groupedData[year][quarter]) {
            groupedData[year][quarter] = [];
        }

        groupedData[year][quarter].push(inv);
    }

    // 5. Convert to sorted array
    const result: FiscalYearData[] = Object.keys(groupedData)
        .map(Number)
        .sort((a, b) => b - a) // Years desc
        .map(year => {
            const quartersObj = groupedData[year];
            const quarters = Object.keys(quartersObj)
                .map(Number)
                .sort((a, b) => b - a) // Quarters desc
                .map(quarter => {
                    const invoices = quartersObj[quarter];
                    // Sort invoices within quarter by date desc
                    invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

export async function deleteOrphanedBlob(url: string) {
    const session = await auth();
    if (!session?.user || !canAccessModule(session.user, MODULES.CASA_RURAL)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await del(url);
        revalidatePath('/casa-rural/contabilidad/facturas');
        return { success: true };
    } catch (error) {
        console.error('Error deleting orphaned blob:', error);
        return { success: false, error: 'Failed to delete blob' };
    }
}


