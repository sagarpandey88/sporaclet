import { Team, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class TeamRepository {
  /**
   * Find team by ID
   */
  async findById(id: string): Promise<Team | null> {
    return await prisma.team.findUnique({
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
    return await prisma.team.findMany({
      where: { sportId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find team by external ID
   */
  async findByExternalId(externalId: string): Promise<Team | null> {
    return await prisma.team.findUnique({
      where: { externalId },
    });
  }

  /**
   * Create new team
   */
  async create(data: Prisma.TeamCreateInput): Promise<Team> {
    return await prisma.team.create({
      data,
    });
  }

  /**
   * Update team
   */
  async update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    return await prisma.team.update({
      where: { id },
      data,
    });
  }

  /**
   * Find teams by league
   */
  async findByLeague(league: string): Promise<Team[]> {
    return await prisma.team.findMany({
      where: { league },
      orderBy: { name: 'asc' },
    });
  }
}

export default new TeamRepository();
