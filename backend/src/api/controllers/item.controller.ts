import { APIResponse, PaginatedData, Status, TypedQuery } from "@api-types/general.types";
import { Item } from "@prisma/client";
import { EditItemType, ItemFiltersType } from "@schemas/item.schemas";
import * as ItemService from "@services/item.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Item[]>>) {
  const response = await ItemService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

type GetAllPaginatedQuery = TypedQuery<
  {
    page?: string;
    limit?: string;
    search?: string;
  } & ItemFiltersType
>;

export async function getAllPaginated(
  req: Request<{}, APIResponse<PaginatedData<Item>>, {}, GetAllPaginatedQuery>,
  res: Response<APIResponse<PaginatedData<Item>>>,
) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const search = req.query.search?.trim() || undefined;

  const filters: ItemFiltersType = {
    isPublic: req.query.isPublic,
    statusId: req.query.statusId,
    locationId: req.query.locationId,
    vendorId: req.query.vendorId,
  };

  const response = await ItemService.getAllPaginated(page, limit, search, filters);

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

interface GetItemByIdParams {
  id?: string;
}

/**
 * Get item by ID
 * @param {Request} req - The request object with ID parameter
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function getById(
  req: Request<GetItemByIdParams, APIResponse<Item>, {}, {}>,
  res: Response<APIResponse<Item>>,
): Promise<void> {
  const id = req.params.id;

  // Get item by id
  const [data, error] = await ItemService.getById(id);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to fetch item by ID",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: "Item fetched successfully",
      data,
    })
    .end();
}

interface GetItemByBarcodeQuery {
  barcode?: string;
}

/**
 * Get item by barcode
 * @param {Request} req - The request object with barcode query parameter
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function getByBarcode(
  req: Request<{}, APIResponse<Item>, {}, TypedQuery<GetItemByBarcodeQuery>>,
  res: Response<APIResponse<Item>>,
): Promise<void> {
  const barcode = req.query.barcode;

  // Get item by barcode
  const [data, error] = await ItemService.getByBarcode(barcode);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to fetch item by barcode",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: "Item fetched successfully",
      data,
    })
    .end();
}

interface GetItemsBySearchQuery {
  search?: string;
}

/**
 * Get items by search query
 * @param {Request} req - The request object with search query parameter
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function getBySearchQuery(
  req: Request<{}, APIResponse<Item[]>, {}, TypedQuery<GetItemsBySearchQuery>>,
  res: Response<APIResponse<Item[]>>,
): Promise<void> {
  const search = req.query.search;

  // Get items by search query
  const [data, error] = await ItemService.getBySearchQuery(search);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to fetch items by search query",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: data.length > 0 ? "Items fetched successfully" : "No items found matching the search query",
      data,
    })
    .end();
}
