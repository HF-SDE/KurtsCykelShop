import { err, ok } from "@api-types/error.types";
import { PaginatedData, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Customer, Item, Prisma, ServiceOrder, ServicePartsUsed, ServiceRepair, User } from "@prisma/client";
import { StringOrNumberSchema, UuidSchema } from "@schemas/general.schemas";
import {
  ServiceOrderCreateSchema,
  ServiceOrderUpdateSchema,
  ServiceOrdersPaginatedSchema,
} from "@schemas/serviceOrder.schemas";
import z from "zod";

import * as CustomerService from "./customer.service";

interface GetAllServiceOrdersPaginatedParams {
  search?: any;
  statuses?: any;
  timeRange?: any;
  page?: any;
  limit?: any;
}

export interface ServiceOrdersData extends ServiceOrder {
  customer: Customer;
  assignedTo: Omit<User, "password"> | null;
  assignedBy: Omit<User, "password"> | null;
  servicePartsUsed: ServicePartsUsed[];
  serviceRepairs: ServiceRepair[];
}

export async function GetAllServiceOrdersPaginated(params: GetAllServiceOrdersPaginatedParams) {
  // convert params.statuses to array
  if (params.statuses && typeof params.statuses === "string") {
    params.statuses = params.statuses.split(",").map((s: string) => s.trim());
  }

  const parseResult = ServiceOrdersPaginatedSchema.safeParse({ ...params });

  if (!parseResult.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid query parameters",
      fieldErrors: z.flattenError(parseResult.error).fieldErrors,
    });
  }

  const { search, statuses, timeRange, page = 1, limit = 20 } = parseResult.data;

  try {
    const skip = (page - 1) * limit;

    // Build where query with filters
    const whereQuery: any = {};

    // Search filter - search in description and customer name
    if (search) {
      whereQuery.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Status filter
    if (statuses && statuses.length > 0) {
      whereQuery.status = {
        in: statuses,
      };
    }

    // Time range filter
    if (timeRange && timeRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      whereQuery.createdAt = {
        gte: startDate,
      };
    }

    // Get paginated service orders with optional filters
    const [serviceOrders, total] = await prisma.$transaction([
      prisma.serviceOrder.findMany({
        where: whereQuery,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          assignedBy: true,
          assignedTo: true,
          servicePartsUsed: true,
          serviceRepairs: true,
        },
      }),
      prisma.serviceOrder.count({ where: whereQuery }),
    ]);

    const data = {
      data: serviceOrders,
      total,
      page,
      hasMore: skip + serviceOrders.length < total,
    };
    return ok(data);
  } catch (error) {
    console.error("Error fetching paginated service orders:", error);
    return err({
      status: Status.Failed,
      message: "Failed to fetch paginated service orders",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
interface ServicePartsUsedWithItem extends ServicePartsUsed {
  item: Item;
}
export interface GetServiceOrderByIdResponse extends ServiceOrder {
  customer: Customer | null;
  assignedTo: Omit<User, "password"> | null;
  assignedBy: Omit<User, "password"> | null;
  servicePartsUsed: ServicePartsUsed[];
  serviceRepairs: ServiceRepair[];
  servicePartsUsedWithItem: ServicePartsUsedWithItem[];
}

/**
 * Get a single service order by ID with all related data
 * @param {string} id - The service order ID (UUID)
 * @returns {Promise<EitherDataOrError<GetServiceOrderByIdResponse, AppError>>} Tuple of [data, error] for clean destructuring
 */
export async function GetServiceOrderById(id: any) {
  const parseResult = z.uuid().safeParse(id);

  if (!parseResult.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid service order ID",
    });
  }

  try {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTo: true,
        assignedBy: true,
        servicePartsUsed: {
          include: { item: true },
        },
        serviceRepairs: true,
      },
    });

    if (!serviceOrder) {
      return err({
        status: Status.NotFound,
        message: "Service order not found",
      });
    }

    // Process data...
    const assignedTo = serviceOrder.assignedTo ? (({ password, ...rest }) => rest)(serviceOrder.assignedTo) : null;
    const assignedBy = (({ password, ...rest }) => rest)(serviceOrder.assignedBy);

    const response: GetServiceOrderByIdResponse = {
      ...serviceOrder,
      assignedTo: assignedTo as Omit<User, "password"> | null,
      assignedBy: assignedBy as Omit<User, "password">,
      servicePartsUsedWithItem: serviceOrder.servicePartsUsed.map((spu) => ({
        ...spu,
        item: spu.item,
      })),
    };

    return ok(response);
  } catch (error) {
    console.error("Error fetching service order by ID:", error);
    return err({
      status: Status.Failed,
      message: "Failed to fetch service order from db- " + (error instanceof Error ? error.message : String(error)),
      details: error,
    });
  }
}

/**
 * Update a service order
 * @param {any} id - The service order ID (UUID)
 * @param {any} data - The update data
 * @param {any} userId - The ID of the user making the change
 * @returns {Promise<EitherDataOrError<ServiceOrder, AppError | ValidationError>>} Tuple of [data, error] for clean destructuring
 */
export async function UpdateServiceOrder(id: any, data: any, userId: any) {
  // Validate id
  const idValidation = UuidSchema.safeParse(id);
  if (!idValidation.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid service order ID",
    });
  }

  // Validate userId
  const userIdValidation = UuidSchema.safeParse(userId);
  if (!userIdValidation.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid user ID",
    });
  }

  // Validate update data
  const validation = ServiceOrderUpdateSchema.safeParse(data);
  if (!validation.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid update data",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    });
  }

  try {
    // Check if the service order exists
    const existingServiceOrder = await prisma.serviceOrder.findUnique({
      where: { id: idValidation.data },
    });

    if (!existingServiceOrder) {
      return err({
        status: Status.NotFound,
        message: "Service order not found",
      });
    }

    // Get the user making the change for logging
    const changingUser = await prisma.user.findUnique({
      where: { id: userIdValidation.data },
      select: { firstName: true, lastName: true },
    });

    if (!changingUser) {
      return err({
        status: Status.NotFound,
        message: "User not found",
      });
    }

    const changedByName = `${changingUser.firstName} ${changingUser.lastName}`;

    // If assignedToId is provided, verify the user exists
    if (validation.data.assignedToId !== undefined && validation.data.assignedToId !== null) {
      const user = await prisma.user.findUnique({
        where: { id: validation.data.assignedToId },
      });

      if (!user) {
        return err({
          status: Status.NotFound,
          message: "Assigned user not found",
        });
      }
    }

    // Prepare update data and log entries
    const updateData: any = {};
    const logEntries: Array<{
      tableField: string;
      oldValue: string | null;
      newValue: string | null;
    }> = [];

    if (validation.data.description !== undefined) {
      updateData.description = validation.data.description;
      logEntries.push({
        tableField: "description",
        oldValue: existingServiceOrder.description,
        newValue: validation.data.description,
      });
    }

    if (validation.data.status !== undefined) {
      updateData.status = validation.data.status;
      logEntries.push({
        tableField: "status",
        oldValue: existingServiceOrder.status,
        newValue: validation.data.status,
      });

      // Auto-set completedAt when status changes to completed
      if (validation.data.status === "completed" && !existingServiceOrder.completedAt) {
        updateData.completedAt = new Date();
        logEntries.push({
          tableField: "completedAt",
          oldValue: null,
          newValue: updateData.completedAt.toISOString(),
        });
      }
    }

    if (validation.data.estimatedCompletion !== undefined) {
      updateData.estimatedCompletion = new Date(validation.data.estimatedCompletion);
      logEntries.push({
        tableField: "estimatedCompletion",
        oldValue: existingServiceOrder.estimatedCompletion.toISOString(),
        newValue: updateData.estimatedCompletion.toISOString(),
      });
    }

    if (validation.data.assignedToId !== undefined) {
      updateData.assignedToId = validation.data.assignedToId;
      if (existingServiceOrder.status == "pending") updateData.status = "in-progress";

      logEntries.push({
        tableField: "assignedToId",
        oldValue: existingServiceOrder.assignedToId ?? null,
        newValue: validation.data.assignedToId ?? null,
      });
    }

    // Update the service order and create logs in a transaction
    const updatedServiceOrder = await prisma.$transaction(async (tx) => {
      // Update the service order
      const updated = await tx.serviceOrder.update({
        where: { id: idValidation.data },
        data: updateData,
      });

      // Create log entries for each changed field
      if (logEntries.length > 0) {
        await tx.serviceOrderLog.createMany({
          data: logEntries.map((entry) => ({
            serviceOrderId: idValidation.data,
            tableField: entry.tableField,
            oldValue: entry.oldValue,
            newValue: entry.newValue,
            changedById: userIdValidation.data,
            changedByName,
          })),
        });
      }

      return updated;
    });

    return ok(updatedServiceOrder);
  } catch (error) {
    console.error("Error updating service order:", error);
    return err({
      status: Status.Failed,
      message: "Failed to update service order",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Create a new service order.
 * If customerId is provided, uses existing customer.
 * Otherwise creates a new customer from the provided details.
 * @param data - The creation data
 * @param userId - The ID of the user creating the order (assignedBy)
 * @returns {Promise<EitherDataOrError<ServiceOrder, AppError | ValidationError>>}
 */
export async function CreateServiceOrder(data: any, userId: any) {
  // Validate userId
  const userIdValidation = UuidSchema.safeParse(userId);
  if (!userIdValidation.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid user ID",
      fieldErrors: { userId: ["Invalid UUID format"] },
    });
  }

  // Validate creation data
  const validation = ServiceOrderCreateSchema.safeParse(data);
  if (!validation.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid service order data",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    });
  }

  const validData = validation.data;

  try {
    let customerId: string;

    if (validData.customerId) {
      // Verify customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: validData.customerId },
      });

      if (!existingCustomer) {
        return err({
          status: Status.NotFound,
          message: "Customer not found",
        });
      }

      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const [customerError, newCustomer] = await CustomerService.CreateCustomer({
        firstName: validData.customerFirstName!,
        lastName: validData.customerLastName!,
        email: validData.customerEmail!,
        phone: validData.customerPhone,
      });

      if (customerError) {
        return err({
          status: customerError.status,
          message: customerError.message,
        });
      }

      customerId = newCustomer.id;
    }

    // If assignedToId is provided, verify the user exists
    if (validData.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: validData.assignedToId },
      });

      if (!assignedUser) {
        return err({
          status: Status.NotFound,
          message: "Assigned user not found",
        });
      }
    }

    // Determine initial status
    const initialStatus = validData.assignedToId ? "in-progress" : "pending";

    // Create the service order
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        customerId,
        description: validData.description,
        estimatedCompletion: new Date(validData.estimatedCompletion),
        assignedToId: validData.assignedToId || null,
        assignedById: userIdValidation.data,
        status: initialStatus,
      },
      include: {
        customer: true,
        assignedTo: true,
        assignedBy: true,
      },
    });

    return ok(serviceOrder);
  } catch (error) {
    console.error("Error creating service order:", error);
    return err({
      status: Status.CreationFailed,
      message: "Failed to create service order",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
