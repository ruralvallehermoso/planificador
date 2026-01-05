const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting recovery seed for Casa Rural...');

    const casaRural = await prisma.category.findUnique({
        where: { slug: 'casa-rural' }
    });

    if (!casaRural) {
        console.error('Category Casa Rural not found!');
        return;
    }

    const tasks = [
        { title: 'Revisar reservas fin de semana', status: 'IN_PROGRESS', priority: 'HIGH' },
        { title: 'Mantenimiento piscina', status: 'TODO', priority: 'MEDIUM' },
        { title: 'Jardinería y poda', status: 'TODO', priority: 'LOW' },
        { title: 'Limpieza general planta baja', status: 'DONE', priority: 'HIGH' },
        { title: 'Revisión caldera temporada invierno', status: 'IN_PROGRESS', priority: 'HIGH' },
        { title: 'Contabilidad trimestral', status: 'TODO', priority: 'MEDIUM' },
        { title: 'Actualizar web con ofertas de Navidad', status: 'DONE', priority: 'MEDIUM' },
        { title: 'Inventario de leña', status: 'TODO', priority: 'LOW' },
    ];

    for (const task of tasks) {
        await prisma.actionItem.create({
            data: {
                title: task.title,
                status: task.status,
                priority: task.priority,
                categoryId: casaRural.id,
            }
        });
        console.log(`Created task: ${task.title}`);
    }

    console.log('Recovery seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
