import { APIResponse, PaginatedData, TypedQuery } from "@api-types/general.types";
import { Item } from "@prisma/client";
import { EditItemType } from "@schemas/item.schemas";
import * as ItemService from "@services/item.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Item[]>>) {
  const response = await ItemService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

type GetAllPaginatedQuery = TypedQuery<{
  page?: string;
  limit?: string;
  search?: string;
}>;

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function getAllPaginated(
  req: Request<{}, APIResponse<PaginatedData<Item>>, {}, GetAllPaginatedQuery>,
  res: Response<APIResponse<PaginatedData<Item>>>,
) {
  const pageParam = firstQueryValue(req.query.page);
  const limitParam = firstQueryValue(req.query.limit);
  const searchParam = firstQueryValue(req.query.search);

  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(limitParam || "20", 10)));
  const search = searchParam?.trim() || undefined;

  const response = await ItemService.getAllPaginated(page, limit, search);

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
