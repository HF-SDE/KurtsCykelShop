import { APIResponse, PaginatedData, TypedQuery } from "@api-types/general.types";
import { Vendor } from "@prisma/client";
import * as VendorService from "@services/vendor.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Vendor[]>>) {
  const response = await VendorService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function getAllPaginated(
  req: Request<{}, APIResponse<PaginatedData<Vendor>>, {}, TypedQuery<{ page: string; limit: string }>>,
  res: Response<APIResponse<PaginatedData<Vendor>>>,
) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));

  const response = await VendorService.getAllPaginated(page, limit);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
