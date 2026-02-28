import { Suspense } from 'react';
import { getHomeSuministros } from './actions';
import SuministrosClient from '@/components/hogar/suministros/SuministrosClient';

export const metadata = {
    title: 'Suministros - Hogar',
    description: 'Gestión de suministros y contratos del hogar',
};

export default async function SuministrosPage() {
    const suministros = await getHomeSuministros();

    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            <Suspense fallback={<div className="animate-pulse flex space-x-4">Cargando suministros...</div>}>
                <SuministrosClient suministros={suministros} />
            </Suspense>
        </main>
    );
}
