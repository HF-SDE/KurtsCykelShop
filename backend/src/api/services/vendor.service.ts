import { APIResponse, PaginatedData, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Vendor } from "@prisma/client";

export async function getAll(): Promise<APIResponse<Vendor[]>> {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });

  return {
    status: Status.Success,
    message: "Vendors retrieved successfully",
    data: vendors,
  };
}

export async function getAllPaginated(
  page: number = 1,
  limit: number = 20,
): Promise<APIResponse<PaginatedData<Vendor>>> {
  const skip = (page - 1) * limit;

  const [vendors, total] = await prisma.$transaction([
    prisma.vendor.findMany({ skip, take: limit, orderBy: { name: "asc" } }),
    prisma.vendor.count(),
  ]);

  return {
    status: Status.Success,
    message: "Vendors retrieved successfully",
    data: { data: vendors, total, page, hasMore: skip + vendors.length < total },
  };
}
