import { APIResponse, Status, TypedQuery } from "@api-types/general.types";
import { Customer, Prisma, ServiceOrder, ServicePartsUsed, ServiceRepair, User } from "@prisma/client";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response, response } from "express";
import z from "zod";
import da from "zod/v4/locales/da.js";

import * as ServiceOrderService from "../services/serviceOrder.service";
import { PaginatedServiceOrders } from "../services/serviceOrder.service";

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
  req: Request<{}, APIResponse<PaginatedServiceOrders>, {}, TypedQuery<PaginatedServiceOrdersQuery>>,
  res: Response<APIResponse<PaginatedServiceOrders>>,
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const search = req.query.search || undefined;
    const timeRange = (req.query.timeRange as "all" | "today" | "week" | "month" | "quarter" | "year") || undefined;

    // Parse statuses from comma-separated string or array
    let statuses: ("completed" | "cancelled" | "in-progress" | "pending")[] | undefined;
    if (req.query.statuses) {
      const statusesParam = req.query.statuses;
      if (Array.isArray(statusesParam)) {
        statuses = statusesParam as ("completed" | "cancelled" | "in-progress" | "pending")[];
      } else if (typeof statusesParam === "string") {
        statuses = statusesParam.split(",") as ("completed" | "cancelled" | "in-progress" | "pending")[];
      }
    }

    const schema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      timeRange: z.enum(["all", "today", "week", "month", "quarter", "year"]).optional(),
      statuses: z.string().optional(),
    });

    const parseResult = schema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(getHttpStatusCode(Status.InvalidDetails)).json({
        status: Status.InvalidDetails,
        message: parseResult.error.message,
        errors: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.message,
          fieldErrors: z.flattenError(parseResult.error).fieldErrors,
        },
      });
      return;
    }

    const [data, error] = await ServiceOrderService.GetAllServiceOrdersPaginated({
      page,
      limit,
      search,
      statuses,
      timeRange,
    });

    if (error) {
      res.status(getHttpStatusCode(Status.Failed)).json({
        status: Status.Failed,
        message: "Failed to fetch paginated service orders.",
      });
      return;
    }

    res.status(getHttpStatusCode(Status.Success)).json({
      status: Status.Success,
      message: "Paginated service orders fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching paginated service orders:", error);
    res.status(getHttpStatusCode(Status.Failed)).json({
      status: Status.Failed,
      message:
        "Failed to fetch paginated service orders from db- " + (error instanceof Error ? error.message : String(error)),
    });
  }
}

interface GetServiceOrderByIdParams {
  id?: string;
}
interface GetServiceOrderByIdResponse extends ServiceOrder {
  customer: Customer | null;
  assignedTo: Omit<User, "password"> | null;
  assignedBy: Omit<User, "password"> | null;
  servicePartsUsed: ServicePartsUsed[];
  serviceRepairs: ServiceRepair[];
}

export async function getServiceOrderById(
  req: Request<GetServiceOrderByIdParams, APIResponse<GetServiceOrderByIdResponse>, {}, {}>,
  res: Response<APIResponse<GetServiceOrderByIdResponse>>,
): Promise<void> {
  try {
    const id = req.params.id;

    if (!id) {
      res.status(getHttpStatusCode(Status.MissingDetails)).json({
        status: Status.MissingDetails,
        message: "Service order ID is required",
      });
      return;
    }

    // Get service order by id
    const [data, error] = await ServiceOrderService.GetServiceOrderById(id);

    if (error) {
      if (error.code === "NOT_FOUND") {
        res.status(getHttpStatusCode(Status.NotFound)).json({
          status: Status.NotFound,
          message: "Service order not found",
        });
      } else {
        res.status(getHttpStatusCode(Status.Failed)).json({
          status: Status.Failed,
          message: "Failed to fetch service order by ID",
        });
      }
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
  } catch (error) {
    console.error("Error fetching service order by ID:", error);
    res.status(getHttpStatusCode(Status.Failed)).json({
      status: Status.Failed,
      message: "Failed to fetch service order by ID",
    });
  }
}
