import { Injury, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class InjuryRepository {
  /**
   * Find active injuries by team
   */
  async findActiveByTeam(teamId: string): Promise<Injury[]> {
    return await prisma.injury.findMany({
      where: {
        status: 'active',
        player: {
          teamId,
        },
      },
      include: {
        player: true,
      },
      orderBy: {
        occurredDate: 'desc',
      },
    });
  }

  /**
   * Find injury by ID
   */
  async findById(id: string): Promise<Injury | null> {
    return await prisma.injury.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  /**
   * Find injuries by player
   */
  async findByPlayer(playerId: string): Promise<Injury[]> {
    return await prisma.injury.findMany({
      where: { playerId },
      orderBy: { occurredDate: 'desc' },
    });
  }

  /**
   * Create new injury
   */
  async create(data: Prisma.InjuryCreateInput): Promise<Injury> {
    return await prisma.injury.create({
      data,
    });
  }

  /**
   * Update injury
   */
  async update(id: string, data: Prisma.InjuryUpdateInput): Promise<Injury> {
    return await prisma.injury.update({
      where: { id },
      data,
    });
  }

  /**
   * Find injuries by status
   */
  async findByStatus(status: 'active' | 'recovered' | 'day_to_day'): Promise<Injury[]> {
    return await prisma.injury.findMany({
      where: { status },
      include: {
        player: {
          include: {
            team: true,
          },
        },
      },
      orderBy: { occurredDate: 'desc' },
    });
  }
}

export default new InjuryRepository();
