import { NormalizedRequest, NormalizedResponse, dataLayer } from "../api";

export async function getTeams(request: NormalizedRequest): Promise<NormalizedResponse> {
    try {
        const sportId = request.query?.sportId;
        const teams = await dataLayer.getTeams(sportId);
        return {
            statusCode: 200,
            body: { teams }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: 'Failed to fetch teams' }
        };
    }
}

export async function getTeamById(request: NormalizedRequest): Promise<NormalizedResponse> {
    try {
        const id = request.path.split('/').pop();
        if (!id) {
            return {
                statusCode: 400,
                body: { error: 'Team ID is required' }
            };
        }

        const team = await dataLayer.getTeamById(id);
        if (!team) {
            return {
                statusCode: 404,
                body: { error: 'Team not found' }
            };
        }

        return {
            statusCode: 200,
            body: { team }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: 'Failed to fetch team' }
        };
    }
}
