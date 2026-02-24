import { APIResponse, PaginatedData, Status } from "@api-types/general.types";
import { Location } from "@prisma";
import prisma from "@prisma-instance";

export async function getAll(): Promise<APIResponse<Location[]>> {
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });

  return {
    status: Status.Success,
    message: "Locations retrieved successfully",
    data: locations,
  };
}

export async function getAllPaginated(
  page: number = 1,
  limit: number = 20,
): Promise<APIResponse<PaginatedData<Location>>> {
  const skip = (page - 1) * limit;

  const [location, total] = await prisma.$transaction([
    prisma.location.findMany({ skip, take: limit, orderBy: { name: "asc" } }),
    prisma.location.count(),
  ]);

  return {
    status: Status.Success,
    message: "Locations retrieved successfully",
    data: { data: location, total, page, hasMore: skip + location.length < total },
  };
}
