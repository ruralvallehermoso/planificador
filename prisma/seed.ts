import bcrypt from 'bcryptjs'
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@planificador.local'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    const passwordHash = await bcrypt.hash(adminPassword, 12)

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
            role: 'ADMIN',
            name: 'Administrador',
        },
        create: {
            email: adminEmail,
            passwordHash,
            name: 'Administrador',
            role: 'ADMIN',
            canAccessCasaRural: true,
            canAccessFinanzas: true,
            canAccessFpInformatica: true,
            canAccessHogar: true,
            canAccessMasterUnie: true,
        },
    })

    console.log(`✅ Admin user created/updated: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Password: ${adminPassword}`)

    // Create demo users for each role
    const demoUsers = [
        { email: 'owner@planificador.local', name: 'Propietario', role: 'OWNER' as const, password: 'owner123' },
        { email: 'teacher@planificador.local', name: 'Profesor', role: 'TEACHER' as const, password: 'teacher123' },
        { email: 'family@planificador.local', name: 'Familia', role: 'FAMILY' as const, password: 'family123' },
    ]

    for (const demoUser of demoUsers) {
        const hash = await bcrypt.hash(demoUser.password, 12)
        const user = await prisma.user.upsert({
            where: { email: demoUser.email },
            update: {
                passwordHash: hash,
                role: demoUser.role,
                name: demoUser.name,
            },
            create: {
                email: demoUser.email,
                passwordHash: hash,
                name: demoUser.name,
                role: demoUser.role,
            },
        })
        console.log(`✅ Demo user created/updated: ${user.email} (${user.role})`)
    }

    // Seed categories if they don't exist
    const categories = [
        { name: 'Casa Rural', slug: 'casa-rural', color: '#10b981', icon: 'Home', description: 'Gestión de reservas y contabilidad' },
        { name: 'Finanzas', slug: 'finanzas', color: '#3b82f6', icon: 'TrendingUp', description: 'Simulador financiero y portfolio' },
        { name: 'FP Informática', slug: 'fp-informatica', color: '#8b5cf6', icon: 'GraduationCap', description: 'Gestión de proyectos y alumnos' },
        { name: 'Hogar', slug: 'hogar', color: '#f97316', icon: 'HomeIcon', description: 'Calendario y tareas del hogar' },
        { name: 'Máster UNIE', slug: 'master-unie', color: '#06b6d4', icon: 'BookOpen', description: 'Seguimiento académico' },
    ]

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: cat,
            create: cat,
        })
    }
    console.log('✅ Categories seeded')

    console.log('\n🎉 Seeding complete!')
    console.log('\n📋 Demo accounts:')
    console.log('   admin@planificador.local / admin123 (ADMIN - all access)')
    console.log('   owner@planificador.local / owner123 (OWNER - Casa Rural, Finanzas, Hogar)')
    console.log('   teacher@planificador.local / teacher123 (TEACHER - FP Informática, Máster UNIE)')
    console.log('   family@planificador.local / family123 (FAMILY - Hogar only)')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
