import { Team, Prisma } from '../types/models';
import db from '../lib/db';

export class TeamRepository {
  /**
   * Find team by ID
   */
  async findById(id: string): Promise<Team | null> {
    const result = await db.query<Team>(
      `SELECT t.* FROM teams t WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find teams by sport
   */
  async findBySport(sportId: string): Promise<Team[]> {
    const result = await db.query<Team>(
      `SELECT * FROM teams WHERE "sportId" = $1 ORDER BY name ASC`,
      [sportId]
    );
    return result.rows;
  }

  /**
   * Find team by external ID
   */
  async findByExternalId(externalId: string): Promise<Team | null> {
    const result = await db.query<Team>(
      `SELECT * FROM teams WHERE "externalId" = $1`,
      [externalId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create new team
   */
  async create(data: Prisma.TeamCreateInput): Promise<Team> {
    const result = await db.query<Team>(
      `INSERT INTO teams (
        "externalId", name, "shortName", "sportId", country, league,
        founded, "logoUrl", venue, "venueCapacity", description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.externalId,
        data.name,
        data.shortName,
        data.sportId,
        data.country,
        data.league,
        data.founded || null,
        data.logoUrl || null,
        data.venue || null,
        data.venueCapacity || null,
        data.description || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Update team
   */
  async update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.shortName !== undefined) {
      updates.push(`"shortName" = $${paramCount++}`);
      values.push(data.shortName);
    }
    if (data.league !== undefined) {
      updates.push(`league = $${paramCount++}`);
      values.push(data.league);
    }
    if (data.logoUrl !== undefined) {
      updates.push(`"logoUrl" = $${paramCount++}`);
      values.push(data.logoUrl);
    }

    values.push(id);
    const result = await db.query<Team>(
      `UPDATE teams SET ${updates.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Find teams by league
   */
  async findByLeague(league: string): Promise<Team[]> {
    const result = await db.query<Team>(
      `SELECT * FROM teams WHERE league = $1 ORDER BY name ASC`,
      [league]
    );
    return result.rows;
  }
}

export default new TeamRepository();
