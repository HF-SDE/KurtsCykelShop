import { AppError, EitherDataOrError, ValidationError } from "@api-types/error.types";
import { Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { ServiceRepair } from "@prisma/client";
import { UuidSchema } from "@schemas/general.schemas";
import { AddRepairSchema } from "@schemas/serviceOrder.schemas";
import z from "zod";

/**
 * Create a new service repair under a service order
 * @param {any} serviceOrderId - The ID of the service order
 * @param {any} data - The repair data
 * @param {any} createdById - The ID of the user creating the repair
 * @returns {Promise<EitherDataOrError<ServiceRepair, ValidationError | AppError>>} Tuple of [data, error] for clean destructuring
 */
export async function createServiceRepair(
  serviceOrderId: any,
  data: any,
  createdById: any,
): Promise<EitherDataOrError<ServiceRepair, ValidationError | AppError>> {
  // Validate serviceOrderId
  const serviceOrderIdValidation = UuidSchema.safeParse(serviceOrderId);
  if (!serviceOrderIdValidation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid service order ID",
      },
    ];
  }

  // Validate createdById
  const createdByIdValidation = UuidSchema.safeParse(createdById);
  if (!createdByIdValidation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid user ID",
      },
    ];
  }

  // Validate the repair data
  const validation = AddRepairSchema.safeParse(data);
  if (!validation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid repair data",
        fieldErrors: z.flattenError(validation.error).fieldErrors,
      },
    ];
  }

  try {
    // Check if the service order exists
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderIdValidation.data },
    });

    if (!serviceOrder) {
      return [
        null,
        {
          status: Status.NotFound,
          message: "Service order not found",
        },
      ];
    }

    // Create the service repair
    const serviceRepair = await prisma.serviceRepair.create({
      data: {
        serviceOrderId: serviceOrderIdValidation.data,
        title: validation.data.title,
        description: validation.data.description,
        createdById: createdByIdValidation.data,
      },
    });

    return [serviceRepair, null];
  } catch (error) {
    console.error("Error creating service repair:", error);
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to create service repair",
        details: error,
      },
    ];
  }
}
