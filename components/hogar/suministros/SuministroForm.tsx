'use client';

import { useState } from "react";
import { HomeSuministro } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Euro, Phone, Mail, Link as LinkIcon, FileText, Building, Hash } from "lucide-react";
import { createHomeSuministro, updateHomeSuministro } from "@/app/hogar/suministros/actions";
import { toast } from "sonner";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    suministro?: HomeSuministro;
}

export default function SuministroForm({ isOpen, onClose, suministro }: Props) {
    const isEditing = !!suministro;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            provider: formData.get("provider") as string,
            contractRef: formData.get("contractRef") as string,
            contactPhone: formData.get("contactPhone") as string,
            contactEmail: formData.get("contactEmail") as string,
            url: formData.get("url") as string,
            notes: formData.get("notes") as string,
            cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : undefined,
            status: formData.get("status") as string,
        };

        try {
            if (isEditing) {
                await updateHomeSuministro(suministro.id, data);
                toast.success("Suministro actualizado");
            } else {
                await createHomeSuministro(data);
                toast.success("Suministro creado");
            }
            onClose();
        } catch (error) {
            toast.error(isEditing ? "Error actualizando suministro" : "Error creando suministro");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="mb-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Zap className="w-5 h-5 text-indigo-500" />
                            {isEditing ? 'Editar Suministro' : 'Nuevo Suministro'}
                        </DialogTitle>
                        <DialogDescription>
                            Registra los datos de facturación y contacto para este suministro.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-600 font-medium">Nombre del Servicio *</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Zap className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input id="name" name="name" defaultValue={suministro?.name} required placeholder="Ej. Luz, Agua..." className="pl-9 placeholder:text-gray-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider" className="text-gray-600 font-medium">Proveedor / Compañía</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input id="provider" name="provider" defaultValue={suministro?.provider || ''} placeholder="Ej. Iberdrola" className="pl-9 placeholder:text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contractRef" className="text-gray-600 font-medium">Referencia / Póliza</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input id="contractRef" name="contractRef" defaultValue={suministro?.contractRef || ''} placeholder="Nº Contrato" className="pl-9 placeholder:text-gray-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-gray-600 font-medium">Gasto Medio Mensual</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Euro className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input id="cost" name="cost" type="number" step="0.01" defaultValue={suministro?.cost || ''} placeholder="0.00" className="pl-9 placeholder:text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone" className="text-gray-600 font-medium">Teléfono de Contacto</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input id="contactPhone" name="contactPhone" defaultValue={suministro?.contactPhone || ''} placeholder="900..." className="pl-9 placeholder:text-gray-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url" className="text-gray-600 font-medium">Página Web</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input id="url" name="url" defaultValue={suministro?.url || ''} placeholder="www.proveedor.com" className="pl-9 placeholder:text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-gray-600 font-medium">Notas Adicionales</Label>
                            <div className="relative">
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    defaultValue={suministro?.notes || ''}
                                    placeholder="Detalles sobre tarifa, peajes, condiciones..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>
                        </div>

                        <input type="hidden" name="status" value={suministro?.status || 'ACTIVE'} />

                    </div>

                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                            {isSubmitting ? 'Guardando...' : 'Guardar Suministro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
