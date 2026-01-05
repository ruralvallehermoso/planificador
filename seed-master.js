const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const category = await prisma.category.upsert({
        where: { slug: 'master-unie' },
        update: {},
        create: {
            name: 'Master UNIE',
            slug: 'master-unie',
            description: 'Gestión académica del Máster de Profesorado',
            color: '#0ea5e9', // Sky blue
            icon: 'GraduationCap', // Lucide icon
        },
    });
    console.log('Category created:', category);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
