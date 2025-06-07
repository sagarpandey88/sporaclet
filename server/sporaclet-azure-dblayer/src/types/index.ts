export interface Sport {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface Team {
    id: string;
    name: string;
    logo?: string;
    sportId: string;
}

export interface Event {
    id: string;
    title: string;
    sportId: string;
    dateTime: Date;
    venue: string;
    team1Id: string;
    team2Id: string;
    predictionTeam1: number;
    predictionTeam2: number;
    predictionDraw?: number;
    featured: boolean;
    status: string;
    matchesPlayed?: string;
    headToHead?: string;
    lastMeeting?: string;
    weatherFavorableTeam?: string;
    pitchFavorableTeam?: string;
    details: Record<string, any>;
}
