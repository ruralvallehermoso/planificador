const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Checking prisma.project...')
    if (prisma.project) {
        console.log('prisma.project is defined')
        const count = await prisma.project.count()
        console.log('Project count:', count)
    } else {
        console.error('prisma.project is UNDEFINED')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
