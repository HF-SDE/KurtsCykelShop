import { APIResponse } from "@api-types/general.types";
import { Unit } from "@prisma/client";
import { EditUnitType } from "@schemas/unit.schema";
import * as UnitService from "@services/unit.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response<APIResponse<Unit[]>>) {
  const response = await UnitService.getAll();

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function createOne(req: Request, res: Response<APIResponse<Unit>>) {
  const response = await UnitService.createOne(req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function updateOne(
  req: Request<{ id: string }, APIResponse<Unit>, EditUnitType>,
  res: Response<APIResponse<Unit>>,
) {
  const { id } = req.params;
  const response = await UnitService.updateOne(id, req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

export async function deleteOne(req: Request<{ id: string }, APIResponse<void>>, res: Response<APIResponse<null>>) {
  const { id } = req.params;
  const response = await UnitService.deleteOne(id);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
