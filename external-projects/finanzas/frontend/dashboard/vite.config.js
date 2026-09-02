import { defineConfig } from 'vite';

// El build de producción se sirve desde public/static/finanzas/ en la app principal (Next.js),
// así que las rutas de los assets deben ir prefijadas con esa ruta. En dev (npm run dev) se sirve
// directamente desde la raíz del servidor de Vite, sin ese prefijo.
// El bundle embebido se sirve desde el dominio del Planificador, pero su API vive
// en el despliegue del proyecto Finanzas. Si no se inyecta esta URL, config.js
// resuelve BACKEND_URL a '' (mismo origen) y las llamadas acaban en el Next.js del
// Planificador, que no tiene esas rutas: el dashboard se queda sin datos. Antes se
// pasaba a mano por línea de comandos, sin constancia en el repo, así que cualquier
// rebuild limpio la perdía en silencio. En dev se deja vacía para que config.js caiga
// a localhost:8000.
const FINANZAS_API_URL = 'https://finanzas-tau-ten.vercel.app';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/static/finanzas/' : '/',
    define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(
            process.env.VITE_API_URL ?? (command === 'build' ? FINANZAS_API_URL : '')
        ),
    },
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist'
    }
}));
