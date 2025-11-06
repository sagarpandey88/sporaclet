import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
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

  // Seed Teams
  console.log('🏟️ Seeding teams...');
  const teams = [];

  // Football teams (Premier League)
  const football = sports.find(s => s.name === 'football');
  if (football) {
    const footballTeams = await Promise.all([
      prisma.team.upsert({
        where: { externalId: 'arsenal' },
        update: {},
        create: {
          externalId: 'arsenal',
          name: 'Arsenal FC',
          shortName: 'Arsenal',
          sportId: football!.id,
          country: 'England',
          league: 'Premier League',
          founded: 1886,
          logoUrl: 'https://example.com/arsenal-logo.png',
          venue: 'Emirates Stadium',
          venueCapacity: 60704,
          description: 'One of England\'s most successful clubs',
        },
      }),
      prisma.team.upsert({
        where: { externalId: 'chelsea' },
        update: {},
        create: {
          externalId: 'chelsea',
          name: 'Chelsea FC',
          shortName: 'Chelsea',
          sportId: football!.id,
          country: 'England',
          league: 'Premier League',
          founded: 1905,
          logoUrl: 'https://example.com/chelsea-logo.png',
          venue: 'Stamford Bridge',
          venueCapacity: 40834,
          description: 'London-based Premier League club',
        },
      }),
      prisma.team.upsert({
        where: { externalId: 'manchester-united' },
        update: {},
        create: {
          externalId: 'manchester-united',
          name: 'Manchester United FC',
          shortName: 'Man Utd',
          sportId: football!.id,
          country: 'England',
          league: 'Premier League',
          founded: 1878,
          logoUrl: 'https://example.com/manu-logo.png',
          venue: 'Old Trafford',
          venueCapacity: 74310,
          description: 'One of the most successful clubs in football history',
        },
      }),
      prisma.team.upsert({
        where: { externalId: 'liverpool' },
        update: {},
        create: {
          externalId: 'liverpool',
          name: 'Liverpool FC',
          shortName: 'Liverpool',
          sportId: football!.id,
          country: 'England',
          league: 'Premier League',
          founded: 1892,
          logoUrl: 'https://example.com/liverpool-logo.png',
          venue: 'Anfield',
          venueCapacity: 53394,
          description: 'Anfield-based football club',
        },
      }),
    ]);
    teams.push(...footballTeams);
  }

  // Basketball teams (NBA)
  const basketball = sports.find(s => s.name === 'basketball');
  if (basketball) {
    const basketballTeams = await Promise.all([
      prisma.team.upsert({
        where: { externalId: 'lakers' },
        update: {},
        create: {
          externalId: 'lakers',
          name: 'Los Angeles Lakers',
          shortName: 'Lakers',
          sportId: basketball!.id,
          country: 'USA',
          league: 'NBA',
          founded: 1947,
          logoUrl: 'https://example.com/lakers-logo.png',
          venue: 'Crypto.com Arena',
          venueCapacity: 18997,
          description: '16-time NBA champions',
        },
      }),
      prisma.team.upsert({
        where: { externalId: 'warriors' },
        update: {},
        create: {
          externalId: 'warriors',
          name: 'Golden State Warriors',
          shortName: 'Warriors',
          sportId: basketball!.id,
          country: 'USA',
          league: 'NBA',
          founded: 1946,
          logoUrl: 'https://example.com/warriors-logo.png',
          venue: 'Chase Center',
          venueCapacity: 18064,
          description: 'Recent NBA champions with Stephen Curry',
        },
      }),
    ]);
    teams.push(...basketballTeams);
  }

  // Cricket teams (International)
  const cricket = sports.find(s => s.name === 'cricket');
  if (cricket) {
    const cricketTeams = await Promise.all([
      prisma.team.upsert({
        where: { externalId: 'india' },
        update: {},
        create: {
          externalId: 'india',
          name: 'India',
          shortName: 'IND',
          sportId: cricket!.id,
          country: 'India',
          league: 'International',
          founded: 1932,
          logoUrl: 'https://example.com/india-logo.png',
          venue: 'Various',
          venueCapacity: null,
          description: 'Indian national cricket team',
        },
      }),
      prisma.team.upsert({
        where: { externalId: 'australia' },
        update: {},
        create: {
          externalId: 'australia',
          name: 'Australia',
          shortName: 'AUS',
          sportId: cricket!.id,
          country: 'Australia',
          league: 'International',
          founded: 1877,
          logoUrl: 'https://example.com/australia-logo.png',
          venue: 'Various',
          venueCapacity: null,
          description: 'Australian national cricket team',
        },
      }),
    ]);
    teams.push(...cricketTeams);
  }

  console.log(`✅ Created ${teams.length} teams`);
  teams.forEach((team) => {
    console.log(`   - ${team.name} (${team.league})`);
  });

  // Seed Players
  console.log('👥 Seeding players...');
  const players = [];

  // Football players
  const arsenal = teams.find(t => t.externalId === 'arsenal');
  if (arsenal) {
    const arsenalPlayers = await Promise.all([
      prisma.player.upsert({
        where: { externalId: 'bukayo-saka' },
        update: {},
        create: {
          externalId: 'bukayo-saka',
          firstName: 'Bukayo',
          lastName: 'Saka',
          displayName: 'Bukayo Saka',
          teamId: arsenal.id,
          sportId: football!.id,
          position: 'Forward',
          jerseyNumber: 7,
          birthDate: new Date('2001-09-05'),
          nationality: 'England',
          height: 178,
          weight: 65,
          photoUrl: 'https://example.com/saka-photo.jpg',
          statistics: { goals: 45, assists: 32 },
          isActive: true,
        },
      }),
      prisma.player.upsert({
        where: { externalId: 'martin-odegaard' },
        update: {},
        create: {
          externalId: 'martin-odegaard',
          firstName: 'Martin',
          lastName: 'Ødegaard',
          displayName: 'Martin Ødegaard',
          teamId: arsenal.id,
          sportId: football!.id,
          position: 'Midfielder',
          jerseyNumber: 8,
          birthDate: new Date('1998-12-17'),
          nationality: 'Norway',
          height: 178,
          weight: 68,
          photoUrl: 'https://example.com/odegaard-photo.jpg',
          statistics: { goals: 28, assists: 45 },
          isActive: true,
        },
      }),
    ]);
    players.push(...arsenalPlayers);
  }

  const chelsea = teams.find(t => t.externalId === 'chelsea');
  if (chelsea) {
    const chelseaPlayers = await Promise.all([
      prisma.player.upsert({
        where: { externalId: 'enzo-fernandez' },
        update: {},
        create: {
          externalId: 'enzo-fernandez',
          firstName: 'Enzo',
          lastName: 'Fernández',
          displayName: 'Enzo Fernández',
          teamId: chelsea.id,
          sportId: football!.id,
          position: 'Midfielder',
          jerseyNumber: 5,
          birthDate: new Date('2001-01-17'),
          nationality: 'Argentina',
          height: 178,
          weight: 76,
          photoUrl: 'https://example.com/fernandez-photo.jpg',
          statistics: { goals: 8, assists: 12 },
          isActive: true,
        },
      }),
    ]);
    players.push(...chelseaPlayers);
  }

  // Basketball players
  const lakers = teams.find(t => t.externalId === 'lakers');
  if (lakers) {
    const lakersPlayers = await Promise.all([
      prisma.player.upsert({
        where: { externalId: 'lebron-james' },
        update: {},
        create: {
          externalId: 'lebron-james',
          firstName: 'LeBron',
          lastName: 'James',
          displayName: 'LeBron James',
          teamId: lakers.id,
          sportId: basketball!.id,
          position: 'Small Forward',
          jerseyNumber: 23,
          birthDate: new Date('1984-12-30'),
          nationality: 'USA',
          height: 206,
          weight: 113,
          photoUrl: 'https://example.com/lebron-photo.jpg',
          statistics: { points: 38652, rebounds: 11247, assists: 11206 },
          isActive: true,
        },
      }),
      prisma.player.upsert({
        where: { externalId: 'anthony-davis' },
        update: {},
        create: {
          externalId: 'anthony-davis',
          firstName: 'Anthony',
          lastName: 'Davis',
          displayName: 'Anthony Davis',
          teamId: lakers.id,
          sportId: basketball!.id,
          position: 'Power Forward',
          jerseyNumber: 3,
          birthDate: new Date('1993-03-11'),
          nationality: 'USA',
          height: 208,
          weight: 115,
          photoUrl: 'https://example.com/davis-photo.jpg',
          statistics: { points: 18427, rebounds: 8144, blocks: 1927 },
          isActive: true,
        },
      }),
    ]);
    players.push(...lakersPlayers);
  }

  // Cricket players
  const india = teams.find(t => t.externalId === 'india');
  if (india) {
    const indiaPlayers = await Promise.all([
      prisma.player.upsert({
        where: { externalId: 'virat-kohli' },
        update: {},
        create: {
          externalId: 'virat-kohli',
          firstName: 'Virat',
          lastName: 'Kohli',
          displayName: 'Virat Kohli',
          teamId: india.id,
          sportId: cricket!.id,
          position: 'Batsman',
          jerseyNumber: 18,
          birthDate: new Date('1988-11-05'),
          nationality: 'India',
          height: 175,
          weight: 70,
          photoUrl: 'https://example.com/kohli-photo.jpg',
          statistics: { runs: 12809, centuries: 46, average: 52.65 },
          isActive: true,
        },
      }),
    ]);
    players.push(...indiaPlayers);
  }

  console.log(`✅ Created ${players.length} players`);
  players.forEach((player) => {
    console.log(`   - ${player.displayName} (${player.position})`);
  });

  // Seed Events
  console.log('📅 Seeding events...');
  const events = [];

  // Football events
  if (arsenal && chelsea) {
    const footballEvents = await Promise.all([
      prisma.event.upsert({
        where: { externalId: 'arsenal-chelsea-2025' },
        update: {},
        create: {
          externalId: 'arsenal-chelsea-2025',
          sportId: football!.id,
          homeTeamId: arsenal.id,
          awayTeamId: chelsea.id,
          eventName: 'Arsenal vs Chelsea',
          venue: 'Emirates Stadium',
          date: new Date('2025-11-15T15:00:00Z'),
          status: 'upcoming',
          league: 'Premier League',
          season: '2025-26',
          round: 'Matchweek 12',
          description: 'London derby in the Premier League',
        },
      }),
      prisma.event.upsert({
        where: { externalId: 'liverpool-manchester-united-2025' },
        update: {},
        create: {
          externalId: 'liverpool-manchester-united-2025',
          sportId: football!.id,
          homeTeamId: teams.find(t => t.externalId === 'liverpool')?.id,
          awayTeamId: teams.find(t => t.externalId === 'manchester-united')?.id,
          eventName: 'Liverpool vs Manchester United',
          venue: 'Anfield',
          date: new Date('2025-11-10T17:30:00Z'),
          status: 'upcoming',
          league: 'Premier League',
          season: '2025-26',
          round: 'Matchweek 11',
          description: 'Merseyside derby',
        },
      }),
      // Completed event
      prisma.event.upsert({
        where: { externalId: 'arsenal-liverpool-2024' },
        update: {},
        create: {
          externalId: 'arsenal-liverpool-2024',
          sportId: football!.id,
          homeTeamId: arsenal.id,
          awayTeamId: teams.find(t => t.externalId === 'liverpool')?.id,
          eventName: 'Arsenal vs Liverpool',
          venue: 'Emirates Stadium',
          date: new Date('2024-11-01T15:00:00Z'),
          status: 'completed',
          league: 'Premier League',
          season: '2024-25',
          round: 'Matchweek 10',
          homeScore: 2,
          awayScore: 1,
          winner: 'home',
          attendance: 60260,
          description: 'Arsenal secured a narrow victory',
        },
      }),
    ]);
    events.push(...footballEvents);
  }

  // Basketball events
  const warriors = teams.find(t => t.externalId === 'warriors');
  if (lakers && warriors) {
    const basketballEvents = await Promise.all([
      prisma.event.upsert({
        where: { externalId: 'lakers-warriors-2025' },
        update: {},
        create: {
          externalId: 'lakers-warriors-2025',
          sportId: basketball!.id,
          homeTeamId: lakers.id,
          awayTeamId: warriors.id,
          eventName: 'Lakers vs Warriors',
          venue: 'Crypto.com Arena',
          date: new Date('2025-11-20T22:00:00Z'),
          status: 'upcoming',
          league: 'NBA',
          season: '2025-26',
          round: 'Regular Season',
          description: 'Rivalry matchup between two championship contenders',
        },
      }),
    ]);
    events.push(...basketballEvents);
  }

  // Cricket events (individual sport example)
  const australia = teams.find(t => t.externalId === 'australia');
  if (india && australia) {
    const cricketEvents = await Promise.all([
      prisma.event.upsert({
        where: { externalId: 'india-australia-test-2025' },
        update: {},
        create: {
          externalId: 'india-australia-test-2025',
          sportId: cricket!.id,
          homeTeamId: india.id,
          awayTeamId: australia.id,
          eventName: 'India vs Australia - 1st Test',
          venue: 'Melbourne Cricket Ground',
          date: new Date('2025-12-05T05:00:00Z'),
          status: 'upcoming',
          league: 'Border-Gavaskar Trophy',
          season: '2025-26',
          round: '1st Test',
          description: 'First Test match of the series',
        },
      }),
    ]);
    events.push(...cricketEvents);
  }

  console.log(`✅ Created ${events.length} events`);
  events.forEach((event) => {
    console.log(`   - ${event.eventName} (${event.status})`);
  });

  // Seed Predictions
  console.log('🔮 Seeding predictions...');
  const predictions = [];

  // Predictions for upcoming events
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  for (const event of upcomingEvents) {
    const prediction = await prisma.prediction.upsert({
      where: { id: `${event.id}-prediction` }, // Using a composite key approach
      update: {},
      create: {
        eventId: event.id,
        probabilities: {
          home: event.sportId === football!.id ? 0.55 : 0.60,
          away: event.sportId === football!.id ? 0.30 : 0.25,
          draw: event.sportId === football!.id ? 0.15 : 0.15,
        },
        predictedWinner: event.sportId === football!.id ? 'home' : 'home',
        confidence: 'medium',
        keyFactors: [
          'Home advantage',
          'Recent form',
          'Player availability',
        ],
        modelVersion: 'v1.0.0',
        generatedAt: new Date(),
      },
    });
    predictions.push(prediction);
  }

  // Prediction for completed event
  const completedEvent = events.find(e => e.status === 'completed');
  if (completedEvent) {
    const completedPrediction = await prisma.prediction.upsert({
      where: { id: `${completedEvent.id}-prediction` },
      update: {},
      create: {
        eventId: completedEvent.id,
        probabilities: {
          home: 0.52,
          away: 0.28,
          draw: 0.20,
        },
        predictedWinner: 'home',
        confidence: 'high',
        keyFactors: [
          'Home advantage',
          'Strong defense',
          'Key player performance',
        ],
        modelVersion: 'v1.0.0',
        generatedAt: new Date('2024-10-30T10:00:00Z'),
        isAccurate: true,
        accuracyNote: 'Correctly predicted home win',
      },
    });
    predictions.push(completedPrediction);
  }

  console.log(`✅ Created ${predictions.length} predictions`);
  predictions.forEach((prediction) => {
    console.log(`   - Prediction for event ${prediction.eventId} (${prediction.confidence} confidence)`);
  });

  // Seed Injuries
  console.log('🏥 Seeding injuries...');
  const injuries = [];

  // Some injuries for players
  const saka = players.find(p => p.externalId === 'bukayo-saka');
  if (saka) {
    const injury = await prisma.injury.upsert({
      where: { id: `${saka.id}-injury-1` },
      update: {},
      create: {
        playerId: saka.id,
        injuryType: 'Ankle Sprain',
        severity: 'moderate',
        occurredDate: new Date('2024-10-15'),
        expectedReturnDate: new Date('2024-11-20'),
        status: 'recovered',
        notes: 'Recovered from ankle injury, back in training',
      },
    });
    injuries.push(injury);
  }

  const lebron = players.find(p => p.externalId === 'lebron-james');
  if (lebron) {
    const injury = await prisma.injury.upsert({
      where: { id: `${lebron.id}-injury-1` },
      update: {},
      create: {
        playerId: lebron.id,
        injuryType: 'Back Strain',
        severity: 'minor',
        occurredDate: new Date('2024-11-01'),
        expectedReturnDate: new Date('2024-11-15'),
        status: 'day_to_day',
        notes: 'Minor back strain, expected to play',
      },
    });
    injuries.push(injury);
  }

  console.log(`✅ Created ${injuries.length} injuries`);
  injuries.forEach((injury) => {
    console.log(`   - ${injury.injuryType} for player ${injury.playerId} (${injury.status})`);
  });

  // Seed Head-to-Head data
  console.log('⚔️ Seeding head-to-head data...');
  const headToHeads = [];

  // Arsenal vs Chelsea
  if (arsenal && chelsea) {
    const h2h = await prisma.headToHead.upsert({
      where: {
        team1Id_team2Id: {
          team1Id: arsenal.id,
          team2Id: chelsea.id,
        }
      },
      update: {},
      create: {
        team1Id: arsenal.id,
        team2Id: chelsea.id,
        totalMatches: 198,
        team1Wins: 75,
        team2Wins: 67,
        draws: 56,
        lastFiveResults: ['W', 'L', 'D', 'W', 'L'], // Arsenal wins, losses, draws
        averageGoalsTeam1: 1.4,
        averageGoalsTeam2: 1.2,
        lastUpdated: new Date(),
      },
    });
    headToHeads.push(h2h);
  }

  // Lakers vs Warriors
  if (lakers && warriors) {
    const h2h = await prisma.headToHead.upsert({
      where: {
        team1Id_team2Id: {
          team1Id: lakers.id,
          team2Id: warriors.id,
        }
      },
      update: {},
      create: {
        team1Id: lakers.id,
        team2Id: warriors.id,
        totalMatches: 247,
        team1Wins: 138,
        team2Wins: 109,
        draws: 0, // NBA doesn't have draws
        lastFiveResults: ['W', 'L', 'W', 'L', 'W'],
        averageGoalsTeam1: 108.5,
        averageGoalsTeam2: 105.2,
        lastUpdated: new Date(),
      },
    });
    headToHeads.push(h2h);
  }

  console.log(`✅ Created ${headToHeads.length} head-to-head records`);
  headToHeads.forEach((h2h) => {
    console.log(`   - ${h2h.team1Id} vs ${h2h.team2Id}: ${h2h.team1Wins}-${h2h.draws}-${h2h.team2Wins}`);
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((error: Error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
