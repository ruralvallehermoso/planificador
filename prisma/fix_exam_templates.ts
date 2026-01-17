
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🛠 Creating ExamTemplate table manually...')

    try {
        await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ExamTemplate" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "logoUrl" TEXT,
            "cycle" TEXT,
            "course" TEXT,
            "evaluation" TEXT,
            "duration" TEXT,
            "date" TEXT,
            "subject" TEXT,
            "raEvaluated" TEXT,
            "description" TEXT,
            "part1Percentage" TEXT,
            "part2Percentage" TEXT,
            "sections" TEXT NOT NULL,
            "formatting" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "ExamTemplate_pkey" PRIMARY KEY ("id")
        );
      `)
        console.log('✅ ExamTemplate table created (if not exists).')
    } catch (e) {
        console.error('❌ Error creating table:', e)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
