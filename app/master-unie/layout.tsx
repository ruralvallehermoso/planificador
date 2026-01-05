import { MasterNav } from './nav';

export default function MasterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Master UNIE</h1>
                <p className="text-slate-500 mt-1">Gestión académica integral</p>
            </div>

            <MasterNav />

            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
