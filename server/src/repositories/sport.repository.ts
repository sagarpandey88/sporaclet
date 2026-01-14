import { Sport } from '../types/models';
import db from '../lib/db';

export class SportRepository {
  /**
   * Find all sports
   */
  async findAll(): Promise<Sport[]> {
    const result = await db.query<Sport>(`
      SELECT * FROM sports ORDER BY "displayName" ASC
    `);
    return result.rows;
  }

  /**
   * Find sport by name
   */
  async findByName(name: string): Promise<Sport | null> {
    const result = await db.query<Sport>(
      `SELECT * FROM sports WHERE name = $1`,
      [name]
    );
    return result.rows[0] || null;
  }

  /**
   * Find sport by ID
   */
  async findById(id: string): Promise<Sport | null> {
    const result = await db.query<Sport>(
      `SELECT * FROM sports WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
}

export default new SportRepository();
