export default function FinanzasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full">
            {children}
        </div>
    );
}
