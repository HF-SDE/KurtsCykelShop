import { APIResponse, PaginatedData, TypedQuery } from "@api-types/general.types";
import { Location } from "@prisma/client";
import * as ItemStatus from "@services/itemStatus.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Location[]>>) {
  const response = await ItemStatus.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function getAllPaginated(
  req: Request<{}, APIResponse<PaginatedData<Location>>, {}, TypedQuery<{ page: string; limit: string }>>,
  res: Response<APIResponse<PaginatedData<Location>>>,
) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));

  const response = await ItemStatus.getAllPaginated(page, limit);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
