import { Player } from '../types/models';
import dataStore from '../lib/data-store';

export class PlayerRepository {
  /**
   * Find player by ID
   */
  async findById(id: string): Promise<Player | null> {
    // Simplified: no includes in in-memory store
    const players = await dataStore.player.findMany();
    return players.find((p) => p.id === id) || null;
  }

  /**
   * Find players by team
   */
  async findByTeam(teamId: string): Promise<Player[]> {
    return await dataStore.player.findMany({
      where: { teamId },
      orderBy: { displayName: 'asc' },
    });
  }

  /**
   * Find player by external ID
   */
  async findByExternalId(externalId: string): Promise<Player | null> {
    const players = await dataStore.player.findMany();
    return players.find((p) => p.externalId === externalId) || null;
  }

  /**
   * Create new player
   */
  async create(data: Partial<Player>): Promise<Player> {
    // Not implemented in simple in-memory store
    throw new Error('Create operation not supported in simplified data store');
  }

  /**
   * Update player
   */
  async update(id: string, data: Partial<Player>): Promise<Player> {
    // Not implemented in simple in-memory store
    throw new Error('Update operation not supported in simplified data store');
  }

  /**
   * Find active players by sport
   */
  async findActiveBySport(sportId: string): Promise<Player[]> {
    const players = await dataStore.player.findMany({
      where: { sportId },
      orderBy: { displayName: 'asc' },
    });
    return players.filter((p) => p.isActive);
  }
}

export default new PlayerRepository();
