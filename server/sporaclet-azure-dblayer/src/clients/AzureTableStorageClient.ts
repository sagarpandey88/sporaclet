import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables";
import { Sport, Team, Event } from "../types";
import * as dotenv from "dotenv";

dotenv.config();

export class AzureTableStorageClient {
    private tableServiceClient: TableServiceClient;
    private sportsTable: TableClient;
    private teamsTable: TableClient;
    private eventsTable: TableClient;

    constructor() {
        const account = process.env.AZURE_STORAGE_ACCOUNT;
        const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

        if (!account || !accountKey) {
            throw new Error("Azure Storage credentials not found in environment variables");
        }

        const credential = new AzureNamedKeyCredential(account, accountKey);
        const serviceUrl = `https://${account}.table.core.windows.net`;

        this.tableServiceClient = new TableServiceClient(serviceUrl, credential);
        this.sportsTable = TableClient.fromConnectionString(serviceUrl, "Sports", credential);
        this.teamsTable = TableClient.fromConnectionString(serviceUrl, "Teams", credential);
        this.eventsTable = TableClient.fromConnectionString(serviceUrl, "Events", credential);
    }

    // Sports operations
    async getSports(): Promise<Sport[]> {
        const sports: Sport[] = [];
        const entities = this.sportsTable.listEntities();
        for await (const entity of entities) {
            sports.push({
                id: entity.rowKey,
                name: entity.name as string,
                icon: entity.icon as string,
                color: entity.color as string
            });
        }
        return sports;
    }

    async getSportById(id: string): Promise<Sport | null> {
        try {
            const entity = await this.sportsTable.getEntity("sports", id);
            return {
                id: entity.rowKey as string,
                name: entity.name as string,
                icon: entity.icon as string,
                color: entity.color as string
            };
        } catch (error) {
            return null;
        }
    }

    // Teams operations
    async getTeams(sportId?: string): Promise<Team[]> {
        const teams: Team[] = [];
        const filter = sportId ? odata`sportId eq ${sportId}` : undefined;
        const entities = this.teamsTable.listEntities({ queryOptions: { filter } });
        for await (const entity of entities) {
            teams.push({
                id: entity.rowKey as string,
                name: entity.name as string,
                logo: entity.logo as string,
                sportId: entity.sportId as string
            });
        }
        return teams;
    }

    async getTeamById(id: string): Promise<Team | null> {
        try {
            const entity = await this.teamsTable.getEntity("teams", id);
            return {
                id: entity.rowKey as string,
                name: entity.name as string,
                logo: entity.logo as string,
                sportId: entity.sportId as string
            };
        } catch (error) {
            return null;
        }
    }

    // Events operations
    async getEvents(filters?: {
        sportId?: string;
        featured?: boolean;
        status?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Event[]> {
        const events: Event[] = [];
        let filterConditions: string[] = [];

        if (filters?.sportId) {
            filterConditions.push(`sportId eq '${filters.sportId}'`);
        }
        if (filters?.featured !== undefined) {
            filterConditions.push(`featured eq ${filters.featured}`);
        }
        if (filters?.status) {
            filterConditions.push(`status eq '${filters.status}'`);
        }
        if (filters?.fromDate) {
            filterConditions.push(`dateTime ge datetime'${filters.fromDate.toISOString()}'`);
        }
        if (filters?.toDate) {
            filterConditions.push(`dateTime le datetime'${filters.toDate.toISOString()}'`);
        }

        const filter = filterConditions.length > 0 ? filterConditions.join(' and ') : undefined;
        const entities = this.eventsTable.listEntities({ queryOptions: { filter } });

        for await (const entity of entities) {
            events.push({
                id: entity.rowKey as string,
                title: entity.title as string,
                sportId: entity.sportId as string,
                dateTime: new Date(entity.dateTime as string),
                venue: entity.venue as string,
                team1Id: entity.team1Id as string,
                team2Id: entity.team2Id as string,
                predictionTeam1: entity.predictionTeam1 as number,
                predictionTeam2: entity.predictionTeam2 as number,
                predictionDraw: entity.predictionDraw as number | undefined,
                featured: entity.featured as boolean,
                status: entity.status as string,
                matchesPlayed: entity.matchesPlayed as string,
                headToHead: entity.headToHead as string,
                lastMeeting: entity.lastMeeting as string,
                weatherFavorableTeam: entity.weatherFavorableTeam as string,
                pitchFavorableTeam: entity.pitchFavorableTeam as string,
                details: JSON.parse(entity.details as string || '{}')
            });
        }
        return events;
    }

    async getEventById(id: string): Promise<Event | null> {
        try {
            const entity = await this.eventsTable.getEntity("events", id);
            return {
                id: entity.rowKey as string,
                title: entity.title as string,
                sportId: entity.sportId as string,
                dateTime: new Date(entity.dateTime as string),
                venue: entity.venue as string,
                team1Id: entity.team1Id as string,
                team2Id: entity.team2Id as string,
                predictionTeam1: entity.predictionTeam1 as number,
                predictionTeam2: entity.predictionTeam2 as number,
                predictionDraw: entity.predictionDraw as number | undefined,
                featured: entity.featured as boolean,
                status: entity.status as string,
                matchesPlayed: entity.matchesPlayed as string,
                headToHead: entity.headToHead as string,
                lastMeeting: entity.lastMeeting as string,
                weatherFavorableTeam: entity.weatherFavorableTeam as string,
                pitchFavorableTeam: entity.pitchFavorableTeam as string,
                details: JSON.parse(entity.details as string || '{}')
            };
        } catch (error) {
            return null;
        }
    }
}
