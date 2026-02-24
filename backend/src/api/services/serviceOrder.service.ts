import { AppError, EitherDataOrError } from "@api-types/error.types";
import { APIResponse, Status } from "@api-types/general.types";
import { Customer, Prisma, ServiceOrder, ServicePartsUsed, ServiceRepair, User } from "@prisma";
import prisma from "@prisma-instance";

export interface PaginatedServiceOrders {
  items: ServiceOrderWithRelations[];
  total: number;
  page: number;
  hasMore: boolean;
}

type ServiceOrderWithRelations = Prisma.ServiceOrderGetPayload<{
  include: {
    customer: true;
    assignedTo: true;
    servicePartsUsed: true;
    serviceRepairs: true;
  };
}>;

interface GetAllServiceOrdersPaginatedParams {
  search?: string;
  statuses?: Array<"completed" | "cancelled" | "in-progress" | "pending">;
  timeRange?: "all" | "today" | "week" | "month" | "quarter" | "year";
  page?: number;
  limit?: number;
}

/**
 * Get paginated service orders with optional filters
 * @param {GetAllServiceOrdersPaginatedParams} params - The filter and pagination parameters
 * @returns {Promise<EitherDataOrError<PaginatedServiceOrders, AppError>>} Tuple of [data, error] for clean destructuring
 */
export async function GetAllServiceOrdersPaginated(
  params: GetAllServiceOrdersPaginatedParams,
): Promise<EitherDataOrError<PaginatedServiceOrders>> {
  try {
    const { search, statuses, timeRange, page = 1, limit = 20 } = params;
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
          assignedTo: true,
          servicePartsUsed: true,
          serviceRepairs: true,
        },
      }),
      prisma.serviceOrder.count({ where: whereQuery }),
    ]);

    return [
      {
        items: serviceOrders,
        total,
        page,
        hasMore: skip + serviceOrders.length < total,
      },
      null,
    ];
  } catch (error) {
    console.error("Error fetching paginated service orders:", error);
    return [
      null,
      {
        code: "DATABASE_ERROR",
        message: "Failed to fetch paginated service orders",
        details: error,
      },
    ];
  }
}

export interface GetServiceOrderByIdResponse extends ServiceOrder {
  customer: Customer | null;
  assignedTo: Omit<User, "password"> | null;
  assignedBy: Omit<User, "password"> | null;
  servicePartsUsed: ServicePartsUsed[];
  serviceRepairs: ServiceRepair[];
}

/**
 * Get a single service order by ID with all related data
 * @param {string} id - The service order ID (UUID)
 * @returns {Promise<EitherDataOrError<GetServiceOrderByIdResponse, AppError>>} Tuple of [data, error] for clean destructuring
 */
export async function GetServiceOrderById(
  id: string,
): Promise<EitherDataOrError<GetServiceOrderByIdResponse, AppError>> {
  try {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTo: true,
        assignedBy: true,
        servicePartsUsed: true,
        serviceRepairs: true,
      },
    });

    if (!serviceOrder) {
      return [
        null,
        {
          code: "NOT_FOUND",
          message: "Service order not found",
        },
      ];
    }

    // Process data...
    const assignedTo = serviceOrder.assignedTo ? (({ password, ...rest }) => rest)(serviceOrder.assignedTo) : null;
    const assignedBy = (({ password, ...rest }) => rest)(serviceOrder.assignedBy);

    const response: GetServiceOrderByIdResponse = {
      ...serviceOrder,
      assignedTo: assignedTo as Omit<User, "password"> | null,
      assignedBy: assignedBy as Omit<User, "password">,
    };

    return [response, null];
  } catch (error) {
    console.error("Error fetching service order by ID:", error);
    return [
      null,
      {
        code: "DATABASE_ERROR",
        message: "Failed to fetch service order from db- " + (error instanceof Error ? error.message : String(error)),
        details: error,
      },
    ];
  }
}
