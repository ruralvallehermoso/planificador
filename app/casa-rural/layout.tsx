export default function CasaRuralLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full -m-6">
            {children}
        </div>
    );
}
