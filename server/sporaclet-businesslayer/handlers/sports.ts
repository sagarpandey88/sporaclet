import { NormalizedRequest, NormalizedResponse, dataLayer } from "../api";

export async function getSports(request: NormalizedRequest): Promise<NormalizedResponse> {
    try {
        const sports = await dataLayer.getAllSports();
        return {
            statusCode: 200,
            body: { sports }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: 'Failed to fetch sports' }
        };
    }
}

export async function getSportById(request: NormalizedRequest): Promise<NormalizedResponse> {
    try {
        const id = request.path.split('/').pop();
        if (!id) {
            return {
                statusCode: 400,
                body: { error: 'Sport ID is required' }
            };
        }

        const sport = await dataLayer.getSportById(id);
        if (!sport) {
            return {
                statusCode: 404,
                body: { error: 'Sport not found' }
            };
        }

        return {
            statusCode: 200,
            body: { sport }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: 'Failed to fetch sport' }
        };
    }
}
