import { NormalizedRequest, NormalizedResponse } from "../api/index";

const postCreate = async (request: NormalizedRequest): Promise<NormalizedResponse> => {
  // In-memory data store (imported from api/index)
  // @ts-ignore
  if (!global._data) global._data = [];
  if (!request.body || !request.body.item) {
    return { statusCode: 400, body: { error: 'Missing item in request body' } };
  }
  // @ts-ignore
  global._data.push(request.body.item);
  return { statusCode: 201, body: { message: 'Item created', item: request.body.item } };
};

export default postCreate;
