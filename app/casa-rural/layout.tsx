"use client";

export default function CasaRuralLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

