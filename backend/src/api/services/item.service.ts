import { APIResponse, PaginatedData, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Item } from "@prisma/client";
import { CreateItemSchema, CreateItemType, EditItemSchema, EditItemType } from "@schemas/item.schemas";

export async function getAll(): Promise<APIResponse<Item[]>> {
  const items = await prisma.item.findMany();

  return {
    status: Status.Success,
    message: "Items retrieved successfully",
    data: items,
  };
}

export async function getAllPaginated(page: number = 1, limit: number = 20): Promise<APIResponse<PaginatedData<Item>>> {
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: { barcodes: { select: { code: true } } },
    }),
    prisma.item.count(),
  ]);

  const mappedItems = items.map((item) => ({
    ...item,
    barcodes: item.barcodes.map((b) => b.code),
  }));

  return {
    status: Status.Success,
    message: "Items retrieved successfully",
    data: { data: mappedItems, total, page, hasMore: skip + items.length < total },
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

  const sku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newItem = await prisma.item.create({
    data: {
      ...validatedData,
      sku,
      barcodes: {
        createMany: { data: validatedData.barcodes?.map((code) => ({ code })) || [] },
      },
    },
  });

  return {
    status: Status.Success,
    message: "Item created successfully",
    data: newItem,
  };
}

export async function updateOne(id: string, data: Partial<EditItemType>): Promise<APIResponse<Item>> {
  const existingItem = await prisma.item.findUnique({ where: { id } });

  if (!existingItem) {
    return {
      status: Status.NotFound,
      message: "Item not found",
    };
  }

  const { data: validatedData, error } = EditItemSchema.safeParse(data);

  if (error) {
    return {
      status: Status.UpdateFailed,
      message: error.message,
    };
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data: {
      ...validatedData,
      barcodes: validatedData.barcodes
        ? {
            deleteMany: { itemId: id },
            createMany: { data: validatedData.barcodes.map((code) => ({ code })) },
          }
        : undefined,
    },
    include: { barcodes: { select: { code: true } } },
  });

  const mappedItem = {
    ...updatedItem,
    barcodes: updatedItem.barcodes.map((b) => b.code),
  };

  return {
    status: Status.Success,
    message: "Item updated successfully",
    data: mappedItem,
  };
}
