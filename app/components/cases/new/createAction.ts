import { ServiceOrderCreateSchema } from "@schemas/serviceOrder.schemas";
import apiClient from "@utils/apiClient";

import type { CustomerData } from "./CustomerSearchSection";
import type { Employee } from "./EmployeeSelectField";

export interface CreateServiceOrderInput {
  description: string;
  estimatedCompletion: Date;
  assignedToId: string | null;
  customerData: CustomerData;
}

export type FieldErrors = Record<string, string[]>;

export interface CreateServiceOrderResult {
  success: true;
  id?: string;
}

export interface CreateServiceOrderError {
  success: false;
  fieldErrors: FieldErrors;
  message: string;
}

function buildPayload(input: CreateServiceOrderInput): Record<string, unknown> {
  const { description, estimatedCompletion, assignedToId, customerData } = input;

  const payload: Record<string, unknown> = {
    description,
    estimatedCompletion: estimatedCompletion.toISOString(),
    assignedToId,
  };

  if (customerData.id) {
    payload.customerId = customerData.id;
  } else {
    payload.customerFirstName = customerData.firstName.trim();
    payload.customerLastName = customerData.lastName.trim();
    payload.customerEmail = customerData.email.trim();
    if (customerData.phone?.trim()) {
      payload.customerPhone = customerData.phone.trim();
    }
  }

  return payload;
}

export async function createServiceOrder(
  input: CreateServiceOrderInput,
): Promise<CreateServiceOrderResult | CreateServiceOrderError> {
  const payload = buildPayload(input);

  const result = ServiceOrderCreateSchema.safeParse(payload);
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as FieldErrors,
      message: "Ugyldige felter. Ret venligst fejlene.",
    };
  }

  try {
    const response = await apiClient.post("/service-orders", result.data);
    return { success: true, id: response.data?.data?.id };
  } catch (error: any) {
    const message = error?.response?.data?.message ?? "Kunne ikke oprette sagen. Prøv igen.";
    return {
      success: false,
      fieldErrors: { general: [message] },
      message,
    };
  }
}
