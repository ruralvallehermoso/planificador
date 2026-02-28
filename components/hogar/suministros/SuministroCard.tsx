'use client';

import { useState } from 'react';
import { HomeSuministro } from '@prisma/client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Zap, Droplets, Wifi, Flame, Phone, CheckCircle2, AlertCircle, PhoneCall, Trash2, Edit3, Euro, Link as LinkIcon, ExternalLink } from "lucide-react";
import { deleteHomeSuministro } from '@/app/hogar/suministros/actions';
import { toast } from 'sonner';
import SuministroForm from './SuministroForm';

interface Props {
    suministro: HomeSuministro;
}

export default function SuministroCard({ suministro }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getIconInfo = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('luz') || lowerName.includes('electricidad') || lowerName.includes('energia')) return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' };
        if (lowerName.includes('agua')) return { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' };
        if (lowerName.includes('gas') || lowerName.includes('calefaccion')) return { icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' };
        if (lowerName.includes('inter') || lowerName.includes('fibra') || lowerName.includes('wifi')) return { icon: Wifi, color: 'text-indigo-500', bg: 'bg-indigo-50' };
        if (lowerName.includes('tel') || lowerName.includes('movil')) return { icon: Phone, color: 'text-emerald-500', bg: 'bg-emerald-50' };
        return { icon: Zap, color: 'text-gray-500', bg: 'bg-gray-50' }; // default
    }

    const { icon: Icon, color, bg } = getIconInfo(suministro.name);

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar el suministro de ${suministro.name}?`)) return;
        setIsDeleting(true);
        try {
            await deleteHomeSuministro(suministro.id);
            toast.success('Suministro eliminado exitosamente');
        } catch (error) {
            toast.error('Error eliminando el suministro');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow relative overflow-hidden ring-1 ring-gray-100 border-none bg-white">
                {suministro.status === 'INACTIVE' && (
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                        <div className="absolute top-3 -right-6 origin-center rotate-45 bg-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-wider py-1 px-8 shadow-sm">
                            Inactivo
                        </div>
                    </div>
                )}

                <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${bg}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 leading-tight">
                                    {suministro.name}
                                </h3>
                                {suministro.provider && (
                                    <p className="text-sm text-gray-500">{suministro.provider}</p>
                                )}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 cursor-pointer">
                                    <Edit3 className="w-4 h-4 text-gray-500" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" /> Borrar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {suministro.cost ? (
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-gray-900">{suministro.cost}</span>
                            <span className="text-sm font-medium text-gray-500">€/mes est.</span>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-1 mt-1 opacity-50">
                            <span className="text-2xl font-bold text-gray-400">-</span>
                            <span className="text-sm font-medium text-gray-400">€/mes est.</span>
                        </div>
                    )}


                    <div className="flex flex-col gap-2 mt-2">
                        {suministro.contractRef && (
                            <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">Referencia</span>
                                <span className="font-medium text-gray-900 font-mono text-xs">{suministro.contractRef}</span>
                            </div>
                        )}
                        {suministro.contactPhone && (
                            <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">Teléfono</span>
                                <a href={`tel:${suministro.contactPhone}`} className="flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    {suministro.contactPhone}
                                </a>
                            </div>
                        )}
                    </div>

                    {(suministro.url || suministro.notes) && (
                        <div className="flex items-center gap-2 mt-2">
                            {suministro.url && (
                                <a
                                    href={suministro.url.startsWith('http') ? suministro.url : `https://${suministro.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition-colors w-fit"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Web
                                </a>
                            )}
                            {suministro.notes && (
                                <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-none font-normal px-2.5 py-1 text-xs truncate max-w-[140px]" title={suministro.notes}>
                                    {suministro.notes}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <SuministroForm
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                suministro={suministro}
            />
        </>
    );
}
