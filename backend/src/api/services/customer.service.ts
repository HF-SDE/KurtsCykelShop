import { AppError, EitherDataOrError } from "@api-types/error.types";
import { Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Customer } from "@prisma/client";
import { CustomerSearchSchema } from "@schemas/serviceOrder.schemas";

/**
 * Search customers by email, first name, last name, or phone.
 * @param {any} query - The search query string
 * @returns {Promise<EitherDataOrError<Customer[], AppError>>}
 */
export async function SearchCustomers(query: any): Promise<EitherDataOrError<Customer[], AppError>> {
  const parseResult = CustomerSearchSchema.safeParse({ q: query });

  if (!parseResult.success) {
    return [
      null,
      {
        status: Status.InvalidDetails,
        message: "Invalid search query",
      },
    ];
  }

  const searchTerm = (parseResult.data.q ?? "").trim();

  try {
    const whereClause =
      searchTerm.length > 0
        ? {
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" as const } },
              { lastName: { contains: searchTerm, mode: "insensitive" as const } },
              { email: { contains: searchTerm, mode: "insensitive" as const } },
              { phone: { contains: searchTerm, mode: "insensitive" as const } },
            ],
          }
        : {};

    const customers = await prisma.customer.findMany({
      where: whereClause,
      take: 20,
      orderBy: { firstName: "asc" },
    });

    return [customers, null];
  } catch (error) {
    console.error("Error searching customers:", error);
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to search customers",
        details: error,
      },
    ];
  }
}

/**
 * Create a new customer
 * @param data - Customer creation data
 * @returns {Promise<EitherDataOrError<Customer, AppError>>}
 */
export async function CreateCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}): Promise<EitherDataOrError<Customer, AppError>> {
  try {
    // Check if customer with email already exists
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return [
        null,
        {
          status: Status.UniqueConstraintViolation,
          message: "Customer with this email already exists",
        },
      ];
    }

    const customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
      },
    });

    return [customer, null];
  } catch (error) {
    console.error("Error creating customer:", error);
    return [
      null,
      {
        status: Status.CreationFailed,
        message: "Failed to create customer",
        details: error,
      },
    ];
  }
}
