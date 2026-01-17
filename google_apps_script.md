# Google Apps Script: iLovePDF (Versión Definitiva)

Este script implementa la especificación EXACTA de la documentación:
1.  Usa JWT "Self-signed".
2.  Incluye los campos obligatorios: `iss`, `iat`, `exp` y **`nbf`** (Not Before).
3.  Usa codificación Base64URL manual para evitar errores de librerías.

## Instrucciones
1.  Borra `Código.gs` y pega esto.
2.  Rellena `PUBLIC_KEY` y `SECRET_KEY`.
3.  Ejecuta `testConnection` para verificar.

```javascript
// --- CREDENCIALES ---
// ¡CUIDADO CON LOS ESPACIOS AL COPIAR!
const PUBLIC_KEY = "PON_AQUI_TU_PUBLIC_KEY"; 
const SECRET_KEY = "PON_AQUI_TU_SECRET_KEY"; 

const CLOUDMAILIN_ADDRESS = "tu-direccion@cloudmailin.net";
const LABEL_NAME = "Invoices";
const PROCESSED_LABEL = "Invoices/Processed";

// --- TEST DE CONEXIÓN ---
function testConnection() {
  Logger.log("=== DIAGNÓSTICO DE CONEXIÓN ===");
  
  if (PUBLIC_KEY.includes("PON_AQUI") || SECRET_KEY.includes("PON_AQUI")) {
    Logger.log("❌ ERROR: Faltan las claves.");
    return;
  }

  const token = getJWT();
  Logger.log("Token Generado: " + token.substring(0, 50) + "...");
  
  try {
    const response = UrlFetchApp.fetch("https://api.ilovepdf.com/v1/start/compress", {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    
    Logger.log("Status Code: " + response.getResponseCode());
    Logger.log("Respuesta: " + response.getContentText());
    
    if (response.getResponseCode() === 200) {
      Logger.log("✅ ¡CONEXIÓN EXITOSA! Las claves funcionan.");
    } else {
      Logger.log("❌ FALLO DE AUTENTICACIÓN. Revisa:");
      Logger.log("1. Que Public y Secret sean del MISMO proyecto.");
      Logger.log("2. Que no haya espacios al principio/final.");
      Logger.log("3. Regenera la Secret Key en el panel si es necesario.");
    }
  } catch (e) {
    Logger.log("❌ ERROR DE RED: " + e.toString());
  }
}

// --- PROCESAMIENTO ---
function processInbox() {
  const label = GmailApp.getUserLabelByName(LABEL_NAME);
  const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL) || GmailApp.createLabel(PROCESSED_LABEL);
  
  if (!label) { Logger.log("Etiqueta 'Invoices' no encontrada"); return; }
  
  const threads = label.getThreads(0, 5);
  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const message of messages) {
      if (message.isInTrash()) continue;
      
      const attachments = message.getAttachments();
      for (const attachment of attachments) {
        if (attachment.getContentType() === "application/pdf") {
          Logger.log("Procesando: " + attachment.getName());
          try {
            const compressed = compressPdf(attachment);
            if (compressed) {
              sendToCloudMailin(compressed, attachment.getName(), message);
            }
          } catch(e) {
            Logger.log("❌ Error con archivo: " + e.toString());
          }
        }
      }
    }
    thread.removeLabel(label);
    thread.addLabel(processedLabel);
  }
}

function compressPdf(fileBlob) {
  const token = getJWT();
  const server = startTask(token, "compress");
  
  const uploadData = uploadFile(token, server, fileBlob);
  processFiles(token, server, uploadData.server_filename);
  
  return downloadFile(token, server);
}

// --- API CLIENT ---
function startTask(token, tool) {
  const resp = UrlFetchApp.fetch(`https://api.ilovepdf.com/v1/start/${tool}`, {
    headers: { "Authorization": "Bearer " + token }
  });
  const json = JSON.parse(resp.getContentText());
  return { server: json.server, task: json.task };
}

function uploadFile(token, serverInfo, fileBlob) {
  const resp = UrlFetchApp.fetch(`https://${serverInfo.server}/v1/upload`, {
    method: "post",
    headers: { "Authorization": "Bearer " + token },
    payload: {
      "task": serverInfo.task,
      "file": fileBlob
    }
  });
  return JSON.parse(resp.getContentText());
}

function processFiles(token, serverInfo, serverFilename) {
  UrlFetchApp.fetch(`https://${serverInfo.server}/v1/process`, {
    method: "post",
    headers: { "Authorization": "Bearer " + token },
    payload: {
      "task": serverInfo.task,
      "tool": "compress",
      "files": JSON.stringify([{ "server_filename": serverFilename, "filename": "file.pdf" }]),
      "compression_level": "extreme"
    }
  });
}

function downloadFile(token, serverInfo) {
  const resp = UrlFetchApp.fetch(`https://${serverInfo.server}/v1/download/${serverInfo.task}`, {
    headers: { "Authorization": "Bearer " + token }
  });
  return resp.getBlob();
}

function sendToCloudMailin(blob, name, msg) {
  GmailApp.sendEmail(CLOUDMAILIN_ADDRESS, "Fwd: " + msg.getSubject(), "Compressed Invoice", {
    attachments: [blob.setName(name)],
    name: "Automator"
  });
}

// --- JWT GENERATION (MANUAL & ROBUSTO) ---
function getJWT() {
  const pub = PUBLIC_KEY.trim();
  const sec = SECRET_KEY.trim();
  
  const header = JSON.stringify({ "alg": "HS256", "typ": "JWT" });
  
  // FECHAS UTC (Segundos)
  const now = Math.floor(new Date().getTime() / 1000); // UTC timestamp
  
  const payload = JSON.stringify({
    "iss": pub,               // Issuer: Public Key
    "iat": now,               // Issued At
    "nbf": now,               // Not Before (OBLIGATORIO SEGÚN DOCS)
    "exp": now + 7200,        // Expiration (2 horas)
    "jti": Utilities.getUuid() // Unique ID
  });

  const base64Url = (str) => {
    return Utilities.base64Encode(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };
  
  const encodedHeader = base64Url(header);
  const encodedPayload = base64Url(payload);
  const unsigned = encodedHeader + "." + encodedPayload;
  
  const signature = Utilities.computeHmacSha256Signature(unsigned, sec);
  
  // Encode signature MANUALMENTE
  // computeHmacSha256Signature devuelve 'Byte[]' (signed integers)
  // base64Encode lo maneja correctamente
  const encodedSignature = Utilities.base64Encode(signature)
      .replace(/\+/g, '-') // + -> -
      .replace(/\//g, '_') // / -> _
      .replace(/=+$/, ''); // Remove padding
      
  return unsigned + "." + encodedSignature;
}
```
