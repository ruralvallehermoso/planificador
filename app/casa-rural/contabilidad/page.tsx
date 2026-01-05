import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';

export default function ContabilidadPage() {
    const casaRural = getMicrofrontend('casa-rural');

    if (!casaRural) {
        return <div>Configuración de Contabilidad no encontrada.</div>;
    }

    return (
        <MicrofrontendFrame
            src={casaRural.url}
            title={casaRural.name}
            fallbackMessage="La aplicación de contabilidad no está disponible. Asegúrate de que el servidor está corriendo en el puerto 3002."
        />
    );
}
