import { APIResponse } from "@api-types/general.types";
import { Item } from "@prisma";
import * as ItemService from "@services/item.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Item[]>>) {
  const response = await ItemService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
