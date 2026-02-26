import { AppError, EitherDataOrError } from "@api-types/error.types";
import { Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { User } from "@prisma/client";

export async function getAllUsers(): Promise<EitherDataOrError<User[], AppError>> {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
    if (!users) {
      return [
        null,
        {
          status: Status.NotFound,
          message: "No users found",
        },
      ];
    }
    return [users, null];
  } catch (error) {
    return [
      null,
      {
        status: Status.Failed,
        message: "Failed to retrieve users",
      },
    ];
  }
}
