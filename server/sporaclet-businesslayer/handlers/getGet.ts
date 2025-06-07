import { NormalizedRequest, NormalizedResponse } from "../api/index";

const getGet = async (_request: NormalizedRequest): Promise<NormalizedResponse> => {
  // In-memory data store (imported from api/index)
  // @ts-ignore
  if (!global._data) global._data = [];
  // @ts-ignore
  return { statusCode: 200, body: { items: global._data } };
};

export default getGet;
