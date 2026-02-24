import { APIResponse, Status } from "@api-types/general.types";
import { Item } from "@prisma";
import prisma from "@prisma-instance";
import { CreateItemSchema, CreateItemType } from "@schemas/item.schemas";

export async function getAll(): Promise<APIResponse<Item[]>> {
  const items = await prisma.item.findMany();

  return {
    status: Status.Success,
    message: "Items retrieved successfully",
    data: items,
  };
}

export interface PaginatedItems {
  items: Item[];
  total: number;
  page: number;
  hasMore: boolean;
}

export async function getAllPaginated(page: number = 1, limit: number = 20): Promise<APIResponse<PaginatedItems>> {
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({ skip, take: limit, orderBy: { name: "asc" } }),
    prisma.item.count(),
  ]);

  return {
    status: Status.Success,
    message: "Items retrieved successfully",
    data: { items, total, page, hasMore: skip + items.length < total },
  };
}

export async function createOne(data: CreateItemType): Promise<APIResponse<Item>> {
  const { data: validatedData, error } = CreateItemSchema.safeParse(data);

  if (error) {
    return {
      status: Status.CreationFailed,
      message: error.message,
    };
  }

  const { id: locationId } = await prisma.location.findFirstOrThrow();
  const { id: vendorId } = await prisma.vendor.findFirstOrThrow();
  const { id: statusId } = await prisma.itemStatus.findFirstOrThrow();

  const sku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newItem = await prisma.item.create({
    data: { ...validatedData, sku, locationId, vendorId, statusId },
  });

  return {
    status: Status.Success,
    message: "Item created successfully",
    data: newItem,
  };
}
