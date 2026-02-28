'use client';

import { useState } from 'react';
import { HomeSuministro } from '@prisma/client';
import { Plus, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SuministroCard from './SuministroCard';
import SuministroForm from './SuministroForm';
import { Badge } from '@/components/ui/badge';

interface Props {
    suministros: HomeSuministro[];
}

export default function SuministrosClient({ suministros }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const activeSuministros = suministros.filter(s => s.status === 'ACTIVE');
    const totalCost = activeSuministros.reduce((acc, curr) => acc + (curr.cost || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mis Suministros</h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            Gestiona tus recibos, contratos y contactos
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-medium">
                                {suministros.length} Activos
                            </Badge>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-500">Estimación Mensual</p>
                        <p className="text-lg font-bold text-gray-900">{totalCost.toFixed(2)} €</p>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2 whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Añadir Gasto
                    </Button>
                </div>
            </div>

            {suministros.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 border-dashed text-center mt-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Sin suministros registrados</h3>
                    <p className="text-gray-500 max-w-sm mt-2 mb-6">Aún no has configurado la información de tus facturas de luz, agua, internet o teléfono.</p>
                    <Button onClick={() => setIsFormOpen(true)} variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" /> Crear tu primer suministro
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {suministros.map((suministro) => (
                        <SuministroCard key={suministro.id} suministro={suministro} />
                    ))}
                </div>
            )}

            <SuministroForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
        </div>
    );
}
