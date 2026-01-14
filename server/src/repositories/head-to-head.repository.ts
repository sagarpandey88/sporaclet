import dataStore from '../lib/data-store';
import { HeadToHead } from '../types/models';

/**
 * HeadToHead Repository
 * Handles all database operations for head-to-head records
 */
class HeadToHeadRepository {
  /**
   * Find head-to-head record by team IDs
   */
  async findByTeams(team1Id: string, team2Id: string): Promise<HeadToHead | null> {
    // Try both combinations since order matters
    const h2h = await dataStore.headToHead.findFirst({
      where: {
        team1Id,
        team2Id,
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
    lastFiveResults?: unknown;
    averageGoalsTeam1?: number;
    averageGoalsTeam2?: number;
  }): Promise<HeadToHead> {
    // Not implemented in simple in-memory store
    throw new Error('Create operation not supported in simplified data store');
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
      lastFiveResults?: unknown;
      averageGoalsTeam1?: number;
      averageGoalsTeam2?: number;
    }
  ): Promise<HeadToHead> {
    // Not implemented in simple in-memory store
    throw new Error('Update operation not supported in simplified data store');
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
    lastFiveResults: unknown;
    averageGoalsTeam1: number;
    averageGoalsTeam2: number;
  }): Promise<HeadToHead> {
    // Not implemented in simple in-memory store
    throw new Error('Upsert operation not supported in simplified data store');
  }
}

export default new HeadToHeadRepository();
