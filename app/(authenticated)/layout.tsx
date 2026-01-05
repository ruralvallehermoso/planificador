import { Sidebar } from "@/components/layout/Sidebar";
import { Suspense } from "react";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full overflow-hidden">
            {/* Sidebar */}
            <Suspense fallback={<div className="w-64 h-full bg-white/50 border-r" />}>
                <Sidebar />
            </Suspense>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
