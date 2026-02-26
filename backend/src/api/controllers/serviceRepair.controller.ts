import { APIResponse, Status } from "@api-types/general.types";
import { ServiceRepair } from "@prisma/client";
import * as ServiceRepairService from "@services/serviceRepairs.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

interface CreateServiceRepairParams {
  serviceOrderId?: string;
}

/**
 * Create a new service repair under a service order
 * @param {Request} req - The request object with serviceOrderId in params and repair data in body
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export async function createServiceRepair(
  req: Request<CreateServiceRepairParams, APIResponse<ServiceRepair>, {}, {}>,
  res: Response<APIResponse<ServiceRepair>>,
): Promise<void> {
  const serviceOrderId = req.params.serviceOrderId;
  const repairData = req.body;
  const createdById = req.user?.id;

  const [data, error] = await ServiceRepairService.createServiceRepair(serviceOrderId, repairData, createdById);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to create service repair",
    });
    return;
  }

  res
    .status(getHttpStatusCode(Status.Success))
    .json({
      status: Status.Success,
      message: "Service repair created successfully",
      data,
    })
    .end();
}
