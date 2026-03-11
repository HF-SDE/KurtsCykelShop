import { APIResponse, Status } from "@api-types/general.types";
import { ServicePartsUsed } from "@prisma/client";
import * as ServicePartsUsedService from "@services/servicePartsUsed.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

interface CreateServicePartUsedParams {
  serviceOrderId?: string;
}

/**
 * Create a new service part used entry under a service order
 * @param {Request} req - The request object with serviceOrderId in params and part data in body
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function createServicePartUsed(
  req: Request<CreateServicePartUsedParams, APIResponse<ServicePartsUsed>, {}, {}>,
  res: Response<APIResponse<ServicePartsUsed>>,
): Promise<void> {
  const serviceOrderId = req.params.serviceOrderId;
  const partData = req.body;
  const createdById = req.user?.id;

  const [error, data] = await ServicePartsUsedService.createServicePartUsed(serviceOrderId, partData, createdById);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to create service part used entry",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: "Service part used entry created successfully",
      data,
    })
    .end();
}
