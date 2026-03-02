import { APIResponse, PaginatedData, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Location } from "@prisma/client";
import { CreateLocationType, EditLocationType } from "@schemas/location.schema";

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

export async function createOne(data: CreateLocationType): Promise<APIResponse<Location>> {
  const location = await prisma.location.create({ data });

  return {
    status: Status.Success,
    message: "Location created successfully",
    data: location,
  };
}

export async function updateOne(id: string, data: EditLocationType): Promise<APIResponse<Location>> {
  const location = await prisma.location.update({ where: { id }, data });

  return {
    status: Status.Success,
    message: "Location updated successfully",
    data: location,
  };
}

export async function deleteOne(id: string): Promise<APIResponse<void>> {
  await prisma.location.delete({ where: { id } });

  return {
    status: Status.Success,
    message: "Location deleted successfully",
  };
}
