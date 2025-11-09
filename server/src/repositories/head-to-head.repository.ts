import prisma from '../lib/prisma';
import { HeadToHead, Prisma } from '@prisma/client';

/**
 * HeadToHead Repository
 * Handles all database operations for head-to-head records
 */
class HeadToHeadRepository {
  /**
   * Find head-to-head record by team IDs
   */
  async findByTeams(team1Id: string, team2Id: string): Promise<HeadToHead | null> {
    // Try both combinations since order matters in DB
    const h2h = await prisma.headToHead.findFirst({
      where: {
        OR: [
          { team1Id, team2Id },
          { team1Id: team2Id, team2Id: team1Id },
        ],
      },
    });

    return h2h;
  }

  /**
   * Create a new head-to-head record
   */
  async create(data: {
    team1Id: string;
    team2Id: string;
    totalMatches?: number;
    team1Wins?: number;
    team2Wins?: number;
    draws?: number;
    lastFiveResults?: Prisma.InputJsonValue;
    averageGoalsTeam1?: number;
    averageGoalsTeam2?: number;
  }): Promise<HeadToHead> {
    return prisma.headToHead.create({
      data: {
        team1Id: data.team1Id,
        team2Id: data.team2Id,
        totalMatches: data.totalMatches || 0,
        team1Wins: data.team1Wins || 0,
        team2Wins: data.team2Wins || 0,
        draws: data.draws || 0,
        lastFiveResults: data.lastFiveResults || [],
        averageGoalsTeam1: data.averageGoalsTeam1 || 0,
        averageGoalsTeam2: data.averageGoalsTeam2 || 0,
      },
    });
  }

  /**
   * Update an existing head-to-head record
   */
  async update(
    id: string,
    data: {
      totalMatches?: number;
      team1Wins?: number;
      team2Wins?: number;
      draws?: number;
      lastFiveResults?: Prisma.InputJsonValue;
      averageGoalsTeam1?: number;
      averageGoalsTeam2?: number;
    }
  ): Promise<HeadToHead> {
    return prisma.headToHead.update({
      where: { id },
      data: {
        ...data,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Upsert head-to-head record (create or update)
   */
  async upsert(data: {
    team1Id: string;
    team2Id: string;
    totalMatches: number;
    team1Wins: number;
    team2Wins: number;
    draws: number;
    lastFiveResults: Prisma.InputJsonValue;
    averageGoalsTeam1: number;
    averageGoalsTeam2: number;
  }): Promise<HeadToHead> {
    return prisma.headToHead.upsert({
      where: {
        team1Id_team2Id: {
          team1Id: data.team1Id,
          team2Id: data.team2Id,
        },
      },
      create: data,
      update: {
        ...data,
        lastUpdated: new Date(),
      },
    });
  }
}

export default new HeadToHeadRepository();
