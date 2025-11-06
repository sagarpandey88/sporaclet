import { Sport } from '@prisma/client';
import prisma from '../lib/prisma';

export class SportRepository {
  /**
   * Find all sports
   */
  async findAll(): Promise<Sport[]> {
    return await prisma.sport.findMany({
      orderBy: { displayName: 'asc' },
    });
  }

  /**
   * Find sport by name
   */
  async findByName(name: string): Promise<Sport | null> {
    return await prisma.sport.findUnique({
      where: { name },
    });
  }

  /**
   * Find sport by ID
   */
  async findById(id: string): Promise<Sport | null> {
    return await prisma.sport.findUnique({
      where: { id },
    });
  }
}

export default new SportRepository();
