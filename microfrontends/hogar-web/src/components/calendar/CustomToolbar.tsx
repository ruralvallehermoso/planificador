'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Views } from 'react-big-calendar';
import clsx from 'clsx';

interface ToolbarProps {
    date: Date;
    view: string;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    onView: (view: any) => void;
    label: string;
}

export function CustomToolbar({ date, view, onNavigate, onView, label }: ToolbarProps) {
    // macOS style segmented control classes
    const segmentedBase = "px-3 py-1.5 text-sm font-medium transition-colors border-y border-r border-gray-300 first:border-l first:rounded-l-md last:rounded-r-md bg-white hover:bg-gray-50";
    const segmentedActive = "bg-gray-100 text-gray-900 shadow-inner";
    const segmentedInactive = "text-gray-600";

    const ViewButton = ({ viewName, label }: { viewName: string, label: string }) => (
        <button
            onClick={() => onView(viewName)}
            className={clsx(
                segmentedBase,
                view === viewName ? segmentedActive : segmentedInactive
            )}
        >
            {label}
        </button>
    );

    return (
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-4">
                {/* Navigation Group */}
                <div className="flex shadow-sm rounded-md isolate">
                    <button
                        onClick={() => onNavigate('TODAY')}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 bg-gradient-to-b from-white to-gray-50"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="px-2 py-1.5 text-gray-600 bg-white border-y border-r border-l-0 border-gray-300 hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="px-2 py-1.5 text-gray-600 bg-white border-y border-r border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Current Date Label */}
                <h2 className="text-xl font-bold text-gray-900 capitalize min-w-[200px]">
                    {label}
                </h2>
            </div>

            {/* View Selector (Segmented Control) */}
            <div className="flex shadow-sm isolate">
                <ViewButton viewName={Views.DAY} label="Día" />
                <ViewButton viewName={Views.WEEK} label="Semana" />
                <ViewButton viewName={Views.MONTH} label="Mes" />
                <ViewButton viewName={Views.AGENDA} label="Agenda" />
            </div>
        </div>
    );
}
