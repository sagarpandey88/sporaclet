import { AzureTableStorageClient } from './clients/AzureTableStorageClient';
import { Sport, Team, Event } from './types';

export class DataAccessLayer {
    private client: AzureTableStorageClient;

    constructor() {
        this.client = new AzureTableStorageClient();
    }

    // Sports
    async getAllSports(): Promise<Sport[]> {
        return await this.client.getSports();
    }

    async getSportById(id: string): Promise<Sport | null> {
        return await this.client.getSportById(id);
    }

    // Teams
    async getTeams(sportId?: string): Promise<Team[]> {
        return await this.client.getTeams(sportId);
    }

    async getTeamById(id: string): Promise<Team | null> {
        return await this.client.getTeamById(id);
    }

    // Events
    async getEvents(filters?: {
        sportId?: string;
        featured?: boolean;
        status?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Event[]> {
        return await this.client.getEvents(filters);
    }

    async getEventById(id: string): Promise<Event | null> {
        return await this.client.getEventById(id);
    }
}

export { Sport, Team, Event } from './types';
