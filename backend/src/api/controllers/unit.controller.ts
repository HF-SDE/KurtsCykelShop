import { APIResponse } from "@api-types/general.types";
import { Unit } from "@prisma";
import * as UnitService from "@services/unit.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Unit[]>>) {
  const response = await UnitService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
