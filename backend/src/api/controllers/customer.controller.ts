import { APIResponse, Status } from "@api-types/general.types";
import { Customer } from "@prisma/client";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

import * as CustomerService from "../services/customer.service";

interface SearchCustomersQuery {
  q?: string;
}

/**
 * Search customers by query string (email, name, phone)
 */
export async function searchCustomers(
  req: Request<{}, APIResponse<Customer[]>, {}, SearchCustomersQuery>,
  res: Response<APIResponse<Customer[]>>,
): Promise<void> {
  const query = req.query.q;

  const [data, error] = await CustomerService.SearchCustomers(query);

  if (error) {
    res.status(getHttpStatusCode(error.status || Status.Failed)).json({
      status: error.status || Status.Failed,
      message: error.message || "Failed to search customers",
    });
    return;
  }

  res.status(getHttpStatusCode(Status.Success)).json({
    status: Status.Success,
    message: "Customers found",
    data,
  });
}
