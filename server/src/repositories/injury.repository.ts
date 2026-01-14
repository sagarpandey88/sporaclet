import { Injury } from '../types/models';
import db from '../lib/db';

export class InjuryRepository {
  /**
   * Find active injuries by team
   */
  async findActiveByTeam(_teamId: string): Promise<Injury[]> {
    // Simplified: returns all active injuries
    const result = await db.query<Injury>(
      `SELECT * FROM injuries WHERE status = 'active' ORDER BY "occurredDate" DESC`
    );
    return result.rows;
  }

  /**
   * Find injury by ID
   */
  async findById(id: string): Promise<Injury | null> {
    const result = await db.query<Injury>(
      `SELECT * FROM injuries WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find injuries by player
   */
  async findByPlayer(playerId: string): Promise<Injury[]> {
    const result = await db.query<Injury>(
      `SELECT * FROM injuries 
       WHERE "playerId" = $1 
       ORDER BY "occurredDate" DESC`,
      [playerId]
    );
    return result.rows;
  }

  /**
   * Create new injury
   */
  async create(_data: Partial<Injury>): Promise<Injury> {
    // Not implemented - simplified
    throw new Error('Create operation not supported in simplified implementation');
  }

  /**
   * Update injury
   */
  async update(_id: string, _data: Partial<Injury>): Promise<Injury> {
    // Not implemented - simplified
    throw new Error('Update operation not supported in simplified implementation');
  }

  /**
   * Find injuries by status
   */
  async findByStatus(status: 'active' | 'recovered' | 'day_to_day'): Promise<Injury[]> {
    const result = await db.query<Injury>(
      `SELECT * FROM injuries 
       WHERE status = $1 
       ORDER BY "occurredDate" DESC`,
      [status]
    );
    return result.rows;
  }
}

export default new InjuryRepository();
