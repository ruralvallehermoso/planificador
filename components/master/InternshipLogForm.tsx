'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { addLogEntry, updateLogEntry } from '@/app/master-unie/practicum/actions';
import { useRouter } from 'next/navigation';

interface LogEntryData {
    id?: string;
    date: Date | string;
    hours: number;
    activity: string;
    observations?: string | null;
}

interface InternshipLogFormProps {
    initialData?: LogEntryData;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function InternshipLogForm({ initialData, trigger, open: controlledOpen, onOpenChange }: InternshipLogFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        activity: '',
        observations: ''
    });

    useEffect(() => {
        if (open && initialData) {
            setFormData({
                date: new Date(initialData.date).toISOString().split('T')[0],
                hours: initialData.hours.toString(),
                activity: initialData.activity,
                observations: initialData.observations || ''
            });
        } else if (open && !initialData) {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                hours: '',
                activity: '',
                observations: ''
            });
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateLogEntry(initialData.id, {
                    date: new Date(formData.date),
                    hours: Number(formData.hours),
                    activity: formData.activity,
                    observations: formData.observations
                });
            } else {
                await addLogEntry({
                    date: new Date(formData.date),
                    hours: Number(formData.hours),
                    activity: formData.activity,
                    observations: formData.observations
                });
            }
            setOpen?.(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al guardar la jornada");
        } finally {
            setLoading(false);
        }
    };

    const isEdit = !!initialData?.id;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Only render trigger if provided or if not controlled (standard usage) */}
            {(!isControlled || trigger) && (
                <DialogTrigger asChild>
                    {trigger ? trigger : (
                        <Button className="flex items-center text-sm gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Registrar Jornada
                        </Button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar Jornada' : 'Nueva Entrada de Diario'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Modifica los detalles de la jornada.' : 'Registra las horas y actividades realizadas.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hours">Horas</Label>
                            <Input type="number" step="0.5" id="hours" name="hours" value={formData.hours} onChange={handleChange} required placeholder="Ej. 5" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="activity">Actividad Principal</Label>
                        <Textarea id="activity" name="activity" value={formData.activity} onChange={handleChange} required placeholder="Observación de clases, preparación de material..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones / Notas</Label>
                        <Textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} placeholder="Detalles adicionales, reflexiones..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
