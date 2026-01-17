# Integración de Lógica de Compresión (Client-Side)

## Análisis del Código Proporcionado
El código proporcionado es un **Compresor Client-Side** muy potente que usa:
1.  `pdf.js` para renderizar el PDF en un elemento `<canvas>` (HTML5).
2.  `canvas.toDataURL()` para convertir ese renderizado en imágenes JPEG comprimidas (Rasterización).
3.  `pdf-lib` para volver a empaquetar esas imágenes en un PDF nuevo.

## El Desafío Técnico
Esta lógica tiene una dependencia crítica: **El Navegador (Browser)**.
Requiere acceso al DOM (`document`, `window`), al motor de renderizado gráfico (`canvas`) y a la API gráfica del sistema.

**Por qué no funciona automáticamente en Gmail (Apps Script) o Node.js puro:**
*   **Gmail Apps Script**: Es un entorno V8 servidor simple. No tiene pantalla, ni `canvas`, ni DOM. No puede "pintar" el PDF para comprimirlo como imagen.
*   **CloudMailin**: Solo recibe y reenvía, no ejecuta lógica visual.

---

## Alternativas Propuestas

### Opción A: "Herramienta de Ingesta Manual" en Planificador (Recomendada)
Dado que el código necesita un navegador, ¡usémoslo donde ya tenemos uno! Integraremos esta herramienta directamente en tu aplicación web.

**Flujo:**
1.  Recibes un correo con aviso de "Falló por tamaño" (o lo detectas tú).
2.  Entras a tu Planificador -> Sección **"Subida Manual / Compresor"**.
3.  Arrastras el PDF original.
4.  La web ejecuta **tu código** en tu navegador (comprimiendo de 10MB a 1MB, por ejemplo).
5.  Pulsas **"Enviar a Contabilidad"**.
    *   La web envía el PDF ya comprimido directamente al sistema (Inngest), saltándose el límite de recepción de correos.

*   ✅ **Usa exactamente tu código**: Aprovecha la potencia de tu CPU para comprimir gratis.
*   ✅ **Sin Servidores Extra**: No necesitas montar un Puppeteer/Selenium externo.
*   ✅ **Solución Definitiva**: Sirve para cualquier archivo que recibas por cualquier vía (WhatsApp, descarga directa, etc.).

### Opción B: Servicio de "Compresión Headless" (Compleja)
Para hacerlo automático (sin que tú toques nada), necesitaríamos un servidor que simule ser un navegador (Headless Chrome).
*   **Arquitectura**: Gmail -> Reenvío a Servicio X (Fly.io/Render corriendo Puppeteer) -> Ejecuta tu JS -> Reenvía a CloudMailin.
*   **Coste**: Requiere hosting capaz de ejecutar Chrome (más memoria RAM). Probablemente no entre en capas gratuitas estables.

---

## Recomendación
Recomiendo la **Opción A**.
Aunque no es "100% automático" (requiere que arrastres el archivo), es la única forma robusta y gratuita de usar **este algoritmo específico de rasterización** sin montar infraestructura compleja de servidores.

Además, podemos añadir un botón "Magic Upload" en esa pantalla que, tras comprimir, inyecte el gasto directamente en la base de datos simulando el evento de Inngest.
