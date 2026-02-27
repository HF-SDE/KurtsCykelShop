import { APIResponse, PaginatedData, Status, TypedQuery } from "@api-types/general.types";
import { Customer, Item, Prisma, ServiceOrder, ServicePartsUsed, ServiceRepair, User } from "@prisma/client";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response, response } from "express";
import { types } from "node:util";
import { T } from "node_modules/@faker-js/faker/dist/airline-Dz1uGqgJ";
import z from "zod";
import da from "zod/v4/locales/da.js";

import * as ServiceOrderService from "../services/serviceOrder.service";
import { ServiceOrdersData } from "../services/serviceOrder.service";

interface PaginatedServiceOrdersQuery {
  page?: string;
  limit?: string;
  search?: string;
  statuses?: string;
  timeRange?: string;
}

/**
 * Get paginated service orders with filters
 * @param {Request} req - The request object with query parameters
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function getAllServiceOrdersPaginated(
  req: Request<{}, APIResponse<PaginatedData<ServiceOrdersData>>, {}, TypedQuery<PaginatedServiceOrdersQuery>>,
  res: Response<APIResponse<PaginatedData<ServiceOrdersData>>>,
): Promise<void> {
  const search = req.query.search;
  const statuses = req.query.statuses;
  const timeRange = req.query.timeRange;
  const page = req.query.page;
  const limit = req.query.limit;

  const [data, error] = await ServiceOrderService.GetAllServiceOrdersPaginated({
    page,
    limit,
    search,
    statuses,
    timeRange,
  });

  if (error) {
    res.status(getHttpStatusCode(Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to fetch paginated service orders",
    });
    return;
  }

  res.status(getHttpStatusCode(Status.Success)).json({
    status: Status.Success,
    message: "Paginated service orders fetched successfully",
    data,
  });
}

interface GetServiceOrderByIdParams {
  id?: string;
}

export async function getServiceOrderById(
  req: Request<GetServiceOrderByIdParams, APIResponse<ServiceOrderService.GetServiceOrderByIdResponse>, {}, {}>,
  res: Response<APIResponse<ServiceOrderService.GetServiceOrderByIdResponse>>,
): Promise<void> {
  const id = req.params.id;

  // Get service order by id
  const [data, error] = await ServiceOrderService.GetServiceOrderById(id);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to fetch service order by ID",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: "Service order fetched successfully",
      data,
    })
    .end();
}

interface UpdateServiceOrderParams {
  id?: string;
}

/**
 * Create a new service order
 * @param {Request} req - The request object with service order data in body
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function createServiceOrder(
  req: Request<{}, APIResponse<ServiceOrder>, {}, {}>,
  res: Response<APIResponse<ServiceOrder>>,
): Promise<void> {
  const userId = req.user?.id;
  const body = req.body;

  const [data, error] = await ServiceOrderService.CreateServiceOrder(body, userId);

  if (error) {
    const statusCode = getHttpStatusCode(error.status || Status.Failed);
    res.status(statusCode).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to create service order",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Created))
    .json({
      status: Status.Created,
      message: "Service order created successfully",
      data,
    })
    .end();
}

/**
 * Update a service order
 * @param {Request} req - The request object with id in params and update data in body
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function updateServiceOrder(
  req: Request<UpdateServiceOrderParams, APIResponse<ServiceOrder>, {}, {}>,
  res: Response<APIResponse<ServiceOrder>>,
): Promise<void> {
  const id = req.params.id;
  const updateData = req.body;
  const userId = req.user?.id;

  // Update service order
  const [data, error] = await ServiceOrderService.UpdateServiceOrder(id, updateData, userId);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to update service order",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: "Service order updated successfully",
      data,
    })
    .end();
}
