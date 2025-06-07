import { NormalizedRequest, NormalizedResponse, dataLayer } from "../api";

export async function getEvents(request: NormalizedRequest): Promise<NormalizedResponse> {
    try {
        const filters = {
            sportId: request.query?.sportId,
            featured: request.query?.featured === 'true',
            status: request.query?.status,
            fromDate: request.query?.fromDate ? new Date(request.query.fromDate) : undefined,
            toDate: request.query?.toDate ? new Date(request.query.toDate) : undefined
        };

        const events = await dataLayer.getEvents(filters);
        return {
            statusCode: 200,
            body: { events }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: 'Failed to fetch events' }
        };
    }
}

export async function getEventById(request: NormalizedRequest): Promise<NormalizedResponse> {
    try {
        const id = request.path.split('/').pop();
        if (!id) {
            return {
                statusCode: 400,
                body: { error: 'Event ID is required' }
            };
        }

        const event = await dataLayer.getEventById(id);
        if (!event) {
            return {
                statusCode: 404,
                body: { error: 'Event not found' }
            };
        }

        return {
            statusCode: 200,
            body: { event }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: 'Failed to fetch event' }
        };
    }
}
