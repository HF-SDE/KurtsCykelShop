import { APIResponse, Status } from "@api-types/general.types";
import { Item } from "@prisma";
import prisma from "@prisma-instance";

export async function getAll(): Promise<APIResponse<Item[]>> {
  const items = await prisma.item.findMany();

  return {
    status: Status.Success,
    message: "Units retrieved successfully",
    data: items,
  };
}
