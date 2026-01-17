/**
 * Google Apps Script para compresión de facturas con iLovePDF API.
 * 
 * INSTRUCCIONES:
 * 1. Copia TODO este contenido.
 * 2. Pega en el editor de Apps Script (Código.gs).
 * 3. Rellena PUBLIC_KEY y SECRET_KEY al principio.
 * 4. Ejecuta primero 'testConnection' para verificar.
 */

// --- CREDENCIALES (REEMPLAZA CON TUS CLAVES) ---
const PUBLIC_KEY = "PON_AQUI_TU_PUBLIC_KEY"; 
const SECRET_KEY = "PON_AQUI_TU_SECRET_KEY"; 

// --- CONFIGURACIÓN ---
const CLOUDMAILIN_ADDRESS = "tu-direccion@cloudmailin.net";
const LABEL_NAME = "Invoices";
const PROCESSED_LABEL = "Invoices/Processed";

// --- VALIDAR CONEXIÓN ---
function testConnection() {
  Logger.log("=== PRUEBA DE CONEXIÓN (/auth) ===");
  try {
    const token = getAuthToken();
    Logger.log("✅ Token recibido correctamente.");
    Logger.log("Token: " + token.substring(0, 30) + "...");
    
    // Prueba de uso del token
    const startResp = UrlFetchApp.fetch("https://api.ilovepdf.com/v1/start/compress", {
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    
    if (startResp.getResponseCode() === 200) {
      Logger.log("✅ API Funcional. Todo listo.");
    } else {
      Logger.log("❌ Error usando el token: " + startResp.getContentText());
    }
  } catch (e) {
    Logger.log("❌ FALLO GRAVE: " + e.toString());
  }
}

// --- OBTENER TOKEN DEL SERVIDOR ---
function getAuthToken() {
  const url = "https://api.ilovepdf.com/v1/auth";
  const payload = {
    "public_key": PUBLIC_KEY.trim(),
    "secret_key": SECRET_KEY.trim()
  };
  
  const options = {
    method: "post",
    payload: payload,
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error("Error en /auth (" + response.getResponseCode() + "): " + response.getContentText());
  }
  
  const json = JSON.parse(response.getContentText());
  return json.token;
}

// --- PROCESAMIENTO EMAILS ---
function processInbox() {
  const label = GmailApp.getUserLabelByName(LABEL_NAME);
  const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL) || GmailApp.createLabel(PROCESSED_LABEL);
  
  if (!label) { Logger.log("Label '" + LABEL_NAME + "' no encontrada"); return; }
  
  // Obtenemos el token UNA vez para todos los correos del lote
  let token;
  try {
    token = getAuthToken();
  } catch (e) {
    Logger.log("No se pudo obtener token: " + e.toString());
    return;
  }
  
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
            const compressedBlob = compressPdf(attachment, token);
            sendToCloudMailin(compressedBlob, attachment.getName(), message);
          } catch(e) {
            Logger.log("Error procesando fichero '" + attachment.getName() + "': " + e.toString());
          }
        }
      }
    }
    // Una vez procesados todos los adjuntos (o intentados), movemos el hilo
    thread.removeLabel(label);
    thread.addLabel(processedLabel);
  }
}

// --- LÓGICA DE COMPRESIÓN ---
function compressPdf(fileBlob, token) {
  // 1. Start Task
  const startResp = UrlFetchApp.fetch("https://api.ilovepdf.com/v1/start/compress", {
    headers: { "Authorization": "Bearer " + token }
  });
  const taskData = JSON.parse(startResp.getContentText());
  const server = taskData.server;
  const taskId = taskData.task;
  
  // 2. Upload
  const uploadResp = UrlFetchApp.fetch(`https://${server}/v1/upload`, {
    method: "post",
    headers: { "Authorization": "Bearer " + token },
    payload: { "task": taskId, "file": fileBlob }
  });
  const uploadData = JSON.parse(uploadResp.getContentText());
  const serverFilename = uploadData.server_filename;
  
  // 3. Process
  UrlFetchApp.fetch(`https://${server}/v1/process`, {
    method: "post",
    headers: { "Authorization": "Bearer " + token },
    payload: {
      "task": taskId,
      "tool": "compress",
      "files": JSON.stringify([{ "server_filename": serverFilename, "filename": fileBlob.getName() }]),
      "compression_level": "extreme"
    }
  });
  
  // 4. Download
  const downloadResp = UrlFetchApp.fetch(`https://${server}/v1/download/${taskId}`, {
    headers: { "Authorization": "Bearer " + token }
  });
  
  return downloadResp.getBlob().setName(fileBlob.getName());
}

// --- ENVÍO A CLOUDMAILIN ---
function sendToCloudMailin(blob, filename, msg) {
  Logger.log("Enviando a CloudMailin: " + filename + " (" + (blob.getSize()/1024).toFixed(2) + " KB)");
  GmailApp.sendEmail(CLOUDMAILIN_ADDRESS, "Fwd: " + msg.getSubject(), "Compressed Invoice via iLovePDF", {
    attachments: [blob],
    name: "Automator"
  });
}
