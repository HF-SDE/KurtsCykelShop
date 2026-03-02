import { APIResponse, PaginatedData, TypedQuery } from "@api-types/general.types";
import { Location } from "@prisma/client";
import { EditLocationType } from "@schemas/location.schema";
import * as LocationService from "@services/location.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Location[]>>) {
  const response = await LocationService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function getAllPaginated(
  req: Request<{}, APIResponse<PaginatedData<Location>>, {}, TypedQuery<{ page: string; limit: string }>>,
  res: Response<APIResponse<PaginatedData<Location>>>,
) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));

  const response = await LocationService.getAllPaginated(page, limit);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function createOne(req: Request, res: Response<APIResponse<Location>>) {
  const response = await LocationService.createOne(req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function updateOne(
  req: Request<{ id: string }, APIResponse<Location>, EditLocationType>,
  res: Response<APIResponse<Location>>,
) {
  const { id } = req.params;
  const response = await LocationService.updateOne(id, req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function deleteOne(req: Request<{ id: string }, APIResponse<void>>, res: Response<APIResponse<void>>) {
  const { id } = req.params;
  const response = await LocationService.deleteOne(id);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
