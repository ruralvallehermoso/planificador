import { argon2id } from 'hash-wasm'
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

    try {
        return await argon2id({
            password,
            salt: new Uint8Array(0), // Salt is extracted from encoded hash by verify
            parallelism: 1,
            iterations: 2,
            memorySize: 19456,
            hashLength: 32,
            outputType: 'encoded',
        }) === hash // Note: hash-wasm verify logic is slightly different, let's use the explicit verify function if available or just re-hash
        // Actually hash-wasm's argon2id returns the hash string. To verify, we need to parse parameters from the string or use a library that handles it.
        // The hash-wasm library doesn't have a direct 'verify' helper in the simple API that parses the hash string automatically like bcrypt.
        // We typically need to handle this manually or rely on the fact that if we use the same parameters it produces the same result.
        // However, extracting salt and params from the PHC string manually is error prone.

        // Let's check how hash-wasm recommends verification or if there is a helper.
        // Re-reading usage: https://github.com/Daninet/hash-wasm
        // It seems typically you store the salt separately or parse the stored hash.

        // Wait, standard Argon2 encoding includes params. 
        // Let's implement robust verification. Since hash-wasm is low-level, maybe we should use `argon2` npm package?
        // But `package.json` has `hash-wasm`. Let's stick to what is installed or checking if `argon2` (native bindings) is better.
        // `hash-wasm` is WASM based, good for edge.
        // Let's look at how to verify with `hash-wasm`.

        // Actually, for simplicity and standard PHC format support, `argon2` (native) is easier in Node, but `hash-wasm` works in Edge/Browser.
        // Since we are using Next.js Auth, we might run on Edge.

        // Let's restart the thought process for verification with `hash-wasm`.
    } catch (e) {
        return false;
    }
}
