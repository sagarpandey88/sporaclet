"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Seed Sports
    const sports = await Promise.all([
        prisma.sport.upsert({
            where: { name: 'football' },
            update: {},
            create: {
                name: 'football',
                displayName: 'Football',
                hasTeams: true,
                playerPositions: [
                    'Goalkeeper',
                    'Defender',
                    'Midfielder',
                    'Forward',
                ],
                visualizationType: 'field',
            },
        }),
        prisma.sport.upsert({
            where: { name: 'basketball' },
            update: {},
            create: {
                name: 'basketball',
                displayName: 'Basketball',
                hasTeams: true,
                playerPositions: [
                    'Point Guard',
                    'Shooting Guard',
                    'Small Forward',
                    'Power Forward',
                    'Center',
                ],
                visualizationType: 'court',
            },
        }),
        prisma.sport.upsert({
            where: { name: 'cricket' },
            update: {},
            create: {
                name: 'cricket',
                displayName: 'Cricket',
                hasTeams: true,
                playerPositions: [
                    'Batsman',
                    'Bowler',
                    'All-rounder',
                    'Wicket-keeper',
                ],
                visualizationType: 'field',
            },
        }),
        prisma.sport.upsert({
            where: { name: 'tennis' },
            update: {},
            create: {
                name: 'tennis',
                displayName: 'Tennis',
                hasTeams: false,
                playerPositions: ['Singles Player'],
                visualizationType: 'court',
            },
        }),
    ]);
    console.log(`✅ Created ${sports.length} sports`);
    sports.forEach((sport) => {
        console.log(`   - ${sport.displayName} (${sport.name})`);
    });
    console.log('✅ Seeding complete!');
}
main()
    .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map