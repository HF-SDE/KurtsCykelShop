import { APIResponse, PaginatedData, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { ItemStatus } from "@prisma/client";

export async function getAll(): Promise<APIResponse<ItemStatus[]>> {
  const itemStatuses = await prisma.itemStatus.findMany();

  return {
    status: Status.Success,
    message: "Statuses retrieved successfully",
    data: itemStatuses,
  };
}

export async function getAllPaginated(
  page: number = 1,
  limit: number = 20,
): Promise<APIResponse<PaginatedData<ItemStatus>>> {
  const skip = (page - 1) * limit;

  const [itemStatuses, total] = await prisma.$transaction([
    prisma.itemStatus.findMany({ skip, take: limit }),
    prisma.itemStatus.count(),
  ]);

  return {
    status: Status.Success,
    message: "Vendors retrieved successfully",
    data: { data: itemStatuses, total, page, hasMore: skip + itemStatuses.length < total },
  };
}
