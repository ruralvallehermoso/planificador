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
    const groupRef = useRef<THREE.Group>(null);
    const coverRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !coverRef.current || !particlesRef.current) return;
        const t = state.clock.elapsedTime;

        // Rotación continua 360 grados todo el conjunto principal
        groupRef.current.rotation.y += 0.005;
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.15;

        // La tapa frontal "respira" abriéndose un poco más o menos
        coverRef.current.rotation.y = Math.sin(t * 1.5) * 0.05 - 0.25;

        // Partículas temáticas flotando alrededor a distinto ritmo
        particlesRef.current.rotation.y -= 0.006;
        particlesRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
        particlesRef.current.position.y = Math.sin(t * 2) * 0.1;
    });

    return (
        <group ref={groupRef} scale={0.9}>
            {/* --- ANILLAS DEL BINDER (LOMO METÁLICO) --- */}
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={`ring-${i}`} position={[-1.3, 1.2 - i * 0.48, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <torusGeometry args={[0.18, 0.03, 16, 32]} />
                    <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.1} />
                </mesh>
            ))}

            {/* --- TAPA TRASERA --- */}
            <mesh position={[-0.1, 0, -0.22]} castShadow receiveShadow>
                <boxGeometry args={[2.5, 3.6, 0.06]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>

            {/* --- BLOQUE DE PÁGINAS INTERNAS --- */}
            {/* Página base gruesa */}
            <mesh position={[-0.05, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.35, 3.4, 0.3]} />
                <meshStandardMaterial color="#F8FAFC" roughness={1} />
            </mesh>
            {/* Páginas superiores algo desordenadas para realismo */}
            <mesh position={[-0.03, 0.02, 0.16]} rotation={[0, 0, 0.01]} castShadow>
                <boxGeometry args={[2.3, 3.38, 0.02]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
            </mesh>
            <mesh position={[-0.02, -0.01, 0.18]} rotation={[0, 0, -0.005]} castShadow>
                <boxGeometry args={[2.3, 3.38, 0.02]} />
                <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
            </mesh>

            {/* --- POST-ITS Y MARCADORES EN LAS PÁGINAS --- */}
            {/* Post-it amarillo (Tareas) */}
            <mesh position={[0.4, 0.8, 0.2]} rotation={[0, 0, 0.05]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.01]} />
                <meshStandardMaterial color="#FEF08A" roughness={0.8} />
            </mesh>
            {/* Post-it rosa (Ideas) */}
            <mesh position={[0.6, -0.2, 0.2]} rotation={[0, 0, -0.08]} castShadow>
                <boxGeometry args={[0.5, 0.5, 0.01]} />
                <meshStandardMaterial color="#FBCFE8" roughness={0.8} />
            </mesh>

            {/* --- SEPARADORES DE PESTAÑAS LATERALES --- */}
            {/* Finanzas */}
            <mesh position={[1.15, 1.2, 0]} castShadow>
                <boxGeometry args={[0.3, 0.4, 0.02]} />
                <meshStandardMaterial color="#10B981" roughness={0.6} />
            </mesh>
            {/* Hogar */}
            <mesh position={[1.15, 0.6, 0]} castShadow>
                <boxGeometry args={[0.3, 0.4, 0.02]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.6} />
            </mesh>
            {/* FP / UNIE */}
            <mesh position={[1.15, 0, 0]} castShadow>
                <boxGeometry args={[0.3, 0.4, 0.02]} />
                <meshStandardMaterial color="#3B82F6" roughness={0.6} />
            </mesh>
            {/* Inventario/Otros */}
            <mesh position={[1.15, -0.6, 0]} castShadow>
                <boxGeometry args={[0.3, 0.4, 0.02]} />
                <meshStandardMaterial color="#8B5CF6" roughness={0.6} />
            </mesh>

            {/* --- TAPA DELANTERA (ARTICULADA DESDE LAS ANILLAS) --- */}
            <group ref={coverRef} position={[-1.3, 0, 0.22]}>
                {/* Geometría de la tapa desplazada para que el pivote sea el lomo */}
                <group position={[1.2, 0, 0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[2.5, 3.6, 0.06]} />
                        <meshStandardMaterial color="#1E293B" roughness={0.8} metalness={0.2} />
                    </mesh>

                    {/* Costuras/Bordes decorativos tapa frontal */}
                    <mesh position={[0, 0, 0.035]} castShadow>
                        <boxGeometry args={[2.3, 3.4, 0.01]} />
                        <meshBasicMaterial color="#334155" />
                    </mesh>

                    {/* Impresión / Placa metálica dorada */}
                    <mesh position={[0, 0.3, 0.04]} castShadow>
                        <boxGeometry args={[1.2, 0.8, 0.02]} />
                        <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Interior placa central */}
                    <mesh position={[0, 0.3, 0.05]} castShadow>
                        <boxGeometry args={[1.0, 0.6, 0.01]} />
                        <meshStandardMaterial color="#0F172A" roughness={0.8} />
                    </mesh>

                    {/* Cinta elástica (cierre vertical) */}
                    <mesh position={[0.9, 0, 0.03]} castShadow>
                        <boxGeometry args={[0.15, 3.62, 0.02]} />
                        <meshStandardMaterial color="#0F172A" roughness={0.9} />
                    </mesh>
                </group>
            </group>

            {/* --- BOLÍGRAFO PREMIUM FLOTANDO ACERTADO --- */}
            <group position={[1.9, -0.5, 0.5]} rotation={[0.2, 0, 0.3]}>
                {/* Cuerpo principal */}
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.07, 0.07, 2.8, 32]} />
                    <meshStandardMaterial color="#0F172A" metalness={0.4} roughness={0.6} />
                </mesh>
                {/* Punta metálica */}
                <mesh position={[0, -1.5, 0]} castShadow>
                    <coneGeometry args={[0.07, 0.25, 32]} />
                    <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Grip acolchado inferior */}
                <mesh position={[0, -1.0, 0]} castShadow>
                    <cylinderGeometry args={[0.072, 0.072, 0.6, 32]} />
                    <meshStandardMaterial color="#334155" roughness={0.9} />
                </mesh>
                {/* Clip Dorado */}
                <mesh position={[0.08, 1.0, 0]} castShadow>
                    <boxGeometry args={[0.03, 0.8, 0.04]} />
                    <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Cap superior u oro */}
                <mesh position={[0, 1.45, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.07, 0.15, 32]} />
                    <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>

            {/* --- ELEMENTOS FLOTANTES ALREDEDOR (TAREAS, FINANZAS, NOTAS) --- */}
            <group ref={particlesRef}>
                {/* Tarjeta de crédito flotante (Finanzas) */}
                <mesh position={[-2.2, 1.2, 1]} rotation={[0.5, 0.2, 0.3]} castShadow>
                    <boxGeometry args={[0.8, 0.5, 0.02]} />
                    <meshStandardMaterial color="#3B82F6" roughness={0.5} />
                </mesh>
                <mesh position={[-2.2, 1.2, 1.02]} rotation={[0.5, 0.2, 0.3]} castShadow>
                    <boxGeometry args={[0.1, 0.3, 0.01]} />
                    <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Pequeño cubo verde de "construcción" (Hábitos/Tareas) */}
                <mesh position={[2, 2, -1]} rotation={[0.4, 0.6, 0.1]} castShadow>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color="#10B981" roughness={0.3} metalness={0.2} />
                </mesh>

                {/* Moneda / Ficha circular naranja (Hogar) */}
                <mesh position={[1.5, -2, 1.5]} rotation={[1.5, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
                    <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.2} />
                </mesh>

                {/* Foto polaroid o doc textual pequeño (Estudios) */}
                <group position={[-1.8, -1.8, -1]} rotation={[-0.2, -0.4, 0.1]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.6, 0.7, 0.02]} />
                        <meshStandardMaterial color="#FFFFFF" roughness={1} />
                    </mesh>
                    <mesh position={[0, 0.05, 0.015]} castShadow>
                        <boxGeometry args={[0.5, 0.5, 0.01]} />
                        <meshStandardMaterial color="#64748B" roughness={0.7} />
                    </mesh>
                </group>
            </group>
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
                                <ambientLight intensity={2.5} />
                                <directionalLight position={[10, 10, 10]} intensity={3} castShadow />
                                <directionalLight position={[-10, -10, -10]} intensity={1.5} color="#A78BFA" />
                                <pointLight position={[0, 5, 0]} intensity={2} color="#ffffff" />
                                <FloatingPlanner3D />
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
