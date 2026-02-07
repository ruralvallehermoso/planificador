import { argon2id, argon2Verify } from 'hash-wasm'
import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string): Promise<string> => {
    const salt = new Uint8Array(16)
    crypto.getRandomValues(salt)

    // Argon2id configuration (OWASP recommendations)
    const hash = await argon2id({
        password,
        salt,
        parallelism: 1,
        iterations: 2,
        memorySize: 19456, // 19 MiB
        hashLength: 32,
        outputType: 'encoded',
    })

    return hash
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    // Detect legacy bcrypt hashes
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
        return bcrypt.compare(password, hash)
    }

    // Verify Argon2id hashes using hash-wasm's verify function
    try {
        const isValid = await argon2Verify({
            password,
            hash,
        })
        return isValid
    } catch (e) {
        console.error('[VERIFY PASSWORD] Error verifying Argon2 hash:', e)
        return false
    }
}
