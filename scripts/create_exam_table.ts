import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Creating ExamTemplate table...')

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
        "sections" TEXT NOT NULL,
        "formatting" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "ExamTemplate_pkey" PRIMARY KEY ("id")
      );
    `)
        console.log('ExamTemplate table created successfully.')
    } catch (e) {
        console.error('Error creating table:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
