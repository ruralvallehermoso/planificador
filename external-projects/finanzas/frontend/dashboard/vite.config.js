import { defineConfig } from 'vite';

// El build de producción se sirve desde public/static/finanzas/ en la app principal (Next.js),
// así que las rutas de los assets deben ir prefijadas con esa ruta. En dev (npm run dev) se sirve
// directamente desde la raíz del servidor de Vite, sin ese prefijo.
export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/static/finanzas/' : '/',
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist'
    }
}));
