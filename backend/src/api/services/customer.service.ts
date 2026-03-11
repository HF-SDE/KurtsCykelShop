import { err, ok } from "@api-types/error.types";
import { Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Customer } from "@prisma/client";
import { CustomerSearchSchema } from "@schemas/serviceOrder.schemas";

/**
 * Search customers by email, first name, last name, or phone.
 * @param {any} query - The search query string
 * @returns {Promise<EitherDataOrError<Customer[], AppError>>}
 */
export async function SearchCustomers(query: any) {
  const parseResult = CustomerSearchSchema.safeParse({ q: query });

  if (!parseResult.success) {
    return err({
      status: Status.InvalidDetails,
      message: "Invalid search query",
    });
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

    return ok(customers);
  } catch (error) {
    console.error("Error searching customers:", error);
    return err({
      status: Status.Failed,
      message: "Failed to search customers",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Create a new customer
 * @param data - Customer creation data
 * @returns {Promise<EitherDataOrError<Customer, AppError>>}
 */
export async function CreateCustomer(data: { firstName: string; lastName: string; email: string; phone?: string }) {
  try {
    // Check if customer with email already exists
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return err({
        status: Status.UniqueConstraintViolation,
        message: "Der findes allerede en kunde med denne email",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
      },
    });

    return ok(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    return err({
      status: Status.CreationFailed,
      message: "Failed to create customer",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
