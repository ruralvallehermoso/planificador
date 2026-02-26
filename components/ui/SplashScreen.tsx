"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingPlanner3D() {
    const sceneRef = useRef<THREE.Group>(null);
    const coverRef = useRef<THREE.Group>(null);
    const penRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!sceneRef.current) return;
        const t = state.clock.elapsedTime;

        // Rotación elegante del conjunto completo
        sceneRef.current.rotation.y += 0.004;
        sceneRef.current.position.y = Math.sin(t * 1.0) * 0.1;

        // Tapa del planner respira suavemente
        if (coverRef.current) {
            coverRef.current.rotation.y = Math.sin(t * 0.8) * 0.04 - 0.2;
        }

        // Bolígrafo flota con micro-movimiento independiente
        if (penRef.current) {
            penRef.current.position.y = 0.15 + Math.sin(t * 2) * 0.06;
            penRef.current.rotation.z = 0.15 + Math.sin(t * 1.5) * 0.03;
        }

        // Partículas ambientales giran lento
        if (glowRef.current) {
            glowRef.current.rotation.y -= 0.003;
        }
    });

    return (
        <group ref={sceneRef} scale={0.75} rotation={[0.15, 0, 0]}>

            {/* ====== SUPERFICIE FLOTANTE (ESCRITORIO) ====== */}
            <mesh position={[0, -1.05, 0]} castShadow receiveShadow>
                <boxGeometry args={[5, 0.08, 3.5]} />
                <meshStandardMaterial color="#1E293B" roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Borde dorado del escritorio */}
            <mesh position={[0, -1.01, 0]}>
                <boxGeometry args={[5.04, 0.02, 3.54]} />
                <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* ====== PLANNER PRINCIPAL (CENTRO-IZQUIERDA) ====== */}
            <group position={[-0.6, 0, 0.2]}>
                {/* --- Anillas metálicas del binder --- */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <mesh key={`ring-${i}`} position={[-1.05, -0.12, 0.9 - i * 0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <torusGeometry args={[0.15, 0.025, 16, 32]} />
                        <meshStandardMaterial color="#D4D4D8" metalness={0.95} roughness={0.05} />
                    </mesh>
                ))}

                {/* --- Tapa trasera --- */}
                <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[2.2, 1.9, 0.05]} />
                    <meshStandardMaterial color="#1a1a2e" roughness={0.85} />
                </mesh>

                {/* --- Bloque de páginas --- */}
                <mesh position={[0.05, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[2.1, 1.8, 0.3]} />
                    <meshStandardMaterial color="#FAFAFA" roughness={1} />
                </mesh>
                {/* Hojas sueltas superiores */}
                <mesh position={[0.08, 0.12, 0.01]} rotation={[-Math.PI / 2, 0, 0.008]} castShadow>
                    <boxGeometry args={[2.05, 1.78, 0.01]} />
                    <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
                </mesh>
                <mesh position={[0.06, 0.13, -0.02]} rotation={[-Math.PI / 2, 0, -0.005]} castShadow>
                    <boxGeometry args={[2.05, 1.78, 0.01]} />
                    <meshStandardMaterial color="#F8FAFC" roughness={0.95} />
                </mesh>

                {/* --- Separadores de módulos (pestañas laterales) --- */}
                {[
                    { z: 0.7, color: "#10B981" },
                    { z: 0.3, color: "#3B82F6" },
                    { z: -0.1, color: "#F59E0B" },
                    { z: -0.5, color: "#A78BFA" },
                    { z: -0.85, color: "#EC4899" },
                ].map((tab, i) => (
                    <mesh key={`tab-${i}`} position={[1.15, 0, tab.z]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.25, 0.01]} />
                        <meshStandardMaterial color={tab.color} roughness={0.5} />
                    </mesh>
                ))}

                {/* --- Post-it amarillo --- */}
                <mesh position={[0.3, 0.14, 0.4]} rotation={[-Math.PI / 2, 0, 0.06]} castShadow>
                    <boxGeometry args={[0.5, 0.5, 0.005]} />
                    <meshStandardMaterial color="#FEF08A" roughness={0.85} />
                </mesh>

                {/* --- Tapa delantera articulada --- */}
                <group ref={coverRef} position={[-1.05, 0.1, 0]}>
                    <group position={[1.05, 0, 0]}>
                        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[2.2, 1.9, 0.06]} />
                            <meshStandardMaterial color="#16213e" roughness={0.75} metalness={0.15} />
                        </mesh>
                        {/* Borde decorativo interior */}
                        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <boxGeometry args={[2.0, 1.7, 0.005]} />
                            <meshBasicMaterial color="#1a1a3e" />
                        </mesh>
                        {/* Placa dorada premium */}
                        <mesh position={[0, 0.04, 0.2]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                            <boxGeometry args={[1.0, 0.6, 0.015]} />
                            <meshStandardMaterial color="#D4A843" metalness={0.85} roughness={0.15} />
                        </mesh>
                        {/* Interior de la placa */}
                        <mesh position={[0, 0.045, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <boxGeometry args={[0.85, 0.45, 0.005]} />
                            <meshStandardMaterial color="#0F172A" roughness={0.9} />
                        </mesh>
                        {/* Elástico vertical de cierre */}
                        <mesh position={[0.85, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                            <boxGeometry args={[0.08, 1.92, 0.015]} />
                            <meshStandardMaterial color="#0a0a1e" roughness={0.95} />
                        </mesh>
                    </group>
                </group>

                {/* --- Marcapáginas rojo de tela --- */}
                <mesh position={[0.2, 0.05, -1.05]} rotation={[-Math.PI / 2 + 0.15, 0, 0.05]} castShadow>
                    <boxGeometry args={[0.1, 0.5, 0.005]} />
                    <meshStandardMaterial color="#DC2626" roughness={0.95} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* ====== PORTÁTIL ESTILIZADO (DERECHA) ====== */}
            <group position={[1.6, -0.7, -0.1]} rotation={[0, -0.3, 0]}>
                {/* Base / Chasis */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.8, 0.06, 1.2]} />
                    <meshStandardMaterial color="#27272A" roughness={0.4} metalness={0.6} />
                </mesh>
                {/* Teclado */}
                <mesh position={[0, 0.035, -0.05]}>
                    <boxGeometry args={[1.5, 0.005, 0.7]} />
                    <meshStandardMaterial color="#18181B" roughness={0.9} />
                </mesh>
                {/* Trackpad */}
                <mesh position={[0, 0.035, 0.35]}>
                    <boxGeometry args={[0.55, 0.005, 0.35]} />
                    <meshStandardMaterial color="#3F3F46" roughness={0.3} metalness={0.3} />
                </mesh>
                {/* Pantalla (inclinada) */}
                <group position={[0, 0.65, -0.58]} rotation={[-0.25, 0, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[1.8, 1.2, 0.04]} />
                        <meshStandardMaterial color="#27272A" roughness={0.4} metalness={0.6} />
                    </mesh>
                    <mesh position={[0, 0, 0.025]}>
                        <boxGeometry args={[1.6, 1.0, 0.005]} />
                        <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.5} emissive="#1E3A5F" emissiveIntensity={0.1} />
                    </mesh>
                    {/* Header bar en pantalla */}
                    <mesh position={[0, 0.38, 0.03]}>
                        <boxGeometry args={[1.55, 0.12, 0.003]} />
                        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.15} roughness={0.4} />
                    </mesh>
                    {/* Sidebar en pantalla */}
                    <mesh position={[-0.6, -0.08, 0.03]}>
                        <boxGeometry args={[0.25, 0.8, 0.003]} />
                        <meshStandardMaterial color="#1E293B" emissive="#1E293B" emissiveIntensity={0.05} roughness={0.6} />
                    </mesh>
                    {/* 3 Cards de contenido */}
                    {[0.15, -0.1, -0.35].map((y, i) => (
                        <mesh key={`lc-${i}`} position={[0.15, y, 0.03]}>
                            <boxGeometry args={[0.9, 0.18, 0.003]} />
                            <meshStandardMaterial color="#1E293B" roughness={0.8} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* ====== TAZA DE CAFÉ (DERECHA ATRÁS) ====== */}
            <group position={[2.0, -0.55, -0.9]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.22, 0.18, 0.45, 32]} />
                    <meshStandardMaterial color="#F5F5F4" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
                    <meshStandardMaterial color="#3E2723" roughness={0.9} />
                </mesh>
                <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.12, 0.025, 12, 24, Math.PI]} />
                    <meshStandardMaterial color="#F5F5F4" roughness={0.7} />
                </mesh>
            </group>

            {/* ====== BOLÍGRAFO PREMIUM FLOTANDO ====== */}
            <group ref={penRef} position={[0.6, 0.15, 0.9]} rotation={[Math.PI / 2 - 0.1, 0, 0.15]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.04, 0.04, 2.2, 32]} />
                    <meshStandardMaterial color="#0F172A" metalness={0.5} roughness={0.4} />
                </mesh>
                <mesh position={[0, -1.15, 0]} castShadow>
                    <coneGeometry args={[0.04, 0.15, 32]} />
                    <meshStandardMaterial color="#A8A29E" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, -0.7, 0]}>
                    <cylinderGeometry args={[0.045, 0.045, 0.4, 32]} />
                    <meshStandardMaterial color="#334155" roughness={0.95} />
                </mesh>
                <mesh position={[0.05, 0.8, 0]} castShadow>
                    <boxGeometry args={[0.025, 0.6, 0.03]} />
                    <meshStandardMaterial color="#D4A843" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 1.13, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.08, 32]} />
                    <meshStandardMaterial color="#D4A843" metalness={0.85} roughness={0.15} />
                </mesh>
            </group>

            {/* ====== PARTÍCULAS AMBIENTALES SUTILES ====== */}
            <group ref={glowRef}>
                {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    const r = 3.2 + Math.sin(i * 2.1) * 0.6;
                    const y = Math.sin(i * 1.3) * 1.5;
                    const colors = ["#38BDF8", "#A78BFA", "#D4A843"];
                    return (
                        <mesh key={`glow-${i}`} position={[Math.sin(a) * r, y, Math.cos(a) * r]}>
                            <sphereGeometry args={[0.03 + (i % 3) * 0.015, 8, 8]} />
                            <meshStandardMaterial
                                color={colors[i % 3]}
                                emissive={colors[i % 3]}
                                emissiveIntensity={0.5}
                                roughness={0.2}
                                transparent
                                opacity={0.7}
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
        const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");

        if (!hasSeenSplash) {
            setShowSplash(true);
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
                        className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg p-8"
                    >
                        {/* Contenedor del Elemento 3D */}
                        <div className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] drop-shadow-2xl mb-8 flex items-center justify-center">
                            <Canvas camera={{ position: [0, 2, 6], fov: 40 }}>
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
