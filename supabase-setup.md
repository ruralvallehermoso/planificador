# Supabase Setup Guide

## 1. Crear cuenta y proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto:
   - **Nombre**: `planificador-pro`
   - **Database Password**: genera una contraseña segura (guárdala)
   - **Region**: Europe (Frankfurt) - `eu-central-1`
3. Espera ~2 minutos a que se provisione

## 2. Obtener Connection Strings

1. En tu proyecto, ve a **Settings** → **Database**
2. Scroll hasta **Connection string**
3. Selecciona pestaña **URI**
4. Copia las dos URLs:

**Transaction mode (para la app)**:
```
postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Session mode (para migraciones)**:
```
postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

## 3. Configurar .env

Edita tu archivo `.env`:
```bash
DATABASE_URL="[Transaction mode URL]"
DIRECT_URL="[Session mode URL]"
```

## 4. Ejecutar migración

```bash
npx prisma migrate dev --name init
```

Esto creará todas las tablas en Supabase.
