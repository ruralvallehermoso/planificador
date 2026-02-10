/**
 * Google Apps Script iLovePDF - Versión Debug
 * 
 * CAMBIOS:
 * 1. Logs detallados del server_filename.
 * 2. Intento de 'Process' enviando JSON puro (Content-Type: application/json).
 * 3. Captura exhaustiva de errores.
 */

const PUBLIC_KEY = "PON_AQUI_TU_PUBLIC_KEY"; 
const SECRET_KEY = "PON_AQUI_TU_SECRET_KEY"; 
const _ADDRESS = "f7360bbf8c3dab326297@.net";
const LABEL_NAME = "Invoices";
const PROCESSED_LABEL = "Invoices/Processed";

// --- TEST MANUAL ---
function testConnection() {
  Logger.log("=== DIAGNÓSTICO RÁPIDO ===");
  try {
    const token = getAuthToken();
    Logger.log("✅ Auth Token OK: " + token.substring(0, 15) + "...");
    
    // Start
    const startResp = UrlFetchApp.fetch("https://api.ilovepdf.com/v1/start/compress", {
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    Logger.log("Start Response: " + startResp.getContentText());
    
  } catch (e) {
    Logger.log("❌ Error fatal: " + e.toString());
  }
}


function processInbox() {
  const label = GmailApp.getUserLabelByName(LABEL_NAME);
  let processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL);
  if (!processedLabel) processedLabel = GmailApp.createLabel(PROCESSED_LABEL);
  
  if (!label) { Logger.log("Label no encontrada"); return; }
  
  let token;
  try {
    token = getAuthToken();
  } catch (e) {
    Logger.log("⛔ Error de Auth: " + e.toString());
    return;
  }
  
  const threads = label.getThreads(0, 5);
  Logger.log("Procesando " + threads.length + " hilos.");

  for (const thread of threads) {
    const messages = thread.getMessages();
    // OPCIÓN A: Procesar SOLO el último mensaje del hilo (evita duplicados en conversaciones)
    const message = messages[messages.length - 1]; 
    
    // if (message.isInTrash()) continue; // Comentado para asegurar que se procesa aunque haya borradores
    
    const attachments = message.getAttachments();
    for (const attachment of attachments) {
      if (attachment.getContentType() === "application/pdf") {
        Logger.log(">>> Procesando (Último mensaje): " + attachment.getName() + " (" + (attachment.getSize()/1024).toFixed(0) + " KB)");
        
        try {
          const compressedBlob = compressPdf(attachment, token);
          if (compressedBlob) {
            sendToCloudMailin(compressedBlob, attachment.getName(), message);
          }
        } catch(e) {
          Logger.log("❌ LLAMADA FALLIDA a compressPdf: " + e.message);
        }
      }
    }
    
    // --- FINALIZAR PROCESAMIENTO DEL HILO ---
    // Re-obtenemos el hilo para evitar problemas de sincronización tras operaciones largas
    try {
      const freshThread = GmailApp.getThreadById(thread.getId());
      
      Logger.log("Intentando mover hilo (ID: " + freshThread.getId() + ") a Processed...");
      
      freshThread.removeLabel(label);
      freshThread.addLabel(processedLabel);
      
      // Opcional: Archivar para limpiar inbox
      // freshThread.moveToArchive();
      
      Logger.log("✅ Hilo movido y etiqueta 'Invoices' eliminada.");
      
    } catch (e) {
      Logger.log("❌ ERROR CRÍTICO al mover etiquetas: " + e.toString());
    }
  }
}

function compressPdf(fileBlob, token) {
  // 1. START
  const startUrl = "https://api.ilovepdf.com/v1/start/compress";
  const startJson = fetchJson(startUrl, { headers: { "Authorization": "Bearer " + token } });
  
  const server = startJson.server;
  const taskId = startJson.task;
  Logger.log(`   Task: ${taskId} | Server: ${server}`);
  
  // 2. UPLOAD
  const uploadUrl = `https://${server}/v1/upload`;
  const uploadPayload = {
    "task": taskId,
    "file": fileBlob
  };
  
  // Nota: UrlFetchApp con payload objeto que tiene Blob -> Multipart automáticamente.
  const uploadJson = fetchJson(uploadUrl, {
    method: "post",
    headers: { "Authorization": "Bearer " + token },
    payload: uploadPayload
  });
  
  const serverFilename = uploadJson.server_filename;
  Logger.log(`   Upload OK. Filename reportado: ${serverFilename}`);
  
  // 3. PROCESS (CAMBIO A JSON)
  const processUrl = `https://${server}/v1/process`;
  
  // Importante: Al enviar JSON, 'files' es un Array real, no un string.
  const processBody = {
    "task": taskId,
    "tool": "compress",
    "files": [{ 
      "server_filename": serverFilename, 
      "filename": fileBlob.getName() 
    }],
    "compression_level": "extreme" 
  };
  
  const processResp = UrlFetchApp.fetch(processUrl, {
    method: "post",
    headers: { 
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json" // <-- FORZAMOS JSON
    },
    payload: JSON.stringify(processBody),
    muteHttpExceptions: true // Para ver el error completo si falla
  });
  
  if (processResp.getResponseCode() !== 200) {
    Logger.log("❌ ERROR EN PROCESS: " + processResp.getContentText());
    throw new Error("Process Failed: " + processResp.getContentText());
  }
  
  // 4. DOWNLOAD
  const downloadUrl = `https://${server}/v1/download/${taskId}`;
  const response = UrlFetchApp.fetch(downloadUrl, {
    headers: { "Authorization": "Bearer " + token },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    Logger.log("❌ ERROR EN DOWNLOAD: " + response.getContentText());
    throw new Error("Download Failed");
  }
  
  const newBlob = response.getBlob();
  Logger.log("✅ FIN: Compresión exitosa. Nuevo tamaño: " + (newBlob.getBytes().length / 1024).toFixed(0) + " KB");
  
  return newBlob.setName(fileBlob.getName());
}

function sendToCloudMailin(blob, filename, msg) {
  Logger.log("   Enviando email a CloudMailin...");
  
  // Enviamos el correo (esto crea un mensaje en Sent)
  GmailApp.sendEmail(CLOUDMAILIN_ADDRESS, "Fwd: " + msg.getSubject(), "Compressed Invoice", {
    attachments: [blob],
    name: "Automator"
  });
  
  // TRUCO: Buscar el mensaje enviado para borrarlo/archivarlo y que no moleste
  // Esperamos un momento para asegurar que Gmail lo ha indexado
  Utilities.sleep(2000); 
  const sentThreads = GmailApp.search("to:" + CLOUDMAILIN_ADDRESS + " subject:\"Fwd: " + msg.getSubject() + "\"", 0, 1);
  
  if (sentThreads.length > 0) {
     Logger.log("   Eliminando copia del correo enviado a CloudMailin...");
     // Opción A: Mover a la papelera (recomendado para que no salga en búsquedas)
     sentThreads[0].moveToTrash();
     
     // Opción B: Archivar (sigue saliendo si buscas)
     // sentThreads[0].moveToArchive();
  }
}

function getAuthToken() {
  const url = "https://api.ilovepdf.com/v1/auth";
  const payload = {
    "public_key": PUBLIC_KEY.trim(),
    "secret_key": SECRET_KEY.trim()
  };
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    payload: payload,
    muteHttpExceptions: true // Evitamos que getAuthToken explote sin log
  });
  
  if (response.getResponseCode() !== 200) {
    throw new Error("Auth Error: " + response.getContentText());
  }
  
  return JSON.parse(response.getContentText()).token;
}

function fetchJson(url, options) {
  // Helper que lanza error si falla, pero logueando antes
  options.muteHttpExceptions = true;
  const resp = UrlFetchApp.fetch(url, options);
  if (resp.getResponseCode() !== 200) {
    Logger.log("❌ Error Fetch (" + url + "): " + resp.getContentText());
    throw new Error("API Fail: " + resp.getContentText());
  }
  return JSON.parse(resp.getContentText());
}
```
