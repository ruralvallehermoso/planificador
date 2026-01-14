'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Copy, Loader2 } from 'lucide-react';
import { deleteLogEntry, duplicateLogEntry } from '@/app/master-unie/practicum/actions';
import { useRouter } from 'next/navigation';
import { InternshipLogForm } from './InternshipLogForm';

interface LogEntryActionsProps {
    log: {
        id: string;
        date: Date;
        hours: number;
        activity: string;
        observations: string | null;
    };
}

export function LogEntryActions({ log }: LogEntryActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
        setLoading(true);
        try {
            await deleteLogEntry(log.id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar");
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async () => {
        setLoading(true);
        try {
            await duplicateLogEntry(log.id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al duplicar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <InternshipLogForm
                initialData={log}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}
