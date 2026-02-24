# Error Handling Pattern - Quick Reference

## Overview

Clean, flat error handling using **tuple destructuring** `[data, error]` pattern throughout the API.

---

## 1. Error Types

### Location: `backend/src/types/error.types.ts`

```typescript
// Field-specific validation errors
interface ValidationError {
  [field: string]: string[];
}

// General application errors
interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Service layer return type
type Result<T, E = AppError> = [data: T, error: null] | [data: null, error: E];
```

---

## 2. Service Layer Pattern

**Returns:** `Result<T, AppError>` tuple for clean destructuring

```typescript
export async function GetServiceOrderById(id: string): Promise<Result<GetServiceOrderByIdResponse, AppError>> {
  try {
    const order = await prisma.serviceOrder.findUnique({ where: { id } });

    if (!order) {
      return [null, { code: "NOT_FOUND", message: "Service order not found" }];
    }

    return [order, null]; // ✅ Success
  } catch (error) {
    return [null, { code: "DATABASE_ERROR", message: "Failed to fetch", details: error }];
  }
}
```

---

## 3. Controller Layer Pattern

**Handles:** Tuples and returns `APIResponse<T>`

```typescript
export async function getServiceOrderById(
  req: Request,
  res: Response<APIResponse<GetServiceOrderByIdResponse>>,
): Promise<void> {
  try {
    const { id } = req.params;

    // Clean destructuring
    const [data, error] = await ServiceOrderService.GetServiceOrderById(id);

    // Handle error
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

    // Handle success
    res.status(200).json({
      status: Status.Success,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      status: Status.Failed,
      message: "Internal server error",
    });
  }
}
```

---

## 4. Validation Error Pattern

**Location:** `backend/src/utils/ValidationHelpers.ts`

```typescript
import { zodErrorToValidationError } from "@utils/ValidationHelpers";

const schema = z.object({
  username: z.string().min(2, "Must be at least 2 in length"),
  password: z.string().regex(/[0-9]/, "Must contain a number"),
});

const parseResult = schema.safeParse(req.body);

if (!parseResult.success) {
  res.status(400).json({
    status: Status.InvalidDetails,
    message: "Validation failed",
    errors: zodErrorToValidationError(parseResult.error),
  });
  return;
}
```

**Response Format:**

```json
{
  "status": "InvalidDetails",
  "message": "Validation failed",
  "errors": {
    "password": ["Must contain a number"],
    "username": ["Must be at least 2 in length"]
  }
}
```

---

## 5. Common Error Codes

```typescript
"NOT_FOUND"         → 404 NotFound
"UNAUTHORIZED"      → 401 Unauthorized
"FORBIDDEN"         → 403 Forbidden
"VALIDATION_ERROR"  → 400 InvalidDetails
"DATABASE_ERROR"    → 500 Failed
"DUPLICATE_ENTRY"   → 409 CreationFailed
```

---

## 6. APIResponse Types

```typescript
// Success with data
{
  status: Status.Success,
  message?: string,
  data: T
}

// Validation errors (field-specific)
{
  status: Status.InvalidDetails,
  message?: string,
  errors: {
    "field1": ["error1", "error2"],
    "field2": ["error1"]
  }
}

// General error
{
  status: Status.Failed,
  message?: string,
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

---

## ✅ Benefits

1. **Flat Code**: No nested conditions
2. **Type Safety**: TypeScript knows when data is defined
3. **Consistent**: All errors follow same format
4. **Clean**: Clear separation between service/controller layers
5. **Easy to Read**: Linear flow from top to bottom

---

## 📝 Examples

See comprehensive examples in:

- `backend/src/examples/error-handling-patterns.ts`
- `backend/src/api/controllers/serviceOrder.controller.ts` (lines 64-86, 108-136)
- `backend/src/api/services/serviceOrder.service.ts`
