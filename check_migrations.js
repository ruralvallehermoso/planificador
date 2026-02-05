const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const migrations = await prisma.$queryRaw`SELECT * FROM "_prisma_migrations" ORDER BY started_at ASC`;
        console.log("Applied Migrations:", migrations);
    } catch (e) {
        console.error("Error querying migrations:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
