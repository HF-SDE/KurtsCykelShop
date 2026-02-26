import { AppError, EitherDataOrError, ValidationError } from "@api-types/error.types";
import { APIResponse, PaginatedData, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Item } from "@prisma/client";
import { ItemWhereInput } from "@prisma/models";
import {
  CreateItemSchema,
  CreateItemType,
  EditItemSchema,
  EditItemType,
  ItemFiltersSchema,
  ItemFiltersType,
} from "@schemas/item.schemas";
import z from "zod";

export async function getAll(): Promise<APIResponse<Item[]>> {
  const items = await prisma.item.findMany({ include: { barcodes: { select: { code: true } } } });

  const mappedItems = items.map((item) => ({
    ...item,
    barcodes: item.barcodes.map((b) => b.code),
  }));

  return {
    status: Status.Success,
    message: "Items retrieved successfully",
    data: mappedItems,
  };
}

export async function getAllPaginated(
  page: number = 1,
  limit: number = 20,
  search: string | undefined = undefined,
  filters: ItemFiltersType = {},
): Promise<APIResponse<PaginatedData<Item>>> {
  const skip = (page - 1) * limit;

  const { data: validatedFilters, error: filtersError } = ItemFiltersSchema.safeParse(filters);
  if (filtersError) {
    return {
      status: Status.InvalidDetails,
      message: filtersError.message,
    };
  }

  const normalizedSearch = search?.trim();
  const where: ItemWhereInput | undefined = normalizedSearch
    ? {
        OR: [
          { name: { contains: normalizedSearch, mode: "insensitive" } },
          { description: { contains: normalizedSearch, mode: "insensitive" } },
          { sku: { contains: normalizedSearch, mode: "insensitive" } },
          { barcodes: { some: { code: { contains: normalizedSearch, mode: "insensitive" } } } },
        ],
        ...filters,
      }
    : Object.keys(validatedFilters).length > 0
      ? validatedFilters
      : undefined;

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: { barcodes: { select: { code: true } } },
      where,
    }),
    prisma.item.count({ where }),
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

export async function getById(id: any): Promise<EitherDataOrError<Item, AppError | ValidationError>> {
  // Validate id
  const idValidation = z.uuid().safeParse(id);
  if (!idValidation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid item ID",
      },
    ];
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: idValidation.data },
      include: { barcodes: { select: { code: true } } },
    });

    if (!item) {
      return [
        null,
        {
          status: Status.NotFound,
          message: "Item not found",
        },
      ];
    }

    const mappedItem = {
      ...item,
      barcodes: item.barcodes.map((b) => b.code),
    };

    return [mappedItem, null];
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to fetch item by ID",
        details: error,
      },
    ];
  }
}

export async function getByBarcode(barcode: any): Promise<EitherDataOrError<Item, AppError | ValidationError>> {
  // Validate barcode
  const barcodeValidation = z.string().min(1, "Barcode cannot be empty").safeParse(barcode);
  if (!barcodeValidation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid barcode",
      },
    ];
  }

  try {
    const item = await prisma.item.findFirst({
      where: { barcodes: { some: { code: barcodeValidation.data } } },
      include: { barcodes: { select: { code: true } } },
    });

    if (!item) {
      return [
        null,
        {
          status: Status.NotFound,
          message: "Item not found for the given barcode",
        },
      ];
    }

    const mappedItem = {
      ...item,
      barcodes: item.barcodes.map((b) => b.code),
    };

    return [mappedItem, null];
  } catch (error) {
    console.error("Error fetching item by barcode:", error);
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to fetch item by barcode",
        details: error,
      },
    ];
  }
}

export async function getBySearchQuery(search: any): Promise<EitherDataOrError<Item[], AppError | ValidationError>> {
  // Validate search query
  const searchValidation = z.string().min(1, "Search query cannot be empty").safeParse(search);
  if (!searchValidation.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid search query",
      },
    ];
  }

  try {
    const normalizedSearch = searchValidation.data.trim();
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: normalizedSearch, mode: "insensitive" } },
          { description: { contains: normalizedSearch, mode: "insensitive" } },
          { sku: { contains: normalizedSearch, mode: "insensitive" } },
          { barcodes: { some: { code: { contains: normalizedSearch, mode: "insensitive" } } } },
        ],
      },
      include: { barcodes: { select: { code: true } } },
    });

    const mappedItems = items.map((item) => ({
      ...item,
      barcodes: item.barcodes.map((b) => b.code),
    }));

    return [mappedItems, null];
  } catch (error) {
    console.error("Error fetching items by search query:", error);
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to fetch items by search query",
        details: error,
      },
    ];
  }
}
