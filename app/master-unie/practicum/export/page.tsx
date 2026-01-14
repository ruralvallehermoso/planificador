import { getInternship } from '../actions';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/master/PrintButton'; // Need to create this client component

export default async function ExportPage() {
    const internship = await getInternship();

    if (!internship) return notFound();

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen text-slate-900">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Memoria de Prácticas</h1>
                    <p className="text-slate-500 mt-1">Registro de Actividades y Horas</p>
                </div>
                <div className="print:hidden">
                    <PrintButton />
                </div>
            </div>

            {/* Student & Center Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                    <h3 className="font-bold text-slate-700 mb-2 border-b pb-1">Datos del Alumno</h3>
                    {/* Ideally fetch user name, but it's in session. For now, placeholder or fetch user if possible. */}
                    <p className="py-1"><span className="font-semibold">ID Alumno:</span> {internship.userId}</p>
                </div>
                <div>
                    <h3 className="font-bold text-slate-700 mb-2 border-b pb-1">Datos del Centro</h3>
                    <p className="py-1"><span className="font-semibold">Centro:</span> {internship.center?.name || '-'}</p>
                    <p className="py-1"><span className="font-semibold">Tutor Centro:</span> {internship.center?.tutorName || '-'}</p>
                    <p className="py-1"><span className="font-semibold">Tutor Universidad:</span> {internship.center?.universityTutor || '-'}</p>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border text-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold">Periodo:</span> {internship.realStartDate ? new Date(internship.realStartDate).toLocaleDateString() : '-'} a {internship.realEndDate ? new Date(internship.realEndDate).toLocaleDateString() : '-'}
                    </div>
                    <div>
                        <span className="font-semibold">Total Horas Registradas:</span> {internship.logs.reduce((acc, log) => acc + log.hours, 0)} h
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700">
                    <tr>
                        <th className="px-4 py-2 border">Fecha</th>
                        <th className="px-4 py-2 border w-20 text-center">Horas</th>
                        <th className="px-4 py-2 border">Actividad Realizada</th>
                        <th className="px-4 py-2 border">Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {internship.logs.map((log) => (
                        <tr key={log.id}>
                            <td className="px-4 py-3 border whitespace-nowrap">
                                {new Date(log.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 border text-center font-medium">
                                {log.hours}
                            </td>
                            <td className="px-4 py-3 border">
                                {log.activity}
                            </td>
                            <td className="px-4 py-3 border italic text-slate-500">
                                {log.observations}
                            </td>
                        </tr>
                    ))}
                    {internship.logs.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                                Sin registros
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Signatures */}
            <div className="mt-16 grid grid-cols-2 gap-16 text-center text-sm">
                <div className="border-t pt-2">
                    <p className="font-semibold">Firma del Alumno</p>
                </div>
                <div className="border-t pt-2">
                    <p className="font-semibold">Firma del Tutor de Centro</p>
                </div>
            </div>
        </div>
    );
}
