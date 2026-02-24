import { APIResponse, PaginatedData, TypedQuery } from "@api-types/general.types";
import { Item } from "@prisma";
import { EditItemType } from "@schemas/item.schemas";
import * as ItemService from "@services/item.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Item[]>>) {
  const response = await ItemService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function getAllPaginated(
  req: Request<{}, APIResponse<PaginatedData<Item>>, {}, TypedQuery<{ page: string; limit: string }>>,
  res: Response<APIResponse<PaginatedData<Item>>>,
) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));

  const response = await ItemService.getAllPaginated(page, limit);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function createOne(req: Request, res: Response<APIResponse<Item>>) {
  const response = await ItemService.createOne(req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function updateOne(
  req: Request<{ id: string }, APIResponse<Item>, EditItemType>,
  res: Response<APIResponse<Item>>,
) {
  const { id } = req.params;
  const response = await ItemService.updateOne(id, req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
