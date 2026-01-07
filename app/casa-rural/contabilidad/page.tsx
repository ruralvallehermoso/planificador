import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';
import { AlertCircle } from 'lucide-react';

export default function ContabilidadPage() {
    const casaRural = getMicrofrontend('casa-rural');

    if (!casaRural) {
        return <div>Configuración de Contabilidad no encontrada.</div>;
    }

    // Si no hay URL disponible (producción sin configurar), mostrar mensaje
    if (!casaRural.url || !casaRural.available) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Contabilidad no disponible</h2>
                <p className="text-gray-500 max-w-md">
                    Este módulo requiere configuración adicional para funcionar en este entorno.
                    Contacta al administrador si necesitas acceso.
                </p>
            </div>
        );
    }

    return (
        <MicrofrontendFrame
            src={casaRural.url}
            title={casaRural.name}
            fallbackMessage="La aplicación de contabilidad no está disponible. Asegúrate de que el servidor está corriendo en el puerto 3002."
        />
    );
}

