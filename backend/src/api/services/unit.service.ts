import { APIResponse, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Unit } from "@prisma/client";
import { CreateUnitType, EditUnitType } from "@schemas/unit.schema";

export async function getAll(): Promise<APIResponse<Unit[]>> {
  const units = await prisma.unit.findMany();

  return {
    status: Status.Success,
    message: "Units retrieved successfully",
    data: units,
  };
}

export async function createOne(data: CreateUnitType): Promise<APIResponse<Unit>> {
  const newUnit = await prisma.unit.create({ data });

  return {
    status: Status.Success,
    message: "Unit created successfully",
    data: newUnit,
  };
}

export async function updateOne(id: string, data: EditUnitType): Promise<APIResponse<Unit>> {
  const updatedUnit = await prisma.unit.update({ where: { id }, data });

  return {
    status: Status.Success,
    message: "Unit updated successfully",
    data: updatedUnit,
  };
}

export async function deleteOne(id: string): Promise<APIResponse<null>> {
  await prisma.unit.delete({ where: { id } });

  return {
    status: Status.Success,
    message: "Unit deleted successfully",
    data: null,
  };
}
