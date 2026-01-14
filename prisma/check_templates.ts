
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Exam Templates in DB...')

    const count = await prisma.examTemplate.count()
    console.log(`📊 Total Templates found: ${count}`)

    const templates = await prisma.examTemplate.findMany({
        select: { id: true, name: true, createdAt: true }
    })

    console.log('📝 Template List:')
    templates.forEach(t => {
        console.log(` - [${t.id}] ${t.name} (${t.createdAt.toISOString()})`)
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
