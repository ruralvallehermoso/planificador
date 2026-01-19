import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { TFMList } from '@/components/modules/master/TFMList';
import { TFMSidebar } from '@/components/modules/master/TFMSidebar';

export default async function TfmPage() {
    const session = await auth()
    const userId = session?.user?.id

    // Fetch all TFM data
    const [items, config, resources] = await Promise.all([
        userId
            ? prisma.tFMItem.findMany({
                where: { userId },
                orderBy: { order: 'asc' }
            })
            : [],
        userId
            ? prisma.tFMConfig.findUnique({
                where: { userId }
            })
            : null,
        userId
            ? prisma.tFMResource.findMany({
                where: { userId },
                orderBy: { order: 'asc' }
            })
            : []
    ])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Trabajo Fin de Máster</h1>
                    <p className="text-slate-500 mt-1">Gestión y seguimiento del proyecto final</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm border border-indigo-100">
                    {config?.convocatoria || 'Convocatoria: Julio 2026'}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2">
                    <TFMList initialItems={items} />
                </div>

                {/* Sidebar */}
                <div>
                    <TFMSidebar config={config} resources={resources} />
                </div>
            </div>
        </div>
    );
}
