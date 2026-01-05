import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const query = q || "";

    if (!query) {
        return (
            <div className="p-12 text-center text-gray-500">
                Comienza a escribir en la barra de búsqueda para encontrar tareas.
            </div>
        );
    }

    const results = await prisma.actionItem.findMany({
        where: {
            OR: [
                { title: { contains: query } }, // Case-insensitive works by default in simple SQLite 'contains' usually, but ideally we'd want mode: 'insensitive' if Prisma supports it for SQLite (it might not fully, but let's try basic)
                { description: { contains: query } },
            ],
        },
        include: {
            category: true,
        },
        take: 20,
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
                Resultados para &quot;{query}&quot;
            </h1>

            {results.length === 0 ? (
                <p className="text-gray-500">No se encontraron tareas que coincidan con tu búsqueda.</p>
            ) : (
                <div className="space-y-4">
                    {results.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                                {item.status === 'DONE' ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : item.status === 'IN_PROGRESS' ? (
                                    <Clock className="h-5 w-5 text-amber-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-300" />
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-400">
                                        <span className="font-medium" style={{ color: item.category.color || 'gray' }}>{item.category.name}</span>
                                        <span>•</span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Link href={`/${item.category.slug}?item=${item.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Ver
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
