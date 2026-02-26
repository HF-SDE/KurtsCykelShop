import { ExpressFunction, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { PermissionGetPayload } from "@prisma/models";
import { getHttpStatusCode } from "@utils/Utils";
import { Response } from "express";

/**
 * Middleware to check if the user has the required permissions to access a route.
 * @param {string[]} permissions - The permissions required to access the route.
 * @returns {ExpressFunction} The middleware function to check permissions.
 */
export function isAllowed(permissions: string[]): ExpressFunction {
  return async (req, res: Response, next) => {
    const user = req.user as { id: string } | undefined;

    if (!user || !user.id) {
      res.status(getHttpStatusCode(Status.Unauthorized)).json({
        status: "Unauthorized",
        message: "Unauthorized",
      });
      return;
    }

    const Permissions = (await prisma.permission.findMany({
      where: {
        code: {
          in: permissions,
        },
        roles: {
          some: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
      },
      include: {
        roles: true,
      },
    })) as PermissionGetPayload<{ include: { roles: true } }>[];

    if (Permissions.length) return next();
    res.status(getHttpStatusCode(Status.Forbidden)).json({
      status: "Forbidden",
      message: "Forbidden",
    });

    return;
  };
}
