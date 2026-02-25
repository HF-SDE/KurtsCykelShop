import { APIResponse, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Unit } from "@prisma/client";

export async function getAll(): Promise<APIResponse<Unit[]>> {
  const units = await prisma.unit.findMany();

  return {
    status: Status.Success,
    message: "Units retrieved successfully",
    data: units,
  };
}
