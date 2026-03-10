import { APIResponse, PaginatedData, Status, TypedQuery } from "@api-types/general.types";
import { User } from "@prisma/client";
import * as UserService from "@services/user.service";
import { Request, Response } from "express";

export async function getAllUsers(
  req: Request<{}, APIResponse<User[]>, {}, {}>,
  res: Response<APIResponse<User[]>>,
): Promise<void> {
  const [users, error] = await UserService.getAllUsers();

  if (error) {
    res.status(500).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to retrieve users",
    });
    return;
  }

  res.status(200).json({
    status: Status.Success,
    message: "Users retrieved successfully",
    data: users,
  });
}
