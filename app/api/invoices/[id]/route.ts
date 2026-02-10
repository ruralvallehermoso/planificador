import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule } from "@/lib/auth/permissions";
import { MODULES } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verificar permisos generales para Casa Rural
        if (!canAccessModule(session.user, MODULES.CASA_RURAL)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Await params specifically for Next.js 15+
        const { id } = await params;
        const expenseId = parseInt(id);

        if (isNaN(expenseId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }

        // Buscar el gasto
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            // IMPORTANTE: Incluir 'id' en el select para usarlo abajo
            select: { id: true, pdfUrl: true, supplierName: true, date: true }
        });

        if (!expense || !expense.pdfUrl) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Fetch al Blob (servidor -> servidor)
        const response = await fetch(expense.pdfUrl);
        if (!response.ok) {
            console.error(`Error fetching blob from Vercel: ${response.statusText}`);
            return new NextResponse("Error fetching file", { status: 502 });
        }

        // Preparar headers para la descarga
        const blob = await response.blob();
        const filename = `Factura-${expense.id}.pdf`;

        // Devolver el archivo con los headers correctos
        return new NextResponse(blob, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error("Error in invoice proxy:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
