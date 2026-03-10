import { AppError, EitherDataOrError, ValidationError } from "@api-types/error.types";
import { Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { ServicePartsUsed } from "@prisma/client";
import { UuidSchema } from "@schemas/general.schemas";
import { AddPartSchema } from "@schemas/serviceOrder.schemas";
import z from "zod";

/**
 * Create a new service part used entry under a service order
 * This also creates an inventory transaction and updates item quantity
 * @param {any} serviceOrderId - The ID of the service order
 * @param {any} data - The part data (itemId, quantity)
 * @param {any} createdById - The ID of the user creating the entry
 * @returns {Promise<EitherDataOrError<ServicePartsUsed, ValidationError | AppError>>} Tuple of [data, error] for clean destructuring
 */
export async function createServicePartUsed(
  serviceOrderId: any,
  data: any,
  createdById: any,
): Promise<EitherDataOrError<ServicePartsUsed, ValidationError | AppError>> {
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

  // Validate the part data
  const validation = AddPartSchema.safeParse(data);
  if (!validation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid part data",
        fieldErrors: z.flattenError(validation.error).fieldErrors,
      },
    ];
  }

  const { itemId, quantity } = validation.data;

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

    // Check if the item exists and get its details
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return [
        null,
        {
          status: Status.NotFound,
          message: "Item not found",
        },
      ];
    }

    // Check if item has sufficient quantity
    if (item.quantity < quantity) {
      return [
        null,
        {
          status: Status.Failed,
          message: `Insufficient inventory. Available: ${item.quantity}, Requested: ${quantity}`,
        },
      ];
    }

    // Get user details for performedByName
    const user = await prisma.user.findUnique({
      where: { id: createdByIdValidation.data },
      select: { firstName: true, lastName: true },
    });

    if (!user) {
      return [
        null,
        {
          status: Status.NotFound,
          message: "User not found",
        },
      ];
    }

    // Get or create ReferenceType for ServiceOrder
    let referenceType = await prisma.referenceType.findUnique({
      where: { name: "ServiceOrder" },
    });

    if (!referenceType) {
      referenceType = await prisma.referenceType.create({
        data: { name: "ServiceOrder" },
      });
    }

    // Create the service part used entry, inventory transaction, and update item quantity in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ServicePartsUsed entry
      const servicePartUsed = await tx.servicePartsUsed.create({
        data: {
          serviceOrderId: serviceOrderIdValidation.data,
          itemId,
          quantity,
        },
      });

      // Create InventoryTransaction
      await tx.inventoryTransaction.create({
        data: {
          itemId,
          locationId: item.locationId,
          type: "USAGE",
          quantityChange: -quantity, // Negative because inventory is decreasing
          unitId: item.unitId,
          referenceTypeId: referenceType!.id,
          referenceId: serviceOrderIdValidation.data,
          performedById: createdByIdValidation.data,
          performedByName: `${user!.firstName} ${user!.lastName}`,
        },
      });

      // Update item quantity
      await tx.item.update({
        where: { id: itemId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      return servicePartUsed;
    });

    return [result, null];
  } catch (error) {
    console.error("Error creating service part used:", error);
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to create service part used entry",
        details: error,
      },
    ];
  }
}
