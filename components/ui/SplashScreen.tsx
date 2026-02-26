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

        // Rotación global envolvente
        sceneRef.current.rotation.y = Math.sin(t * 0.3) * 0.2 + t * 0.05;
        sceneRef.current.position.y = Math.sin(t * 1.2) * 0.12;

        // Tapa del planner "respira" muy sutilmente
        if (coverRef.current) {
            coverRef.current.rotation.y = Math.sin(t * 1.5) * 0.02 - 0.15;
        }

        // Bolígrafo flota orgánicamente
        if (penRef.current) {
            penRef.current.position.y = -0.05 + Math.sin(t * 2.5) * 0.04;
            penRef.current.position.z = 0.9 + Math.cos(t * 2) * 0.02;
            penRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 1.5) * 0.05;
        }

        if (glowRef.current) {
            glowRef.current.rotation.y -= 0.005;
            glowRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
        }
    });

    return (
        <group ref={sceneRef} scale={0.75} rotation={[0.2, -0.3, 0]}>

            {/* ====== 1. SUPERFICIE / PAD FLOTANTE PREMIUM ====== */}
            <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
                {/* Pad de escritorio redondeado sutil */}
                <cylinderGeometry args={[3.2, 3.2, 0.04, 64]} />
                <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
            </mesh>
            <mesh position={[0, -1.22, 0]}>
                <cylinderGeometry args={[3.3, 3.3, 0.015, 64]} />
                <meshStandardMaterial color="#38BDF8" metalness={0.8} roughness={0.2} emissive="#38BDF8" emissiveIntensity={0.2} />
            </mesh>

            {/* ====== 2. LAPTOP / ULTRABOOK (Derecha) ====== */}
            <group position={[1.4, -1.15, -0.2]} rotation={[0, -0.35, 0]}>
                {/* Chasis base ultrafino */}
                <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
                    <boxGeometry args={[2.2, 0.08, 1.4]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Zona del teclado oscuro */}
                <mesh position={[0, 0.081, -0.1]} receiveShadow>
                    <boxGeometry args={[1.9, 0.005, 0.7]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.9} />
                </mesh>

                {/* Teclas individuales simuladas */}
                <group position={[-0.9, 0.085, -0.4]}>
                    {Array.from({ length: 5 }).map((_, row) => (
                        Array.from({ length: 14 }).map((_, col) => {
                            // Dejar un hueco simulando la barra espaciadora
                            if (row === 4 && col > 3 && col < 10) {
                                if (col !== 4) return null; // Solo pintar la barra central
                                return (
                                    <mesh key={`key-${row}-${col}`} position={[col * 0.13 + 0.35, 0, row * 0.13 + 0.05]}>
                                        <boxGeometry args={[0.7, 0.015, 0.1]} />
                                        <meshStandardMaterial color="#0F172A" roughness={0.8} />
                                    </mesh>
                                );
                            }
                            return (
                                <mesh key={`key-${row}-${col}`} position={[col * 0.13 + 0.1, 0, row * 0.13 + 0.05]}>
                                    <boxGeometry args={[0.11, 0.015, 0.11]} />
                                    <meshStandardMaterial color="#0F172A" roughness={0.8} />
                                </mesh>
                            );
                        })
                    ))}
                </group>

                {/* Trackpad texturizado cristal */}
                <mesh position={[0, 0.082, 0.4]}>
                    <boxGeometry args={[0.7, 0.002, 0.4]} />
                    <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.6} />
                </mesh>

                {/* Pantalla bisagra */}
                <mesh position={[0, 0.08, -0.68]}>
                    <cylinderGeometry args={[0.03, 0.03, 1.8, 32]} rotation={[0, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#1E293B" />
                </mesh>

                {/* Pantalla retina brillante */}
                <group position={[0, 0.75, -0.7]} rotation={[-0.15, 0, 0]}>
                    {/* Marco de aluminio exterior */}
                    <mesh castShadow position={[0, 0, -0.02]}>
                        <boxGeometry args={[2.2, 1.4, 0.03]} />
                        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Cristal / Pantalla negra pura */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[2.1, 1.3, 0.02]} />
                        <meshStandardMaterial color="#020617" roughness={0.05} metalness={0.9} emissive="#020617" emissiveIntensity={0.5} />
                    </mesh>

                    {/* === UI del Planificador en Pantalla === */}
                    <group position={[0, 0, 0.012]}>
                        {/* Header Glassmorphism */}
                        <mesh position={[0, 0.52, 0]}>
                            <boxGeometry args={[1.9, 0.15, 0.002]} />
                            <meshStandardMaterial color="#0F172A" transparent opacity={0.6} emissive="#0F172A" />
                        </mesh>
                        {/* Accent línea celeste */}
                        <mesh position={[0, 0.44, 0.002]}>
                            <boxGeometry args={[1.9, 0.01, 0.001]} />
                            <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1.5} />
                        </mesh>
                        {/* Sidebar con glow lateral */}
                        <mesh position={[-0.8, -0.15, 0]}>
                            <boxGeometry args={[0.3, 1.1, 0.002]} />
                            <meshStandardMaterial color="#0F172A" transparent opacity={0.8} />
                        </mesh>
                        {/* Módulos activos en sidebar */}
                        {[0.2, 0, -0.2, -0.4, -0.6].map((y, i) => (
                            <mesh key={`p-${i}`} position={[-0.8, y, 0.002]}>
                                <boxGeometry args={[0.2, 0.08, 0.001]} />
                                <meshStandardMaterial
                                    color={["#10B981", "#3B82F6", "#F59E0B", "#A78BFA", "#EC4899"][i]}
                                    emissive={["#10B981", "#3B82F6", "#F59E0B", "#A78BFA", "#EC4899"][i]}
                                    emissiveIntensity={0.6}
                                />
                            </mesh>
                        ))}
                        {/* Gran widget de Dashboard */}
                        <mesh position={[0.15, 0.15, 0]}>
                            <boxGeometry args={[1.4, 0.5, 0.002]} />
                            <meshStandardMaterial color="#0F172A" />
                        </mesh>
                        {/* Gráfica de líneas animada/estilizada */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <mesh key={`bar-${i}`} position={[-0.4 + i * 0.15, 0.05 + Math.sin(i) * 0.1, 0.003]}>
                                <boxGeometry args={[0.08, 0.2 + Math.random() * 0.2, 0.001]} />
                                <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={1} />
                            </mesh>
                        ))}
                    </group>
                </group>
            </group>

            {/* ====== 3. PLANNER DE CUERO / AGENDA PREMIUM (Izquierda) ====== */}
            <group position={[-1.2, -1.0, 0.4]} rotation={[0, 0.2, 0]}>

                {/* --- Bloque de páginas super detallado --- */}
                {/* Pila de hojas inferior densa */}
                <mesh position={[0.1, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[2.2, 1.8, 0.25]} />
                    <meshStandardMaterial color="#E2E8F0" roughness={1} />
                </mesh>

                {/* Varias capas sutiles de hojas desalineadas para máximo realismo */}
                <group position={[0.1, 0.28, 0]}>
                    {[0, 1, 2, 3].map(i => (
                        <mesh key={`page-${i}`} position={[-0.02 + i * 0.01, i * 0.01, 0.01 + Math.sin(i) * 0.02]} rotation={[-Math.PI / 2, 0, i * 0.002]} castShadow>
                            <boxGeometry args={[2.15, 1.78, 0.005]} />
                            <meshStandardMaterial color={i === 3 ? "#FFFFFF" : "#F8FAFC"} roughness={0.9} />
                        </mesh>
                    ))}
                </group>

                {/* Grid impreso muy tenue en la página activa superior */}
                <mesh position={[0.1, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0.006]}>
                    <planeGeometry args={[2, 1.6]} />
                    <meshStandardMaterial color="#CBD5E1" transparent opacity={0.15} />
                </mesh>

                {/* --- Lomo y Anillas Metálicas (Premium Wire-o) --- */}
                {/* Pieza base encuadernación */}
                <mesh position={[-1.0, 0.15, 0]} castShadow>
                    <boxGeometry args={[0.1, 1.9, 0.28]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.8} />
                </mesh>

                {/* 6 Anillas dobles robustas */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <group key={`ring-${i}`} position={[-1.0, 0.16, 0.75 - i * 0.3]}>
                        <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
                            <torusGeometry args={[0.14, 0.02, 16, 32, Math.PI]} />
                            <meshStandardMaterial color="#94A3B8" metalness={1} roughness={0.1} />
                        </mesh>
                        <mesh position={[0.04, 0, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
                            <torusGeometry args={[0.14, 0.02, 16, 32, Math.PI]} />
                            <meshStandardMaterial color="#94A3B8" metalness={1} roughness={0.1} />
                        </mesh>
                    </group>
                ))}

                {/* --- Pestañas divisoras de Módulos (Separadores salientes) --- */}
                {[
                    { z: 0.6, color: "#10B981" },
                    { z: 0.2, color: "#3B82F6" },
                    { z: -0.2, color: "#F59E0B" },
                    { z: -0.6, color: "#A78BFA" },
                ].map((tab, i) => (
                    <group key={`tab-${i}`} position={[1.22, 0.15 + i * 0.03, tab.z]}>
                        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
                            <boxGeometry args={[0.25, 0.3, 0.015]} />
                            <meshStandardMaterial color={tab.color} roughness={0.6} emissive={tab.color} emissiveIntensity={0.1} />
                        </mesh>
                        {/* Mini textura de índice */}
                        <mesh position={[0.08, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <boxGeometry args={[0.04, 0.2, 0.005]} />
                            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} />
                        </mesh>
                    </group>
                ))}

                {/* --- Tapa Trasera de Cuero Sólido --- */}
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[2.3, 1.95, 0.08]} />
                    <meshStandardMaterial color="#020617" roughness={0.9} metalness={0.1} />
                </mesh>

                {/* --- TAPA DELANTERA ARTICULADA ("Viva") --- */}
                <group ref={coverRef} position={[-0.95, 0.3, 0]}>
                    <group position={[1.05, 0, 0]}>
                        {/* Bloque principal cuero negro mate */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[2.3, 1.95, 0.06]} />
                            <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.2} />
                        </mesh>

                        {/* Bisel/Costura perimetral hundida */}
                        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <boxGeometry args={[2.15, 1.8, 0.005]} />
                            <meshStandardMaterial color="#020617" />
                        </mesh>

                        {/* Placa metálica/Sello corporativo de Oro y Ónice */}
                        <group position={[0, 0.04, 0.2]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                            {/* Base dorada maciza */}
                            <mesh>
                                <boxGeometry args={[1.2, 0.7, 0.02]} />
                                <meshStandardMaterial color="#FBBF24" metalness={1} roughness={0.1} />
                            </mesh>
                            {/* Incrustación negra brillante/espejo */}
                            <mesh position={[0, 0, 0.012]}>
                                <boxGeometry args={[1.1, 0.6, 0.01]} />
                                <meshStandardMaterial color="#000000" roughness={0} metalness={0.9} />
                            </mesh>
                            {/* Fina línea dorada del logotipo central */}
                            <mesh position={[0, 0, 0.018]}>
                                <boxGeometry args={[0.8, 0.02, 0.005]} />
                                <meshStandardMaterial color="#FBBF24" metalness={1} roughness={0.2} />
                            </mesh>
                        </group>

                        {/* Cinta elástica divisoria/cierre magnético */}
                        <mesh position={[0.95, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                            <boxGeometry args={[0.15, 1.96, 0.02]} />
                            <meshStandardMaterial color="#000000" roughness={0.95} />
                        </mesh>
                    </group>
                </group>

                {/* --- Cinta de marcapáginas tela elegante colgando --- */}
                <mesh position={[0.3, 0.15, -1.05]} rotation={[-1.2, 0, -0.1]} castShadow>
                    <boxGeometry args={[0.12, 0.8, 0.004]} />
                    <meshStandardMaterial color="#E11D48" roughness={0.9} />
                </mesh>

                {/* --- Accesorios sobre la página abierta: Post-it y polaroid --- */}
                {/* Post-it cian plegado ligero */}
                <mesh position={[0.4, 0.32, 0.3]} rotation={[-Math.PI / 2, 0.05, 0.1]} castShadow>
                    <boxGeometry args={[0.4, 0.4, 0.005]} />
                    <meshStandardMaterial color="#67E8F9" roughness={0.7} emissive="#67E8F9" emissiveIntensity={0.1} />
                </mesh>
                {/* Micro foto/documento impreso de otro módulo */}
                <group position={[-0.2, 0.32, 0.5]} rotation={[-Math.PI / 2, 0, -0.2]} castShadow>
                    <mesh>
                        <boxGeometry args={[0.5, 0.6, 0.004]} />
                        <meshStandardMaterial color="#FFFFFF" roughness={1} />
                    </mesh>
                    {/* Zona oscura documento */}
                    <mesh position={[0, 0.05, 0.003]}>
                        <boxGeometry args={[0.4, 0.4, 0.001]} />
                        <meshStandardMaterial color="#64748B" />
                    </mesh>
                </group>
            </group>

            {/* ====== 4. ACCESORIOS DE LA MESA (Café y Bandeja) ====== */}
            <group position={[1.8, -1.15, -1.2]}>
                {/* Platillo cerámica mate */}
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.4, 0.3, 0.04, 32]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.8} />
                </mesh>
                {/* Taza de café cerámica blanca premium con bisel */}
                <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.26, 0.22, 0.46, 32]} />
                    <meshStandardMaterial color="#F1F5F9" roughness={0.2} metalness={0.1} />
                </mesh>
                {/* Café oscuro y reflectante y espumoso */}
                <mesh position={[0, 0.46, 0]}>
                    <cylinderGeometry args={[0.24, 0.24, 0.02, 32]} />
                    <meshStandardMaterial color="#2d170e" roughness={0.2} metalness={0.6} />
                </mesh>
                <mesh position={[0, 0.471, 0]}>
                    <ringGeometry args={[0.18, 0.24, 32]} rotation={[-Math.PI / 2, 0, 0]} />
                    <meshStandardMaterial color="#8d5524" roughness={0.8} />
                </mesh>
                {/* Asa estilizada de la taza */}
                <mesh position={[0.3, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.14, 0.03, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="#F1F5F9" roughness={0.2} metalness={0.1} />
                </mesh>
            </group>

            {/* ====== 5. BOLÍGRAFO PREMIUM MASTERPIECE ====== */}
            <group ref={penRef} position={[0.1, -0.1, 1.0]} rotation={[Math.PI / 2 - 0.05, 0, -0.4]}>
                {/* Cuerpo metálico pesado de Grafito pulido / Gunmetal */}
                <mesh castShadow>
                    <cylinderGeometry args={[0.045, 0.045, 2.4, 32]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Grip acolchado poligonal en punta  */}
                <mesh position={[0, -0.8, 0]}>
                    <cylinderGeometry args={[0.048, 0.048, 0.6, 16]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.9} />
                </mesh>

                {/* Aguja / Punta fuente de acero cromado */}
                <mesh position={[0, -1.25, 0]} castShadow>
                    <coneGeometry args={[0.045, 0.3, 32]} />
                    <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.05} />
                </mesh>

                {/* Clip largo y lujoso Dorado/Rose Gold */}
                <mesh position={[0.05, 0.7, 0]} castShadow>
                    <boxGeometry args={[0.02, 0.8, 0.03]} />
                    <meshStandardMaterial color="#FBBF24" metalness={1} roughness={0.15} />
                </mesh>

                {/* Remates de oro y botones de click */}
                <mesh position={[0, 1.25, 0]}>
                    <cylinderGeometry args={[0.045, 0.035, 0.1, 32]} />
                    <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 1.32, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.06, 16]} />
                    <meshStandardMaterial color="#0F172A" metalness={0.4} />
                </mesh>
            </group>

            {/* ====== 6. POLVO ESTELAR / ATMÓSFERA PROFESIONAL (GLOWS) ====== */}
            <group ref={glowRef}>
                {Array.from({ length: 40 }).map((_, i) => {
                    const phi = Math.acos(-1 + (2 * i) / 40);
                    const theta = Math.sqrt(40 * Math.PI) * phi;
                    const r = 3.5 + Math.random() * 1.5;
                    const cList = ["#38BDF8", "#FBBF24", "#A78BFA", "#10B981"]; // Colores temáticos app

                    return (
                        <mesh key={`sparkle-${i}`} position={[
                            r * Math.cos(theta) * Math.sin(phi),
                            r * Math.sin(theta) * Math.sin(phi),
                            r * Math.cos(phi)
                        ]}>
                            {/* Partículas minúsculas */}
                            <sphereGeometry args={[0.015 + Math.random() * 0.02, 8, 8]} />
                            <meshBasicMaterial color={cList[i % 4]} transparent opacity={0.4 + Math.random() * 0.4} />
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
            }, 6000); // 6s to appreciate details

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
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] overflow-hidden"
                >
                    {/* Elementos vivos de fondo refinados */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]"
                        />
                        <motion.div
                            animate={{
                                rotate: -360,
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px]"
                        />
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-full cursor-pointer bg-white/5 hover:bg-white/10 text-white/50 hover:text-white backdrop-blur-md transition-all z-50 text-sm flex items-center gap-2 border border-white/10 shadow-xl"
                    >
                        <span className="text-xs uppercase tracking-widest pl-2">Omitir</span>
                        <X size={16} />
                    </button>

                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 1.2, type: "spring", bounce: 0.3 }}
                        className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl p-8"
                    >
                        {/* Contenedor del Elemento 3D - Mucho más grande */}
                        <div className="relative w-80 h-80 md:w-[36rem] md:h-[36rem] drop-shadow-2xl mb-2 flex items-center justify-center">
                            <Canvas camera={{ position: [0, 4, 8], fov: 35 }}>
                                <ambientLight intensity={1.5} />
                                <directionalLight position={[10, 20, 10]} intensity={3} castShadow />
                                <directionalLight position={[-10, 5, -10]} intensity={2} color="#A78BFA" />
                                <pointLight position={[0, 8, 4]} intensity={2} color="#38BDF8" distance={20} />
                                <FloatingPlanner3D />
                            </Canvas>
                        </div>

                        {/* Título y ProgressBar Refinados */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.8 }}
                            className="text-center"
                        >
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mb-6 tracking-[0.2em] font-serif uppercase drop-shadow-md">
                                Unified Planner
                            </h1>

                            <div className="flex flex-col items-center text-white/40 space-y-4">
                                <p className="text-[10px] sm:text-xs font-medium tracking-[0.3em] uppercase">
                                    Cargando tu entorno de trabajo...
                                </p>

                                {/* Barra de progreso ultrafina y premium */}
                                <div className="w-64 h-[2px] bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ duration: 5.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 w-[200%]"
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
