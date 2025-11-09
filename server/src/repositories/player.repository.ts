import { Player, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class PlayerRepository {
  /**
   * Find player by ID
   */
  async findById(id: string): Promise<Player | null> {
    return await prisma.player.findUnique({
      where: { id },
      include: {
        team: true,
        sport: true,
        injuries: {
          where: { status: 'active' },
        },
      },
    });
  }

  /**
   * Find players by team
   */
  async findByTeam(teamId: string): Promise<Player[]> {
    return await prisma.player.findMany({
      where: { teamId },
      orderBy: { displayName: 'asc' },
      include: {
        injuries: {
          where: { status: 'active' },
        },
      },
    });
  }

  /**
   * Find player by external ID
   */
  async findByExternalId(externalId: string): Promise<Player | null> {
    return await prisma.player.findUnique({
      where: { externalId },
    });
  }

  /**
   * Create new player
   */
  async create(data: Prisma.PlayerCreateInput): Promise<Player> {
    return await prisma.player.create({
      data,
    });
  }

  /**
   * Update player
   */
  async update(id: string, data: Prisma.PlayerUpdateInput): Promise<Player> {
    return await prisma.player.update({
      where: { id },
      data,
    });
  }

  /**
   * Find active players by sport
   */
  async findActiveBySport(sportId: string): Promise<Player[]> {
    return await prisma.player.findMany({
      where: {
        sportId,
        isActive: true,
      },
      orderBy: { displayName: 'asc' },
    });
  }
}

export default new PlayerRepository();
