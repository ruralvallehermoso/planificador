import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';
import { AlertCircle } from 'lucide-react';

export default function HogarPage() {
    const hogarConfig = getMicrofrontend('hogar');

    if (!hogarConfig) {
        return <div>Configuración de Hogar no encontrada.</div>;
    }

    // Si no hay URL disponible (producción sin configurar), mostrar mensaje
    if (!hogarConfig.url || !hogarConfig.available) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Hogar no disponible</h2>
                <p className="text-gray-500 max-w-md">
                    Este módulo requiere configuración adicional para funcionar en este entorno.
                    Contacta al administrador si necesitas acceso.
                </p>
            </div>
        );
    }

    return (
        <MicrofrontendFrame
            src={hogarConfig.url}
            title={hogarConfig.name}
            fallbackMessage="La aplicación de Hogar no está disponible. Asegúrate de que el servidor está corriendo en el puerto 3003."
        />
    );
}

