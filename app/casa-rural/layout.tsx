import Image from "next/image";

export default function CasaRuralLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center px-6 pt-6 pb-2">
                <div className="relative w-8 h-8 mr-2">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                    Casa Rural
                </span>
            </div>
            <div className="flex-1 p-6 pt-2">
                {children}
            </div>
        </div>
    );
}
