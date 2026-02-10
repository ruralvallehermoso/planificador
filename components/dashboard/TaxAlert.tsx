'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

export function TaxAlert() {
    const [showAlert, setShowAlert] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
    const [taxPeriod, setTaxPeriod] = useState('');

    useEffect(() => {
        checkTaxDeadlines();
    }, []);

    const checkTaxDeadlines = () => {
        const today = new Date();
        const currentYear = today.getFullYear();

        // Fechas límite de impuestos en España (Trimestrales)
        const deadlines = [
            { date: new Date(currentYear, 0, 30), label: '4T (Año anterior) + Resumen Anual' }, // 30 Enero
            { date: new Date(currentYear, 3, 20), label: '1T' }, // 20 Abril
            { date: new Date(currentYear, 6, 20), label: '2T' }, // 20 Julio
            { date: new Date(currentYear, 9, 20), label: '3T' }, // 20 Octubre
        ];

        // Buscar el próximo vencimiento
        let nextDeadline = deadlines.find(d => d.date > today);

        // Si estamos a final de año (ej: 25 Diciembre), el siguiente es el 30 Enero del año siguiente
        if (!nextDeadline) {
            nextDeadline = {
                date: new Date(currentYear + 1, 0, 30),
                label: '4T (Año anterior) + Resumen Anual'
            };
        }

        const diffTime = Math.abs(nextDeadline.date.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setDaysRemaining(diffDays);
        setDeadlineDate(nextDeadline.date);
        setTaxPeriod(nextDeadline.label);

        // Mostrar alerta si quedan 10 días o menos
        if (diffDays <= 10) {
            setShowAlert(true);
        }
    };

    if (!showAlert) return null;

    return (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm relative animate-in fade-in slide-in-from-top-2 duration-500">
            <button
                onClick={() => setShowAlert(false)}
                className="absolute top-2 right-2 text-amber-400 hover:text-amber-600 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                        ¡Aviso de Impuestos!
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                        <p>
                            Quedan <strong>{daysRemaining} días</strong> para el vencimiento del <strong>{taxPeriod}</strong>.
                            El plazo finaliza el {deadlineDate?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}.
                        </p>
                        <p className="mt-2">
                            Recuerda revisar y descargar tus facturas en la sección de <Link href="/casa-rural/contabilidad/fiscality" className="font-bold underline hover:text-amber-900">Fiscalidad</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
