import { Player } from '../types/models';
import db from '../lib/db';

export class PlayerRepository {
  /**
   * Find player by ID
   */
  async findById(id: string): Promise<Player | null> {
    const result = await db.query<Player>(
      `SELECT * FROM players WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find players by team
   */
  async findByTeam(teamId: string): Promise<Player[]> {
    const result = await db.query<Player>(
      `SELECT * FROM players 
       WHERE "teamId" = $1 
       ORDER BY "displayName" ASC`,
      [teamId]
    );
    return result.rows;
  }

  /**
   * Find player by external ID
   */
  async findByExternalId(externalId: string): Promise<Player | null> {
    const result = await db.query<Player>(
      `SELECT * FROM players WHERE "externalId" = $1`,
      [externalId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create new player
   */
  async create(_data: Partial<Player>): Promise<Player> {
    // Not implemented - simplified
    throw new Error('Create operation not supported in simplified implementation');
  }

  /**
   * Update player
   */
  async update(_id: string, _data: Partial<Player>): Promise<Player> {
    // Not implemented - simplified
    throw new Error('Update operation not supported in simplified implementation');
  }

  /**
   * Find active players by sport
   */
  async findActiveBySport(sportId: string): Promise<Player[]> {
    const result = await db.query<Player>(
      `SELECT * FROM players 
       WHERE "sportId" = $1 AND "isActive" = true
       ORDER BY "displayName" ASC`,
      [sportId]
    );
    return result.rows;
  }
}

export default new PlayerRepository();
