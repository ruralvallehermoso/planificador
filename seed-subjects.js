const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const subjects = [
        { name: 'Aprendizaje y Desarrollo de la Personalidad', code: 'ADP', credits: 6, semester: 1, professor: 'Dr. García' },
        { name: 'Procesos y Contextos Educativos', code: 'PCE', credits: 6, semester: 1, professor: 'Dra. Martínez' },
        { name: 'Sociedad, Familia y Educación', code: 'SFE', credits: 6, semester: 1, professor: 'Dr. López' },
        { name: 'Innovación Docente', code: 'ID', credits: 4, semester: 2, professor: 'Dr. Ruiz' },
        { name: 'Investigación Educativa', code: 'IE', credits: 4, semester: 2, professor: 'Dra. Sánchez' },
        { name: 'Prácticum I', code: 'PR1', credits: 8, semester: 2, status: 'ENROLLED' },
        { name: 'Trabajo Fin de Máster', code: 'TFM', credits: 12, semester: 2, status: 'ENROLLED' },
    ];

    console.log('Seeding subjects...');

    for (const s of subjects) {
        const subject = await prisma.subject.create({
            data: {
                name: s.name,
                code: s.code,
                credits: s.credits,
                semester: s.semester,
                professor: s.professor,
                status: s.status || 'ENROLLED',
            },
        });
        console.log(`Created subject: ${subject.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
