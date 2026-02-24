/**
 * ERROR HANDLING PATTERN EXAMPLES
 *
 * This file demonstrates the clean error handling pattern used throughout the API:
 * - Services return Result<T, E> tuples for [data, error] destructuring
 * - Controllers handle tuples and return APIResponse objects
 * - Validation errors use field-specific error messages
 */
import { AppError, EitherDataOrError, ValidationError } from "@api-types/error.types";
import { APIResponse, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { getHttpStatusCode } from "@utils/Utils";
import { zodErrorToValidationError } from "@utils/ValidationHelpers";
import { Request, Response } from "express";
import { z } from "zod";

// ============================================================================
// EXAMPLE 1: Service Layer - Database Query with Error Handling
// ============================================================================

interface User {
  id: string;
  username: string;
  email: string;
}

/**
 * Service function returns Result tuple: [data, error]
 * - On success: [data, null]
 * - On error: [null, error]
 */
async function getUserById(id: string): Promise<EitherDataOrError<User, AppError>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return [
        null,
        {
          code: "NOT_FOUND",
          message: "User not found",
        },
      ];
    }

    return [user as User, null];
  } catch (error) {
    return [
      null,
      {
        code: "DATABASE_ERROR",
        message: "Failed to fetch user",
        details: error,
      },
    ];
  }
}

// ============================================================================
// EXAMPLE 2: Controller - Handling Service Result Tuple
// ============================================================================

interface GetUserParams {
  id: string;
}

async function getUserController(req: Request<GetUserParams>, res: Response<APIResponse<User>>): Promise<void> {
  try {
    const { id } = req.params;

    // Clean destructuring of service result
    const [data, error] = await getUserById(id);

    // Handle error case
    if (error) {
      if (error.code === "NOT_FOUND") {
        res.status(404).json({
          status: Status.NotFound,
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: Status.Failed,
          message: error.message,
        });
      }
      return;
    }

    // Handle success case
    res.status(200).json({
      status: Status.Success,
      data: data,
    });
  } catch (error) {
    console.error("Unexpected error in controller:", error);
    res.status(500).json({
      status: Status.Failed,
      message: "Internal server error",
    });
  }
}

// ============================================================================
// EXAMPLE 3: Validation Errors - Field-Specific Error Messages
// ============================================================================

const CreateUserSchema = z.object({
  username: z.string().min(2, "Must be at least 2 characters in length"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[A-Z]/, "Must contain an uppercase letter"),
  email: z.string().email("Invalid email address"),
});

interface CreateUserBody {
  username: string;
  password: string;
  email: string;
}

async function createUserController(
  req: Request<{}, APIResponse<User>, CreateUserBody>,
  res: Response<APIResponse<User>>,
): Promise<void> {
  try {
    // Validate request body
    const parseResult = CreateUserSchema.safeParse(req.body);

    if (!parseResult.success) {
      // Return validation errors in field-specific format
      // Example response:
      // {
      //   "status": "InvalidDetails",
      //   "message": "Validation failed",
      //   "errors": {
      //     "password": ["Must contain a number", "Must contain an uppercase letter"],
      //     "username": ["Must be at least 2 characters in length"]
      //   }
      // }
      res.status(400).json({
        status: Status.InvalidDetails,
        message: "Validation failed",
        errors: zodErrorToValidationError(parseResult.error),
      });
      return;
    }

    // Continue with validated data
    const validatedData = parseResult.data;

    // ... create user logic here ...

    res.status(201).json({
      status: Status.Created,
      message: "User created successfully",
      data: {} as User, // Your created user data
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      status: Status.Failed,
      message: "Failed to create user",
    });
  }
}

// ============================================================================
// EXAMPLE 4: Multiple Operations with Error Handling
// ============================================================================

interface CreateOrderBody {
  customerId: string;
  items: string[];
}

async function createOrderController(
  req: Request<{}, APIResponse<any>, CreateOrderBody>,
  res: Response<APIResponse<any>>,
): Promise<void> {
  try {
    const { customerId, items } = req.body;

    // Check if customer exists
    const [customer, customerError] = await getUserById(customerId);

    if (customerError) {
      res.status(404).json({
        status: Status.NotFound,
        message: "Customer not found",
      });
      return;
    }

    // Validate items exist (pseudocode)
    // const [validItems, itemsError] = await validateItems(items);
    //
    // if (itemsError) {
    //   res.status(400).json({
    //     status: Status.InvalidDetails,
    //     message: itemsError.message,
    //   });
    //   return;
    // }

    // Create order (pseudocode)
    // const [order, orderError] = await createOrder({ customerId, items });
    //
    // if (orderError) {
    //   res.status(500).json({
    //     status: Status.CreationFailed,
    //     message: "Failed to create order",
    //   });
    //   return;
    // }

    res.status(201).json({
      status: Status.Created,
      message: "Order created successfully",
      data: {}, // order data
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      status: Status.Failed,
      message: "Internal server error",
    });
  }
}

// ============================================================================
// KEY BENEFITS OF THIS PATTERN:
// ============================================================================
//
// 1. FLAT CODE: No nested if-else or try-catch pyramids
//    const [data, error] = await serviceCall();
//    if (error) { handle error }
//    // continue with data
//
// 2. TYPE SAFETY: TypeScript knows data is defined when error is null
//    if (error) return;
//    data.field // TypeScript knows data is not null here
//
// 3. CONSISTENT ERROR RESPONSES: All validation errors follow same format
//    { "field": ["error1", "error2"] }
//
// 4. EASY TO TEST: Services return simple tuples, easy to mock and assert
//
// 5. CLEAN SEPARATION: Services handle business logic, controllers handle HTTP
//
// ============================================================================

export {};
