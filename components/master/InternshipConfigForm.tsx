'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Loader2 } from 'lucide-react';
import { updateInternshipDetails } from '@/app/master-unie/practicum/actions';
import { useRouter } from 'next/navigation';

interface InternshipConfigFormProps {
    initialData?: {
        center?: {
            name: string;
            address: string | null;
            province: string | null;
            city: string | null;
            tutorName: string | null;
            tutorEmail: string | null;
            tutorPhone: string | null;
            universityTutor: string | null;
        } | null;
        startDate: Date | null;
        endDate: Date | null;
        realStartDate: Date | null;
        realEndDate: Date | null;
        totalHours: number;
        schedule: string | null;
    } | null;
}

export function InternshipConfigForm({ initialData }: InternshipConfigFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        centerName: initialData?.center?.name || '',
        address: initialData?.center?.address || '',
        city: initialData?.center?.city || '',
        tutorName: initialData?.center?.tutorName || '',
        tutorEmail: initialData?.center?.tutorEmail || '',
        universityTutor: initialData?.center?.universityTutor || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        realStartDate: initialData?.realStartDate ? new Date(initialData.realStartDate).toISOString().split('T')[0] : '',
        realEndDate: initialData?.realEndDate ? new Date(initialData.realEndDate).toISOString().split('T')[0] : '',
        totalHours: initialData?.totalHours || 120,
        schedule: initialData?.schedule || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateInternshipDetails({
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                realStartDate: formData.realStartDate ? new Date(formData.realStartDate) : undefined,
                realEndDate: formData.realEndDate ? new Date(formData.realEndDate) : undefined,
                totalHours: Number(formData.totalHours),
            });
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al guardar la configuración");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configurar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configuración de Prácticas</DialogTitle>
                    <DialogDescription>
                        Introduce los datos del centro, tutores y las fechas estipuladas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Centro */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-slate-500 border-b pb-2">Información del Centro</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="centerName">Nombre del Centro</Label>
                                <Input id="centerName" name="centerName" value={formData.centerName} onChange={handleChange} required placeholder="Ej. IES Madrid" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Madrid" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Calle..." />
                            </div>
                        </div>
                    </div>

                    {/* Tutores */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-slate-500 border-b pb-2">Tutores</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tutorName">Tutor Centro</Label>
                                <Input id="tutorName" name="tutorName" value={formData.tutorName} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tutorEmail">Email Tutor Centro</Label>
                                <Input id="tutorEmail" name="tutorEmail" value={formData.tutorEmail} onChange={handleChange} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="universityTutor">Tutor Universidad</Label>
                                <Input id="universityTutor" name="universityTutor" value={formData.universityTutor} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-slate-500 border-b pb-2">Planificación</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Inicio (Normativa)</Label>
                                <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Fin (Normativa)</Label>
                                <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="realStartDate">Inicio Real</Label>
                                <Input type="date" id="realStartDate" name="realStartDate" value={formData.realStartDate} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="realEndDate">Fin Real</Label>
                                <Input type="date" id="realEndDate" name="realEndDate" value={formData.realEndDate} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalHours">Total Horas Objetivo</Label>
                                <Input type="number" id="totalHours" name="totalHours" value={formData.totalHours} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schedule">Horario (Texto)</Label>
                                <Input id="schedule" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="L-V 9:00 - 14:00" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
