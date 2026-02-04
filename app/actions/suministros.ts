"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

// ============ Types ============

export interface SuministroData {
    name: string;
    type: string;
    website?: string | null;
    logoUrl?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    contractRef?: string | null;
    notes?: string | null;
}

export interface InvoiceData {
    invoiceNumber?: string | null;
    date: Date;
    amount: number;
    pdfUrl?: string | null;
    notes?: string | null;
}

// ============ Suministro CRUD ============

export async function getSuministros() {
    const suministros = await prisma.suministro.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { invoices: true } },
        },
    });
    return suministros;
}

export async function getSuministro(id: number) {
    const suministro = await prisma.suministro.findUnique({
        where: { id },
        include: {
            invoices: {
                orderBy: { date: "desc" },
            },
        },
    });
    return suministro;
}

export async function createSuministro(data: SuministroData) {
    try {
        const suministro = await prisma.suministro.create({
            data: {
                name: data.name,
                type: data.type,
                website: data.website || null,
                logoUrl: data.logoUrl || null,
                contactPhone: data.contactPhone || null,
                contactEmail: data.contactEmail || null,
                contractRef: data.contractRef || null,
                notes: data.notes || null,
            },
        });
        revalidatePath("/casa-rural/suministros");
        return { success: true, suministro };
    } catch (error) {
        console.error("Error creating suministro:", error);
        return { success: false, error: "Failed to create suministro" };
    }
}

export async function updateSuministro(id: number, data: SuministroData) {
    try {
        const suministro = await prisma.suministro.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                website: data.website || null,
                logoUrl: data.logoUrl || null,
                contactPhone: data.contactPhone || null,
                contactEmail: data.contactEmail || null,
                contractRef: data.contractRef || null,
                notes: data.notes || null,
            },
        });
        revalidatePath("/casa-rural/suministros");
        revalidatePath(`/casa-rural/suministros/${id}`);
        return { success: true, suministro };
    } catch (error) {
        console.error("Error updating suministro:", error);
        return { success: false, error: "Failed to update suministro" };
    }
}

export async function deleteSuministro(id: number) {
    try {
        await prisma.suministro.delete({ where: { id } });
        revalidatePath("/casa-rural/suministros");
        return { success: true };
    } catch (error) {
        console.error("Error deleting suministro:", error);
        return { success: false, error: "Failed to delete suministro" };
    }
}

// ============ Invoice CRUD ============

export async function addInvoice(suministroId: number, data: InvoiceData) {
    try {
        const invoice = await prisma.suministroInvoice.create({
            data: {
                suministroId,
                invoiceNumber: data.invoiceNumber || null,
                date: data.date,
                amount: new Decimal(data.amount),
                pdfUrl: data.pdfUrl || null,
                notes: data.notes || null,
            },
        });
        revalidatePath(`/casa-rural/suministros/${suministroId}`);
        return { success: true, invoice };
    } catch (error) {
        console.error("Error adding invoice:", error);
        return { success: false, error: "Failed to add invoice" };
    }
}

export async function deleteInvoice(invoiceId: number, suministroId: number) {
    try {
        await prisma.suministroInvoice.delete({ where: { id: invoiceId } });
        revalidatePath(`/casa-rural/suministros/${suministroId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return { success: false, error: "Failed to delete invoice" };
    }
}
