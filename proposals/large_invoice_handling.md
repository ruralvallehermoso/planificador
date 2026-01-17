# Propuesta: Gestión de Facturas Grandes (Alternativa Gratuita)

## El Problema: Límite de Vercel
El problema raíz no es solo "comprimir" el archivo, sino **recibirlo**.
Tu aplicación está alojada en **Vercel**, que tiene un **límite estricto de 4.5 MB** para el cuerpo de las peticiones (Webhooks).
Si CloudMailin (versión Free) intenta enviar un PDF de 6 MB, Vercel **rechaza la conexión inmediatamente** (Error 413 Payload Too Large) antes de que tu código pueda siquiera intentar comprimirlo.

Por tanto, necesitamos una estrategia para que el archivo **no entre directamente** por el Webhook de Vercel.

---

## Solución Recomendada: Inngest + Gmail API (Estrategia "Pull")

En lugar de esperar a que nos "empujen" (Push) el archivo, haremos que Inngest vaya a "buscarlo" (Pull) directamente a tu correo.

### Arquitectura Propuesta
1.  **Recepción**: Configuras un filtro en Gmail para que las facturas vayan a una etiqueta (ej: `Invoices`).
2.  **Trigger**: Creamos una función en Inngest tipo **CRON** (ej: cada 1 hora).
3.  **Proceso**:
    *   Inngest se despierta y consulta la **API de Gmail** (usando tu proyecto de Google Cloud existente).
    *   Lista los correos no leídos en la etiqueta `Invoices`.
    *   **Descarga el adjunto**: Al ser una petición de salida (*nosotros* llamamos a Google), **NO aplica el límite de 4.5 MB de Vercel**. Podemos bajar archivos de 20MB o más.
    *   Envía el contenido a **Gemini** (igual que ahora).
    *   Marca el correo como leído/archivado.

### Ventajas
*   ✅ **100% Gratis**: Usa la cuota gratuita de Gmail/Google Cloud API.
*   ✅ **Sin límites de tamaño**: Bypass total al límite de Vercel.
*   ✅ **Más seguro**: No exponemos un Webhook público; autenticamos directamente con Google.
*   ✅ **Centralizado**: Todo el código queda en tu app (sin configurar Integromat/Zapier externos).

### Requisitos Técnicos
1.  Habilitar **Gmail API** en tu Google Cloud Console (donde activaste Gemini).
2.  Generar credenciales OAuth (te guiaré para obtener el *Refresh Token*).

---

## Alternativa 2: Middleware "No-Code" (Make.com)

Si prefieres no tocar código ni APIs de Google:
usar el plan gratuito de **Make.com** (antes Integromat).
*   **Flow**: Email (Make) -> Upload a Google Drive (Make) -> Llamada HTTP a tu Webhook con el Link (Make).
*   **Contras**: Dependes de otro servicio externo y sus límites gratuitos (1000 operaciones/mes).

---

## ¿Cómo procedemos?
Recomiendo la **Solución 1 (Gmail API)** porque es más robusta y "dueña" de sus datos.
Si estás de acuerdo, el siguiente paso es que habilites la API de Gmail en tu consola de Google.
