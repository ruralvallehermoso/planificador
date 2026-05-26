import { Sidebar } from "@/components/layout/Sidebar";
import { Suspense } from "react";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full overflow-hidden print:block print:h-auto print:overflow-visible">
            {/* Sidebar */}
            <Suspense fallback={<div className="w-64 h-full bg-white/50 border-r print:hidden" />}>
                <div className="print:hidden">
                    <Sidebar />
                </div>
            </Suspense>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:block print:h-auto print:overflow-visible">
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth print:block print:h-auto print:overflow-visible print:p-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
