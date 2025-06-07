import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import handler from "../../../sporaclet-businesslayer/api/index";

export async function getdata(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Normalize the Azure request to the business layer format
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, ""); // Remove '/api' prefix if present
    
    // Extract query parameters
    const query: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) {
        query[key] = value;
    }

    // Handle request body for POST/PUT/PATCH requests
    let body: any = undefined;
    try {
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            body = await request.json();
        }
    } catch (e) {
        // Ignore body if not JSON
    }

    const normalizedRequest = { method, path, body, query };
    const result = await handler(normalizedRequest);

    return {
        status: result.statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.body)
    };
};

app.http('getdata', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: getdata
});
