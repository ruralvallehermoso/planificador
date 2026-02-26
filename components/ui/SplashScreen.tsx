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
    const sceneRef = useRef<THREE.Group>(null);
    const orbitRef = useRef<THREE.Group>(null);
    const clockHandRef = useRef<THREE.Mesh>(null);
    const clockMinRef = useRef<THREE.Mesh>(null);
    const dataStreamRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!sceneRef.current || !orbitRef.current || !dataStreamRef.current) return;
        const t = state.clock.elapsedTime;

        // Rotación lenta y majestuosa del conjunto
        sceneRef.current.rotation.y += 0.004;
        sceneRef.current.position.y = Math.sin(t * 1.2) * 0.12;

        // Las tarjetas de módulo orbitan a distinto ritmo
        orbitRef.current.rotation.y += 0.008;

        // Agujas del reloj
        if (clockHandRef.current) clockHandRef.current.rotation.z = -t * 0.5;
        if (clockMinRef.current) clockMinRef.current.rotation.z = -t * 0.04;

        // Stream de datos flota y pulsa
        dataStreamRef.current.rotation.y -= 0.012;
        dataStreamRef.current.position.y = Math.sin(t * 3) * 0.05;
    });

    const moduleCards = [
        { color: "#10B981", y: 0.6, angle: 0 },        // Finanzas
        { color: "#3B82F6", y: 0.15, angle: 1.256 },    // FP Informática
        { color: "#F59E0B", y: -0.3, angle: 2.513 },    // Casa Rural
        { color: "#A78BFA", y: -0.75, angle: 3.769 },   // Master UNIE
        { color: "#EC4899", y: -1.2, angle: 5.026 },    // Hogar
    ];

    return (
        <group ref={sceneRef} scale={0.85}>

            {/* ============ PANTALLA CENTRAL (TABLET / DASHBOARD) ============ */}
            <group>
                {/* Marco exterior de la tablet */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[2.6, 3.6, 0.12]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.5} metalness={0.3} />
                </mesh>
                {/* Pantalla (cristal oscuro brillante) */}
                <mesh position={[0, 0, 0.065]} castShadow>
                    <boxGeometry args={[2.3, 3.3, 0.01]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.1} metalness={0.6} />
                </mesh>

                {/* === UI ELEMENTS EN PANTALLA === */}
                {/* Header bar */}
                <mesh position={[0, 1.4, 0.08]}>
                    <boxGeometry args={[2.1, 0.3, 0.01]} />
                    <meshStandardMaterial color="#38BDF8" roughness={0.4} metalness={0.3} emissive="#38BDF8" emissiveIntensity={0.15} />
                </mesh>
                {/* Sidebar nav */}
                <mesh position={[-0.85, 0, 0.08]}>
                    <boxGeometry args={[0.35, 2.5, 0.01]} />
                    <meshStandardMaterial color="#1E3A5F" roughness={0.6} emissive="#1E3A5F" emissiveIntensity={0.1} />
                </mesh>
                {/* Sidebar nav items */}
                {[0.8, 0.4, 0, -0.4, -0.8].map((y, i) => (
                    <mesh key={`nav-${i}`} position={[-0.85, y, 0.09]}>
                        <boxGeometry args={[0.22, 0.12, 0.01]} />
                        <meshStandardMaterial
                            color={moduleCards[i]?.color || "#64748B"}
                            roughness={0.5}
                            emissive={moduleCards[i]?.color || "#64748B"}
                            emissiveIntensity={0.2}
                        />
                    </mesh>
                ))}

                {/* Content cards grid (2x2) */}
                {[
                    { x: -0.15, y: 0.55, w: 0.8, h: 0.6, c: "#10B981" },
                    { x: 0.75, y: 0.55, w: 0.6, h: 0.6, c: "#3B82F6" },
                    { x: -0.15, y: -0.2, w: 0.8, h: 0.5, c: "#F59E0B" },
                    { x: 0.75, y: -0.2, w: 0.6, h: 0.5, c: "#A78BFA" },
                ].map((card, i) => (
                    <group key={`card-${i}`}>
                        <mesh position={[card.x, card.y, 0.08]}>
                            <boxGeometry args={[card.w, card.h, 0.01]} />
                            <meshStandardMaterial color="#0F172A" roughness={0.8} />
                        </mesh>
                        {/* Card accent bar */}
                        <mesh position={[card.x, card.y + card.h / 2 - 0.04, 0.09]}>
                            <boxGeometry args={[card.w, 0.04, 0.01]} />
                            <meshStandardMaterial color={card.c} emissive={card.c} emissiveIntensity={0.3} roughness={0.3} />
                        </mesh>
                        {/* Fake text lines */}
                        {[0, -0.1, -0.2].map((dy, j) => (
                            <mesh key={`line-${i}-${j}`} position={[card.x, card.y + dy, 0.09]}>
                                <boxGeometry args={[card.w * 0.7 - j * 0.1, 0.03, 0.005]} />
                                <meshStandardMaterial color="#334155" roughness={0.9} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Bottom stat bar */}
                <mesh position={[0.3, -0.85, 0.08]}>
                    <boxGeometry args={[1.7, 0.25, 0.01]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.8} />
                </mesh>
                {/* Mini bar chart */}
                {[0, 0.15, 0.3, 0.45, 0.6, 0.75].map((x, i) => (
                    <mesh key={`bar-${i}`} position={[-0.15 + x, -0.85 + (0.03 + i * 0.01), 0.09]}>
                        <boxGeometry args={[0.08, 0.06 + i * 0.02, 0.005]} />
                        <meshStandardMaterial
                            color={i > 3 ? "#10B981" : "#38BDF8"}
                            emissive={i > 3 ? "#10B981" : "#38BDF8"}
                            emissiveIntensity={0.25}
                            roughness={0.4}
                        />
                    </mesh>
                ))}

                {/* Bisel inferior */}
                <mesh position={[0, -1.72, 0.025]} castShadow>
                    <cylinderGeometry args={[0.06, 0.06, 0.08, 32]} />
                    <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.5} />
                </mesh>

                {/* Cámara superior */}
                <mesh position={[0, 1.65, 0.065]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.8} />
                </mesh>

                {/* Glow perimetral (borde neón sutil) */}
                <mesh position={[0, 0, 0.06]}>
                    <boxGeometry args={[2.5, 3.5, 0.005]} />
                    <meshBasicMaterial color="#38BDF8" transparent opacity={0.08} />
                </mesh>
            </group>

            {/* ============ RELOJ ANALÓGICO 3D FLOTANDO ARRIBA ============ */}
            <group position={[1.6, 2, 0.5]} rotation={[0.2, -0.3, 0.1]}>
                {/* Esfera del reloj */}
                <mesh castShadow>
                    <cylinderGeometry args={[0.5, 0.5, 0.08, 32]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.5} />
                </mesh>
                {/* Cara blanca */}
                <mesh position={[0, 0.045, 0]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0.44, 0.44, 0.01, 32]} />
                    <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
                </mesh>
                {/* Marcas de las horas */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    return (
                        <mesh key={`hour-${i}`} position={[Math.sin(angle) * 0.37, 0.05, Math.cos(angle) * 0.37]}>
                            <boxGeometry args={[0.03, 0.01, i % 3 === 0 ? 0.08 : 0.04]} />
                            <meshStandardMaterial color="#0F172A" roughness={0.8} />
                        </mesh>
                    );
                })}
                {/* Aguja de hora */}
                <mesh ref={clockMinRef} position={[0, 0.055, 0]}>
                    <boxGeometry args={[0.03, 0.005, 0.22]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.8} />
                </mesh>
                {/* Aguja de minuto */}
                <mesh ref={clockHandRef} position={[0, 0.06, 0]}>
                    <boxGeometry args={[0.02, 0.005, 0.32]} />
                    <meshStandardMaterial color="#E11D48" roughness={0.5} />
                </mesh>
                {/* Centro */}
                <mesh position={[0, 0.065, 0]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
                </mesh>
            </group>

            {/* ============ TARJETAS DE MÓDULOS ORBITANDO ============ */}
            <group ref={orbitRef}>
                {moduleCards.map((mod, i) => {
                    const angle = mod.angle;
                    const radius = 2.8;
                    return (
                        <group key={`mod-${i}`} position={[Math.sin(angle) * radius, mod.y, Math.cos(angle) * radius]}>
                            {/* Tarjeta base */}
                            <mesh castShadow>
                                <boxGeometry args={[0.7, 0.45, 0.03]} />
                                <meshStandardMaterial color="#0F172A" roughness={0.7} />
                            </mesh>
                            {/* Franja de color */}
                            <mesh position={[0, 0.19, 0.02]}>
                                <boxGeometry args={[0.7, 0.06, 0.01]} />
                                <meshStandardMaterial color={mod.color} emissive={mod.color} emissiveIntensity={0.4} roughness={0.3} />
                            </mesh>
                            {/* Icono simulado */}
                            <mesh position={[-0.2, 0.02, 0.02]}>
                                <sphereGeometry args={[0.06, 16, 16]} />
                                <meshStandardMaterial color={mod.color} emissive={mod.color} emissiveIntensity={0.3} roughness={0.4} />
                            </mesh>
                            {/* Lines de texto ficticio */}
                            <mesh position={[0.1, 0.04, 0.02]}>
                                <boxGeometry args={[0.3, 0.03, 0.005]} />
                                <meshStandardMaterial color="#64748B" roughness={0.9} />
                            </mesh>
                            <mesh position={[0.08, -0.02, 0.02]}>
                                <boxGeometry args={[0.25, 0.02, 0.005]} />
                                <meshStandardMaterial color="#475569" roughness={0.9} />
                            </mesh>
                        </group>
                    );
                })}
            </group>

            {/* ============ CALENDARIO MINI FLOTANDO ABAJO ============ */}
            <group position={[-1.8, -1.8, 0.8]} rotation={[-0.3, 0.4, 0.1]}>
                {/* Base del calendario */}
                <mesh castShadow>
                    <boxGeometry args={[1, 0.8, 0.03]} />
                    <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
                </mesh>
                {/* Header del calendario */}
                <mesh position={[0, 0.32, 0.02]}>
                    <boxGeometry args={[1, 0.15, 0.01]} />
                    <meshStandardMaterial color="#E11D48" roughness={0.5} />
                </mesh>
                {/* Grid de días (7x4 puntos) */}
                {Array.from({ length: 28 }).map((_, i) => {
                    const col = i % 7;
                    const row = Math.floor(i / 7);
                    return (
                        <mesh key={`day-${i}`} position={[-0.36 + col * 0.12, 0.15 - row * 0.12, 0.02]}>
                            <boxGeometry args={[0.08, 0.08, 0.005]} />
                            <meshStandardMaterial
                                color={i === 14 ? "#38BDF8" : "#E2E8F0"}
                                emissive={i === 14 ? "#38BDF8" : "#000000"}
                                emissiveIntensity={i === 14 ? 0.5 : 0}
                                roughness={0.8}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* ============ PARTÍCULAS DE DATOS / STREAM ============ */}
            <group ref={dataStreamRef}>
                {Array.from({ length: 18 }).map((_, i) => {
                    const a = (i / 18) * Math.PI * 2;
                    const r = 3.5 + Math.sin(i * 1.5) * 0.5;
                    const y = (Math.sin(i * 0.8) * 2);
                    return (
                        <mesh key={`particle-${i}`} position={[Math.sin(a) * r, y, Math.cos(a) * r]}>
                            <sphereGeometry args={[0.04 + (i % 3) * 0.02, 8, 8]} />
                            <meshStandardMaterial
                                color={["#38BDF8", "#A78BFA", "#10B981", "#F59E0B", "#EC4899"][i % 5]}
                                emissive={["#38BDF8", "#A78BFA", "#10B981", "#F59E0B", "#EC4899"][i % 5]}
                                emissiveIntensity={0.6}
                                roughness={0.3}
                            />
                        </mesh>
                    );
                })}
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
