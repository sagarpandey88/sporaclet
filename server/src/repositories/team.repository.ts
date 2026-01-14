import { Team, Prisma } from '../types/models';
import dataStore from '../lib/data-store';

export class TeamRepository {
  /**
   * Find team by ID
   */
  async findById(id: string): Promise<Team | null> {
    return await dataStore.team.findUnique({
      where: { id },
      include: {
        sport: true,
      },
    });
  }

  /**
   * Find teams by sport
   */
  async findBySport(sportId: string): Promise<Team[]> {
    return await dataStore.team.findMany({
      where: { sportId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find team by external ID
   */
  async findByExternalId(externalId: string): Promise<Team | null> {
    return await dataStore.team.findUnique({
      where: { externalId },
    });
  }

  /**
   * Create new team
   */
  async create(data: Prisma.TeamCreateInput): Promise<Team> {
    return await dataStore.team.create({
      data,
    });
  }

  /**
   * Update team
   */
  async update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    return await dataStore.team.update({
      where: { id },
      data,
    });
  }

  /**
   * Find teams by league
   */
  async findByLeague(league: string): Promise<Team[]> {
    return await dataStore.team.findMany({
      where: { league },
      orderBy: { name: 'asc' },
    });
  }
}

export default new TeamRepository();
