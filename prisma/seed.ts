
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const categories = [
        {
            name: 'Trabajo Formación Profesional',
            slug: 'fp-informatica',
            description: 'Gestión de clases, alumnos y tareas del profesorado de FP.',
            color: '#3B82F6', // Blue-500
            icon: 'GraduationCap'
        },
        {
            name: 'Master Profesorado UNIE',
            slug: 'master-unie',
            description: 'Tareas y seguimiento del Master de Profesorado.',
            color: '#8B5CF6', // Violet-500
            icon: 'BookOpen'
        },
        {
            name: 'Casa Rural',
            slug: 'casa-rural',
            description: 'Gestión de reservas, mantenimiento y administración.',
            color: '#10B981', // Emerald-500
            icon: 'Home'
        },
        {
            name: 'Gestión Hogar',
            slug: 'hogar',
            description: 'Tareas domésticas, compras y organización personal.',
            color: '#F59E0B', // Amber-500
            icon: 'Coffee'
        }
    ]

    console.log('Start seeding...')

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        })
        console.log(`Created category: ${category.name}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
