'use client';

import { useSession } from 'next-auth/react';
import { MicrofrontendFrame } from '@/components/microfrontend/MicrofrontendFrame';
import { getMicrofrontend } from '@/lib/microfrontends';

export default function SESHospedajesPage() {
    const { data: session } = useSession();
    const casaRural = getMicrofrontend('casa-rural');

    if (!casaRural) {
        return <div>Configuración de SES Hospedajes no encontrada.</div>;
    }

    // Pass user role to the microfrontend for permission control
    const role = session?.user?.role || 'GUEST';
    const sesUrl = `${casaRural.url.replace(/\/$/, '')}/ses-hospedajes?role=${role}`;

    return (
        <MicrofrontendFrame
            src={sesUrl}
            title="SES Hospedajes"
            fallbackMessage="La aplicación de SES Hospedajes no está disponible. Asegúrate de que el servidor está corriendo en el puerto 3002."
        />
    );
}
