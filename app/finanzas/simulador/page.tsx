import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';

export default function SimuladorPage() {
    const dashboard = getMicrofrontend('dashboard-financiero');

    if (!dashboard) {
        return <div>Configuración de Simulador Financiero no encontrada.</div>;
    }

    return (
        <MicrofrontendFrame
            src={dashboard.url}
            title={dashboard.name}
            fallbackMessage="Simulador Financiero no está disponible. Asegúrate de que el servidor está corriendo en el puerto 8501."
        />
    );
}
