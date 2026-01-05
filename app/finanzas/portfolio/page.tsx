import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';

export default function PortfolioPage() {
    const portfolio = getMicrofrontend('portfolio-master');

    if (!portfolio) {
        return <div>Configuración de Portfolio Master no encontrada.</div>;
    }

    return (
        <MicrofrontendFrame
            src={portfolio.url}
            title={portfolio.name}
            fallbackMessage="Portfolio Master no está disponible. Asegúrate de que el servidor está corriendo en el puerto 5173."
        />
    );
}
