import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';

export default function HogarPage() {
    const hogarConfig = getMicrofrontend('hogar');

    if (!hogarConfig) {
        return <div>Configuración de Hogar no encontrada.</div>;
    }

    return (
        <MicrofrontendFrame
            src={hogarConfig.url}
            title={hogarConfig.name}
            fallbackMessage="La aplicación de Hogar no está disponible. Asegúrate de que el servidor está corriendo en el puerto 3003."
        />
    );
}
