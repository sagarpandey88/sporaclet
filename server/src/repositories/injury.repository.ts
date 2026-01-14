import { Injury } from '../types/models';
import dataStore from '../lib/data-store';

export class InjuryRepository {
  /**
   * Find active injuries by team
   */
  async findActiveByTeam(teamId: string): Promise<Injury[]> {
    // Simplified: no complex joins in in-memory store
    const injuries = await dataStore.injury.findMany({
      where: { status: 'active' },
    });
    return injuries;
  }

  /**
   * Find injury by ID
   */
  async findById(id: string): Promise<Injury | null> {
    const injuries = await dataStore.injury.findMany();
    return injuries.find((i) => i.id === id) || null;
  }

  /**
   * Find injuries by player
   */
  async findByPlayer(playerId: string): Promise<Injury[]> {
    return await dataStore.injury.findMany({
      where: { playerId },
    });
  }

  /**
   * Create new injury
   */
  async create(data: Partial<Injury>): Promise<Injury> {
    // Not implemented in simple in-memory store
    throw new Error('Create operation not supported in simplified data store');
  }

  /**
   * Update injury
   */
  async update(id: string, data: Partial<Injury>): Promise<Injury> {
    // Not implemented in simple in-memory store
    throw new Error('Update operation not supported in simplified data store');
  }

  /**
   * Find injuries by status
   */
  async findByStatus(status: 'active' | 'recovered' | 'day_to_day'): Promise<Injury[]> {
    return await dataStore.injury.findMany({
      where: { status },
    });
  }
}

export default new InjuryRepository();
