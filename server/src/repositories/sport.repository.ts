import { Sport } from '../types/models';
import dataStore from '../lib/data-store';

export class SportRepository {
  /**
   * Find all sports
   */
  async findAll(): Promise<Sport[]> {
    return await dataStore.sport.findMany({
      orderBy: { displayName: 'asc' },
    });
  }

  /**
   * Find sport by name
   */
  async findByName(name: string): Promise<Sport | null> {
    return await dataStore.sport.findUnique({
      where: { name },
    });
  }

  /**
   * Find sport by ID
   */
  async findById(id: string): Promise<Sport | null> {
    return await dataStore.sport.findUnique({
      where: { id },
    });
  }
}

export default new SportRepository();
