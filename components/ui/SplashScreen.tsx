"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function FloatingPlanner3D() {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Rotación lenta sobre sí mismo 360 grados
        meshRef.current.rotation.y += 0.01;
        // Movimiento de flotación leve
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    });

    return (
        <group ref={meshRef}>
            {/* Cuerpo principal del "Planner/Libro" */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[2.5, 3.5, 0.4]} />
                <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.2} />
            </mesh>

            {/* Detalles: páginas del libro (borde blanco) */}
            <mesh position={[0.05, 0, 0]} castShadow>
                <boxGeometry args={[2.45, 3.4, 0.41]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
            </mesh>

            {/* Detalles: lomo del libro */}
            <mesh position={[-1.25, 0, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 3.5, 16]} />
                <meshStandardMaterial color="#0F172A" roughness={0.8} />
            </mesh>

            {/* Elemento dorado central (Logo/Cierre) */}
            <mesh position={[0.8, 0, 0.22]} castShadow>
                <boxGeometry args={[0.5, 0.8, 0.1]} />
                <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
}

export function SplashScreen() {
    const [showSplash, setShowSplash] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Revisar si ya hemos mostrado el splash en esta sesión de navegador.
        const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");

        if (!hasSeenSplash) {
            setShowSplash(true);
            // Auto-ocultar tras 5 segundos
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setShowSplash(false);
        sessionStorage.setItem("hasSeenSplash", "true");
    };

    // Evitar error de hidratación renderizando null hasta que estemos en el cliente
    if (!isClient) return null;

    return (
        <AnimatePresence>
            {showSplash && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-black overflow-hidden"
                >
                    {/* Elementos vivos de fondo */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px]"
                        />
                        <motion.div
                            animate={{
                                rotate: -360,
                                scale: [1, 1.5, 1],
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-[120px]"
                        />
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-md transition-all z-50 text-sm flex items-center gap-2"
                    >
                        <span>Omitir</span>
                        <X size={18} />
                    </button>

                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.4 }}
                        className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-8"
                    >
                        {/* Contenedor del Elemento 3D interactivo real */}
                        <div className="relative w-72 h-72 md:w-96 md:h-96 drop-shadow-2xl mb-8 flex items-center justify-center">
                            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                                <ambientLight intensity={0.5} />
                                <directionalLight position={[10, 10, 5]} intensity={1} />
                                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#A78BFA" />
                                <FloatingPlanner3D />
                                <Environment preset="city" />
                            </Canvas>
                        </div>

                        {/* Título y ProgressBar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 tracking-tight drop-shadow-md">
                                Unified Planner
                            </h1>

                            <div className="flex flex-col items-center text-white/60 space-y-4">
                                <p className="text-sm font-semibold tracking-[0.2em] uppercase">
                                    Cargando entorno...
                                </p>

                                {/* Barra de progreso */}
                                <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ duration: 4.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
