import { APIResponse, Status } from "@api-types/general.types";
import { Unit } from "@prisma";
import prisma from "@prisma-instance";

export async function getAll(): Promise<APIResponse<Unit[]>> {
  const units = await prisma.unit.findMany();

  return {
    status: Status.Success,
    message: "Units retrieved successfully",
    data: units,
  };
}
