import { argon2id } from 'hash-wasm';

export class VaultClient {
    private static readonly SALT_LENGTH = 16;
    private static readonly IV_LENGTH = 12; // AES-GCM standard
    private static readonly KEY_LENGTH = 32; // AES-256

    // Configuración Argon2id recomendada por OWASP
    private static readonly ARGON_CONFIG = {
        parallelism: 1,
        memorySize: 64 * 1024, // 64 MB
        iterations: 3,
        hashLength: 32, // 256 bits
        outputType: 'encoded' as const,
    };

    /**
     * Genera una clave maestra a partir del password del usuario usando Argon2id
     */
    static async deriveMasterKey(password: string, email: string): Promise<string> {
        // Usamos el email como "pepper" o contexto adicional, 
        // pero el salt real debe ser aleatorio y guardado (para el login) 
        // o determinista si no guardamos nada (para el vault).
        // Para el Vault, necesitamos regenerar la MISMA clave siempre.
        // Usaremos un salt determinista basado en el email para poder regenerar la clave.
        // NOTA: En un sistema ideal, el salt se guarda en DB, pero aquí simplificamos 
        // para no depender de DB para derivar la clave antes de desencriptar la DB.

        // Salt determinista de 16 bytes a partir del email
        const salt = new TextEncoder().encode(email.padEnd(16, '0').slice(0, 16));

        const key = await argon2id({
            password,
            salt,
            parallelism: 1,
            memorySize: 64 * 1024,
            iterations: 3,
            hashLength: 32,
            outputType: 'hex',
        });

        return key;
    }

    /**
     * Genera un hash de validación (SHA-256) de la clave maestra
     * Esto permite al servidor verificar si la clave es correcta sin conocer la clave real.
     */
    static async deriveValidator(masterKeyHex: string): Promise<string> {
        const keyBuffer = this.hexToArrayBuffer(masterKeyHex);
        const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
        return this.arrayBufferToHex(hashBuffer);
    }

    /**
     * Encripta datos usando AES-256-GCM
     */
    static async encrypt(data: string, keyHex: string): Promise<{ active: string, iv: string }> {
        const key = await this.importKey(keyHex);
        // Generamos un IV aleatorio para cada encriptación
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
        const encodedData = new TextEncoder().encode(data);

        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            encodedData
        );

        return {
            active: this.arrayBufferToHex(encryptedContent),
            iv: this.arrayBufferToHex(iv.buffer as ArrayBuffer)
        };
    }

    /**
     * Desencripta datos usando AES-256-GCM
     */
    static async decrypt(encryptedHex: string, ivHex: string, keyHex: string): Promise<string> {
        try {
            const key = await this.importKey(keyHex);
            const iv = this.hexToArrayBuffer(ivHex);
            const encryptedData = this.hexToArrayBuffer(encryptedHex);

            const decryptedContent = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                encryptedData
            );

            return new TextDecoder().decode(decryptedContent);
        } catch (e) {
            console.error("Decryption failed", e);
            throw new Error("Failed to decrypt data. Invalid key or corrupted data.");
        }
    }

    // --- Helpers ---

    private static async importKey(keyHex: string): Promise<CryptoKey> {
        const keyBuffer = this.hexToArrayBuffer(keyHex);
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            'AES-GCM',
            false, // no exportable
            ['encrypt', 'decrypt']
        );
    }

    private static arrayBufferToHex(buffer: ArrayBuffer): string {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    private static hexToArrayBuffer(hex: string): ArrayBuffer {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes.buffer;
    }
}
