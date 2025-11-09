import prisma from '../lib/prisma';
import { Event, Prediction, EventStatus, Prisma } from '@prisma/client';

/**
 * Event with relations type
 */
type EventWithRelations = Event & {
  sport: {
    id: string;
    name: string;
    displayName: string;
  };
  homeTeam?: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
  } | null;
  awayTeam?: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
  } | null;
  predictions: Prediction[];
};

/**
 * Event Repository
 * Handles all database operations for events
 */
class EventRepository {
  /**
   * Find upcoming events with filters
   */
  async findUpcoming(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithRelations[]> {
    const where: Prisma.EventWhereInput = {
      status: EventStatus.upcoming,
      isDeleted: false,
      date: {
        gte: filters.dateFrom || new Date(),
        ...(filters.dateTo && { lte: filters.dateTo }),
      },
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
      ...(filters.league && {
        league: {
          contains: filters.league,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    return prisma.event.findMany({
      where,
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        predictions: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  /**
   * Find past/completed events with filters
   */
  async findPast(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithRelations[]> {
    const where: Prisma.EventWhereInput = {
      status: EventStatus.completed,
      isDeleted: false,
      date: {
        lte: filters.dateTo || new Date(),
        ...(filters.dateFrom && { gte: filters.dateFrom }),
      },
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
      ...(filters.league && {
        league: {
          contains: filters.league,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    return prisma.event.findMany({
      where,
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        predictions: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        date: 'desc', // Most recent first for past events
      },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  /**
   * Count upcoming events with filters
   */
  async countByFilters(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
  }): Promise<number> {
    const where: Prisma.EventWhereInput = {
      status: EventStatus.upcoming,
      isDeleted: false,
      date: {
        gte: filters.dateFrom || new Date(),
        ...(filters.dateTo && { lte: filters.dateTo }),
      },
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
      ...(filters.league && {
        league: {
          contains: filters.league,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    return prisma.event.count({ where });
  }

  /**
   * Count past/completed events with filters
   */
  async countPast(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
  }): Promise<number> {
    const where: Prisma.EventWhereInput = {
      status: EventStatus.completed,
      isDeleted: false,
      date: {
        lte: filters.dateTo || new Date(),
        ...(filters.dateFrom && { gte: filters.dateFrom }),
      },
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
      ...(filters.league && {
        league: {
          contains: filters.league,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    return prisma.event.count({ where });
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<EventWithRelations | null> {
    return prisma.event.findUnique({
      where: { id },
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        predictions: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  /**
   * Search events by team name
   */
  async findByFilters(filters: {
    query?: string;
    sport?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithRelations[]> {
    const where: Prisma.EventWhereInput = {
      status: EventStatus.upcoming,
      isDeleted: false,
      date: {
        gte: new Date(),
      },
      ...(filters.query && {
        OR: [
          {
            eventName: {
              contains: filters.query,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            homeTeam: {
              name: {
                contains: filters.query,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
          },
          {
            awayTeam: {
              name: {
                contains: filters.query,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
          },
          {
            participant1Name: {
              contains: filters.query,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            participant2Name: {
              contains: filters.query,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      }),
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
    };

    return prisma.event.findMany({
      where,
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        predictions: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  /**
   * Full-text search across events using PostgreSQL full-text search
   * Searches event names, team names, and participant names
   */
  async fullTextSearch(filters: {
    query: string;
    sport?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithRelations[]> {
    const searchQuery = filters.query.toLowerCase();
    
    const where: Prisma.EventWhereInput = {
      isDeleted: false,
      OR: [
        {
          eventName: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          homeTeam: {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                shortName: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        },
        {
          awayTeam: {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                shortName: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        },
        {
          participant1Name: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          participant2Name: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          venue: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          league: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ],
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
    };

    return prisma.event.findMany({
      where,
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        predictions: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: [
        {
          date: 'asc',
        },
      ],
      take: filters.limit,
      skip: filters.offset,
    });
  }

  /**
   * Count search results
   */
  async countSearchResults(filters: {
    query: string;
    sport?: string;
  }): Promise<number> {
    const searchQuery = filters.query.toLowerCase();
    
    const where: Prisma.EventWhereInput = {
      isDeleted: false,
      OR: [
        {
          eventName: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          homeTeam: {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                shortName: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        },
        {
          awayTeam: {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                shortName: {
                  contains: searchQuery,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        },
        {
          participant1Name: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          participant2Name: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          venue: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          league: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ],
      ...(filters.sport && {
        sport: {
          name: filters.sport,
        },
      }),
    };

    return prisma.event.count({ where });
  }
}

export default new EventRepository();
