import { APIResponse, Status } from "@api-types/general.types";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/internal/prismaNamespace";
import { capitalize } from "@utils/Utils";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
export default prisma;

export type prismaModels = Uncapitalize<Prisma.ModelName>;
/**
 * Function to handle error responses
 * @param {PrismaClientKnownRequestError} err - The error object.
 * @param {prismaModels} model - The model that caused the error.
 * @param {keyof typeof Status} operation - The operation that caused the error.
 * @returns {APIResponse} An object containing the status and message.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function errorResponse(
  err: PrismaClientKnownRequestError,
  model: prismaModels,
  operation: keyof typeof Status,
): Promise<APIResponse> {
  if (err) {
    return {
      status: Status.MissingDetails,
      message: "Invalid input",
    };
  }

  if (err instanceof PrismaClientKnownRequestError && operation in Status) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (err.code) {
      case "P2002":
        return {
          status: Status[operation],
          message: `${capitalize(model)} already exists`,
        };

      case "P2025":
        return {
          status: Status[operation],
          message: `${capitalize(model)} not found`,
        };

      case "P2014":
        return {
          status: Status[operation],
          message: "Relation deletion error",
        };
    }
  }

  return {
    status: Status[operation],
    message: "Error",
  };
}
