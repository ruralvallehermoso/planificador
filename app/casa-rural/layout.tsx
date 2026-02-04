"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function CasaRuralLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        // Obtener la configuración de Casa Rural para el logo
        fetch("/casa-rural/proxy/api/config")
            .then((res) => res.json())
            .then((data) => {
                if (data?.logo) {
                    setLogo(data.logo);
                }
            })
            .catch((err) => {
                console.error("Error cargando config de Casa Rural:", err);
            });
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center px-6 pt-6 pb-2">
                <div className="relative w-8 h-8 mr-2">
                    {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logo}
                            alt="Logo Casa Rural"
                            className="w-8 h-8 object-contain"
                        />
                    ) : (
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    )}
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
