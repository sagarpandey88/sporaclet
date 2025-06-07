import { DataAccessLayer } from "sporaclet-azure-dblayer";

// Type definitions for normalized request/response
export type NormalizedRequest = {
  method: string;
  path: string;
  body?: any;
  query?: Record<string, string>;
};

export type NormalizedResponse = {
  statusCode: number;
  body: any;
};

// Individual endpoint handlers type
export type HandlerFn = (request: NormalizedRequest) => Promise<NormalizedResponse>;

// Import handlers from handlers folder
import postCreate from "../handlers/postCreate";
import getGet from "../handlers/getGet";
import { getSports, getSportById } from "../handlers/sports";
import { getTeams, getTeamById } from "../handlers/teams";
import { getEvents, getEventById } from "../handlers/events";

// Initialize data access layer
export const dataLayer = new DataAccessLayer();

// Mapping of (method path) to handler
const routeMap: Record<string, HandlerFn> = {
  'POST /create': postCreate,
  'GET /get': getGet,
  'GET /sports': getSports,
  'GET /sports/:id': getSportById,
  'GET /teams': getTeams,
  'GET /teams/:id': getTeamById,
  'GET /events': getEvents,
  'GET /events/:id': getEventById,
};

// Platform-agnostic handler
export default async function handler(request: NormalizedRequest): Promise<NormalizedResponse> {
  const key = `${request.method.toUpperCase()} ${request.path.split('?')[0]}`;
  const fn = routeMap[key];
  if (fn) {
    return await fn(request);
  }
  return { statusCode: 404, body: { error: 'Not found' } };
}