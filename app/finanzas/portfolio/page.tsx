import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';
import { AlertCircle } from 'lucide-react';
import { PortfolioRefreshButton } from '@/components/dashboard/PortfolioRefreshButton';


export default function PortfolioPage() {
    const portfolio = getMicrofrontend('portfolio-master');

    if (!portfolio) {
        return <div>Configuración de Portfolio Master no encontrada.</div>;
    }

    // Si no hay URL disponible (producción sin configurar), mostrar mensaje
    if (!portfolio.url || !portfolio.available) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Master no disponible</h2>
                <p className="text-gray-500 max-w-md">
                    Este módulo requiere configuración adicional para funcionar en este entorno.
                    Contacta al administrador si necesitas acceso.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                <p className="font-bold">Debug Info (v2.1 Check)</p>
                <p>Loading URL: <code className="bg-yellow-200 px-1 rounded">{portfolio.url}</code></p>
                <p>Date: {new Date().toISOString()}</p>
            </div>
            <div className="flex justify-end px-4">
                <PortfolioRefreshButton />
            </div>
            <MicrofrontendFrame
                src={portfolio.url}
                title={portfolio.name}
                fallbackMessage="Portfolio Master no está disponible. Asegúrate de que el servidor está corriendo en el puerto 5173."
            />
        </div>
    );
}

