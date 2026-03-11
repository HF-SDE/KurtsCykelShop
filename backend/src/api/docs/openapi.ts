import { Status } from "@api-types/general.types";
import { CreateItemSchema, EditItemSchema } from "@schemas/item.schemas";
import { CreateLocationSchema, EditLocationSchema } from "@schemas/location.schema";
import { getPermissionSchema } from "@schemas/permission.schemas";
import { getPermissionGroupsSchema } from "@schemas/permissionGroups.schemas";
import { CreateRoleSchema, GetRoleSchema, UpdateRoleSchema } from "@schemas/role.schemas";
import { CreateUnitSchema, EditUnitSchema } from "@schemas/unit.schema";
import { createUserSchema, getUserSchema, patchUserSchema, updateUserSchema } from "@schemas/user.schemas";
import { CreateVendorSchema, EditVendorSchema } from "@schemas/vendor.schema";
import { z } from "zod";

type OpenApiSchema = Record<string, unknown>;
type OpenApiResponse = Record<string, unknown>;

const toOpenApiSchema = (schema: z.ZodType): OpenApiSchema => {
  const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" }) as OpenApiSchema;

  delete jsonSchema.$schema;

  return jsonSchema;
};

const genericObjectSchema: OpenApiSchema = {
  type: "object",
  additionalProperties: true,
};

const genericArraySchema: OpenApiSchema = {
  type: "array",
  items: genericObjectSchema,
};

const paginatedDataSchema = (itemSchema: OpenApiSchema = genericObjectSchema): OpenApiSchema => ({
  type: "object",
  required: ["data", "total", "page", "hasMore"],
  properties: {
    data: {
      type: "array",
      items: itemSchema,
    },
    total: {
      type: "integer",
      minimum: 0,
    },
    page: {
      type: "integer",
      minimum: 1,
    },
    hasMore: {
      type: "boolean",
    },
  },
});

const apiResponseSchema = (dataSchema?: OpenApiSchema): OpenApiSchema => ({
  type: "object",
  required: ["status"],
  properties: {
    status: {
      type: "string",
      enum: Object.values(Status),
    },
    message: {
      type: "string",
    },
    ...(dataSchema ? { data: dataSchema } : {}),
  },
});

const jsonResponse = (description: string, dataSchema?: OpenApiSchema): OpenApiResponse => ({
  description,
  content: {
    "application/json": {
      schema: apiResponseSchema(dataSchema),
    },
  },
});

const jsonRequestBody = (schema: OpenApiSchema, description?: string): Record<string, unknown> => ({
  required: true,
  ...(description ? { description } : {}),
  content: {
    "application/json": {
      schema,
    },
  },
});

const bearerSecurity = [{ bearerAuth: [] }];

const protectedOperation = (operation: Record<string, unknown>): Record<string, unknown> => ({
  ...operation,
  security: bearerSecurity,
});

const uuidPathParameter = (name: string, description: string): Record<string, unknown> => ({
  name,
  in: "path",
  required: true,
  description,
  schema: {
    type: "string",
    format: "uuid",
  },
});

const integerQueryParameter = (
  name: string,
  description: string,
  overrides?: Record<string, unknown>,
): Record<string, unknown> => ({
  name,
  in: "query",
  required: false,
  description,
  schema: {
    type: "integer",
    ...overrides,
  },
});

const stringQueryParameter = (
  name: string,
  description: string,
  overrides?: Record<string, unknown>,
): Record<string, unknown> => ({
  name,
  in: "query",
  required: false,
  description,
  schema: {
    type: "string",
    ...overrides,
  },
});

const booleanQueryParameter = (name: string, description: string): Record<string, unknown> => ({
  name,
  in: "query",
  required: false,
  description,
  schema: {
    type: "boolean",
  },
});

const authTokenPairSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    accessToken: {
      type: "string",
    },
    refreshToken: {
      type: "string",
    },
  },
};

const loginRequestSchema = toOpenApiSchema(
  z.object({
    username: z.string().min(1),
    password: z.string().min(1).describe("Base64-encoded password"),
  }),
);

const tokenRequestSchema = toOpenApiSchema(
  z.object({
    token: z.string().min(1),
  }),
);

const changePasswordRequestSchema = toOpenApiSchema(
  z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(1),
  }),
);

const resetPasswordRequestSchema = toOpenApiSchema(
  z.object({
    password: z.string().min(8),
  }),
);

const accountStatusRequestSchema = toOpenApiSchema(
  z.object({
    active: z.boolean(),
  }),
);

const serviceOrderWriteSchema = toOpenApiSchema(
  z.object({}).catchall(z.unknown()).describe("Service order payload forwarded to the service layer"),
);

const serviceRepairWriteSchema = toOpenApiSchema(
  z.object({}).catchall(z.unknown()).describe("Service repair payload forwarded to the service layer"),
);

const servicePartUsedWriteSchema = toOpenApiSchema(
  z.object({}).catchall(z.unknown()).describe("Service part payload forwarded to the service layer"),
);

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Kurts Cykel Shop API",
    version: "1.0.0",
    description: "Express backend API for Kurts Cykel Shop.",
  },
  servers: [
    {
      url: "..",
      description: "Parent path of the docs endpoint",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Health" },
    { name: "Profile" },
    { name: "Users" },
    { name: "Manage" },
    { name: "Roles" },
    { name: "Customers" },
    { name: "Service Orders" },
    { name: "Items" },
    { name: "Vendors" },
    { name: "Locations" },
    { name: "Units" },
    { name: "Item Statuses" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      GenericObject: genericObjectSchema,
      GenericArray: genericArraySchema,
      PaginatedObjects: paginatedDataSchema(),
      AuthTokenPair: authTokenPairSchema,
      LoginRequest: loginRequestSchema,
      TokenRequest: tokenRequestSchema,
      ChangePasswordRequest: changePasswordRequestSchema,
      CreateUserRequest: toOpenApiSchema(createUserSchema),
      UpdateUserRequest: toOpenApiSchema(updateUserSchema),
      PatchUserRequest: toOpenApiSchema(patchUserSchema),
      ResetUserPasswordRequest: resetPasswordRequestSchema,
      SetUserAccountStatusRequest: accountStatusRequestSchema,
      UserFilters: toOpenApiSchema(getUserSchema),
      PermissionFilters: toOpenApiSchema(getPermissionSchema),
      PermissionGroupFilters: toOpenApiSchema(getPermissionGroupsSchema),
      RoleFilters: toOpenApiSchema(GetRoleSchema),
      CreateRoleRequest: toOpenApiSchema(CreateRoleSchema),
      UpdateRoleRequest: toOpenApiSchema(UpdateRoleSchema),
      CreateItemRequest: toOpenApiSchema(CreateItemSchema),
      UpdateItemRequest: toOpenApiSchema(EditItemSchema),
      CreateVendorRequest: toOpenApiSchema(CreateVendorSchema),
      UpdateVendorRequest: toOpenApiSchema(EditVendorSchema),
      CreateLocationRequest: toOpenApiSchema(CreateLocationSchema),
      UpdateLocationRequest: toOpenApiSchema(EditLocationSchema),
      CreateUnitRequest: toOpenApiSchema(CreateUnitSchema),
      UpdateUnitRequest: toOpenApiSchema(EditUnitSchema),
      ServiceOrderWriteRequest: serviceOrderWriteSchema,
      ServiceRepairWriteRequest: serviceRepairWriteSchema,
      ServicePartUsedWriteRequest: servicePartUsedWriteSchema,
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check backend health",
        responses: {
          "200": jsonResponse(
            "Backend is healthy",
            toOpenApiSchema(
              z.object({
                status: z.literal("ok"),
              }),
            ),
          ),
        },
      },
    },
    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate a user",
        requestBody: jsonRequestBody(loginRequestSchema),
        responses: {
          "200": jsonResponse("Authentication succeeded", authTokenPairSchema),
          "401": jsonResponse("Authentication failed"),
        },
      },
    },
    "/logout": {
      post: {
        tags: ["Auth"],
        summary: "Invalidate a refresh token",
        requestBody: jsonRequestBody(tokenRequestSchema),
        responses: {
          "200": jsonResponse("Logout succeeded"),
          "401": jsonResponse("Token was invalid"),
        },
      },
    },
    "/accessToken": {
      post: {
        tags: ["Auth"],
        summary: "Exchange a refresh token for new tokens",
        requestBody: jsonRequestBody(tokenRequestSchema),
        responses: {
          "200": jsonResponse("Token exchange succeeded", authTokenPairSchema),
          "400": jsonResponse("Missing or invalid token"),
          "401": jsonResponse("Token exchange failed"),
        },
      },
    },
    "/refreshToken": {
      get: protectedOperation({
        tags: ["Auth"],
        summary: "Exchange an access token for a refresh token",
        responses: {
          "200": jsonResponse("Refresh token issued", authTokenPairSchema),
          "400": jsonResponse("Missing authentication header"),
          "401": jsonResponse("Token exchange failed"),
        },
      }),
    },
    "/profile": {
      get: protectedOperation({
        tags: ["Profile"],
        summary: "Get the authenticated user's profile",
        responses: {
          "200": jsonResponse("Profile retrieved", genericObjectSchema),
          "400": jsonResponse("Missing authentication header"),
          "401": jsonResponse("Unauthorized"),
        },
      }),
    },
    "/profile/reset": {
      put: protectedOperation({
        tags: ["Profile"],
        summary: "Change the authenticated user's password",
        requestBody: jsonRequestBody(changePasswordRequestSchema),
        responses: {
          "200": jsonResponse("Password changed"),
          "401": jsonResponse("Unauthorized"),
        },
      }),
    },
    "/manage/user": {
      get: protectedOperation({
        tags: ["Manage"],
        summary: "List users with optional filters",
        parameters: [
          stringQueryParameter("id", "Filter by user ID", { format: "uuid" }),
          stringQueryParameter("username", "Filter by username"),
          stringQueryParameter("email", "Filter by email", { format: "email" }),
        ],
        responses: {
          "200": jsonResponse("Users retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      post: protectedOperation({
        tags: ["Manage"],
        summary: "Create a user",
        requestBody: jsonRequestBody(toOpenApiSchema(createUserSchema)),
        responses: {
          "201": jsonResponse("User created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/user/{id}": {
      put: protectedOperation({
        tags: ["Manage"],
        summary: "Update a user",
        parameters: [uuidPathParameter("id", "User ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(updateUserSchema)),
        responses: {
          "200": jsonResponse("User updated", genericObjectSchema),
          "400": jsonResponse("Invalid request"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      patch: protectedOperation({
        tags: ["Manage"],
        summary: "Patch a user",
        parameters: [uuidPathParameter("id", "User ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(patchUserSchema)),
        responses: {
          "200": jsonResponse("User patched", genericObjectSchema),
          "400": jsonResponse("Invalid request"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/user/{id}/reset-password": {
      put: protectedOperation({
        tags: ["Manage"],
        summary: "Reset a user's password",
        parameters: [uuidPathParameter("id", "User ID")],
        requestBody: jsonRequestBody(resetPasswordRequestSchema),
        responses: {
          "200": jsonResponse("Password reset"),
          "400": jsonResponse("Invalid request"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/user/{id}/account-status": {
      put: protectedOperation({
        tags: ["Manage"],
        summary: "Enable or disable a user account",
        parameters: [uuidPathParameter("id", "User ID")],
        requestBody: jsonRequestBody(accountStatusRequestSchema),
        responses: {
          "200": jsonResponse("Account status updated"),
          "400": jsonResponse("Invalid request"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/permission": {
      get: protectedOperation({
        tags: ["Manage"],
        summary: "List permissions",
        parameters: [
          stringQueryParameter("id", "Filter by permission ID", { format: "uuid" }),
          stringQueryParameter("code", "Filter by permission code"),
          stringQueryParameter("permissionGroupId", "Filter by permission group ID", { format: "uuid" }),
        ],
        responses: {
          "200": jsonResponse("Permissions retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/permission/{id}": {
      get: protectedOperation({
        tags: ["Manage"],
        summary: "Get a permission by ID",
        parameters: [uuidPathParameter("id", "Permission ID")],
        responses: {
          "200": jsonResponse("Permission retrieved", genericArraySchema),
          "400": jsonResponse("Invalid permission ID"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/permissionGroups": {
      get: protectedOperation({
        tags: ["Manage"],
        summary: "List permission groups",
        parameters: [stringQueryParameter("id", "Filter by permission group ID", { format: "uuid" })],
        responses: {
          "200": jsonResponse("Permission groups retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/role": {
      get: protectedOperation({
        tags: ["Roles"],
        summary: "List roles",
        parameters: [
          stringQueryParameter("id", "Filter by role ID", { format: "uuid" }),
          stringQueryParameter("name", "Filter by role name"),
          booleanQueryParameter("withPermissions", "Include assigned permissions"),
          booleanQueryParameter("withAllPermissions", "Include all permissions"),
          booleanQueryParameter("withPermissionGroups", "Include permission groups"),
        ],
        responses: {
          "200": jsonResponse("Roles retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      post: protectedOperation({
        tags: ["Roles"],
        summary: "Create a role",
        requestBody: jsonRequestBody(toOpenApiSchema(CreateRoleSchema)),
        responses: {
          "201": jsonResponse("Role created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/manage/role/{id}": {
      get: protectedOperation({
        tags: ["Roles"],
        summary: "Get a role by ID",
        parameters: [
          uuidPathParameter("id", "Role ID"),
          booleanQueryParameter("withPermissions", "Include assigned permissions"),
          booleanQueryParameter("withAllPermissions", "Include all permissions"),
          booleanQueryParameter("withPermissionGroups", "Include permission groups"),
        ],
        responses: {
          "200": jsonResponse("Role retrieved", genericObjectSchema),
          "400": jsonResponse("Invalid role ID"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      put: protectedOperation({
        tags: ["Roles"],
        summary: "Update a role",
        parameters: [uuidPathParameter("id", "Role ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(UpdateRoleSchema)),
        responses: {
          "200": jsonResponse("Role updated", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/customers/search": {
      get: protectedOperation({
        tags: ["Customers"],
        summary: "Search customers by query string",
        parameters: [stringQueryParameter("q", "Email, name, or phone number search term")],
        responses: {
          "200": jsonResponse("Customers retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/service-orders/paginated": {
      get: protectedOperation({
        tags: ["Service Orders"],
        summary: "List paginated service orders",
        parameters: [
          integerQueryParameter("page", "Page number", { minimum: 1 }),
          integerQueryParameter("limit", "Page size", { minimum: 1, maximum: 100 }),
          stringQueryParameter("search", "Free-text search"),
          stringQueryParameter("statuses", "Comma-separated status filter"),
          stringQueryParameter("timeRange", "Time range filter"),
        ],
        responses: {
          "200": jsonResponse("Paginated service orders", paginatedDataSchema()),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/service-orders": {
      post: protectedOperation({
        tags: ["Service Orders"],
        summary: "Create a service order",
        requestBody: jsonRequestBody(serviceOrderWriteSchema),
        responses: {
          "201": jsonResponse("Service order created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/service-orders/{id}": {
      get: protectedOperation({
        tags: ["Service Orders"],
        summary: "Get a service order by ID",
        parameters: [uuidPathParameter("id", "Service order ID")],
        responses: {
          "200": jsonResponse("Service order retrieved", genericObjectSchema),
          "400": jsonResponse("Invalid service order ID"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      patch: protectedOperation({
        tags: ["Service Orders"],
        summary: "Update a service order",
        parameters: [uuidPathParameter("id", "Service order ID")],
        requestBody: jsonRequestBody(serviceOrderWriteSchema),
        responses: {
          "200": jsonResponse("Service order updated", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/service-orders/{serviceOrderId}/repairs": {
      post: protectedOperation({
        tags: ["Service Orders"],
        summary: "Create a repair under a service order",
        parameters: [uuidPathParameter("serviceOrderId", "Service order ID")],
        requestBody: jsonRequestBody(serviceRepairWriteSchema),
        responses: {
          "200": jsonResponse("Repair created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/service-orders/{serviceOrderId}/parts": {
      post: protectedOperation({
        tags: ["Service Orders"],
        summary: "Create a used-parts entry under a service order",
        parameters: [uuidPathParameter("serviceOrderId", "Service order ID")],
        requestBody: jsonRequestBody(servicePartUsedWriteSchema),
        responses: {
          "200": jsonResponse("Part usage created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/items/public": {
      get: {
        tags: ["Items"],
        summary: "List public items",
        responses: {
          "200": jsonResponse("Public items retrieved", genericArraySchema),
        },
      },
    },
    "/items/paginated": {
      get: protectedOperation({
        tags: ["Items"],
        summary: "List paginated items",
        parameters: [
          integerQueryParameter("page", "Page number", { minimum: 1 }),
          integerQueryParameter("limit", "Page size", { minimum: 1, maximum: 100 }),
          stringQueryParameter("search", "Free-text search"),
          booleanQueryParameter("isPublic", "Filter public items"),
          stringQueryParameter("statusId", "Filter by item status ID", { format: "uuid" }),
          stringQueryParameter("locationId", "Filter by location ID", { format: "uuid" }),
          stringQueryParameter("vendorId", "Filter by vendor ID", { format: "uuid" }),
        ],
        responses: {
          "200": jsonResponse("Paginated items", paginatedDataSchema()),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/items/barcode": {
      get: protectedOperation({
        tags: ["Items"],
        summary: "Get an item by barcode",
        parameters: [stringQueryParameter("barcode", "Barcode value")],
        responses: {
          "200": jsonResponse("Item retrieved", genericObjectSchema),
          "400": jsonResponse("Invalid barcode"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/items/search": {
      get: protectedOperation({
        tags: ["Items"],
        summary: "Search items",
        parameters: [stringQueryParameter("search", "Free-text search")],
        responses: {
          "200": jsonResponse("Items retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/items": {
      get: protectedOperation({
        tags: ["Items"],
        summary: "List all items",
        responses: {
          "200": jsonResponse("Items retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      post: protectedOperation({
        tags: ["Items"],
        summary: "Create an item",
        requestBody: jsonRequestBody(toOpenApiSchema(CreateItemSchema)),
        responses: {
          "201": jsonResponse("Item created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/items/{id}": {
      get: protectedOperation({
        tags: ["Items"],
        summary: "Get an item by ID",
        parameters: [uuidPathParameter("id", "Item ID")],
        responses: {
          "200": jsonResponse("Item retrieved", genericObjectSchema),
          "400": jsonResponse("Invalid item ID"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      put: protectedOperation({
        tags: ["Items"],
        summary: "Update an item",
        parameters: [uuidPathParameter("id", "Item ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(EditItemSchema)),
        responses: {
          "200": jsonResponse("Item updated", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      delete: protectedOperation({
        tags: ["Items"],
        summary: "Delete an item",
        parameters: [uuidPathParameter("id", "Item ID")],
        responses: {
          "200": jsonResponse("Item deleted"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/vendors/paginated": {
      get: protectedOperation({
        tags: ["Vendors"],
        summary: "List paginated vendors",
        parameters: [
          integerQueryParameter("page", "Page number", { minimum: 1 }),
          integerQueryParameter("limit", "Page size", { minimum: 1, maximum: 100 }),
        ],
        responses: {
          "200": jsonResponse("Paginated vendors", paginatedDataSchema()),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/vendors": {
      get: protectedOperation({
        tags: ["Vendors"],
        summary: "List vendors",
        responses: {
          "200": jsonResponse("Vendors retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      post: protectedOperation({
        tags: ["Vendors"],
        summary: "Create a vendor",
        requestBody: jsonRequestBody(toOpenApiSchema(CreateVendorSchema)),
        responses: {
          "201": jsonResponse("Vendor created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/vendors/{id}": {
      put: protectedOperation({
        tags: ["Vendors"],
        summary: "Update a vendor",
        parameters: [uuidPathParameter("id", "Vendor ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(EditVendorSchema)),
        responses: {
          "200": jsonResponse("Vendor updated", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      delete: protectedOperation({
        tags: ["Vendors"],
        summary: "Delete a vendor",
        parameters: [uuidPathParameter("id", "Vendor ID")],
        responses: {
          "200": jsonResponse("Vendor deleted"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/locations/paginated": {
      get: protectedOperation({
        tags: ["Locations"],
        summary: "List paginated locations",
        parameters: [
          integerQueryParameter("page", "Page number", { minimum: 1 }),
          integerQueryParameter("limit", "Page size", { minimum: 1, maximum: 100 }),
        ],
        responses: {
          "200": jsonResponse("Paginated locations", paginatedDataSchema()),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/locations": {
      get: protectedOperation({
        tags: ["Locations"],
        summary: "List locations",
        responses: {
          "200": jsonResponse("Locations retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      post: protectedOperation({
        tags: ["Locations"],
        summary: "Create a location",
        requestBody: jsonRequestBody(toOpenApiSchema(CreateLocationSchema)),
        responses: {
          "201": jsonResponse("Location created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/locations/{id}": {
      put: protectedOperation({
        tags: ["Locations"],
        summary: "Update a location",
        parameters: [uuidPathParameter("id", "Location ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(EditLocationSchema)),
        responses: {
          "200": jsonResponse("Location updated", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      delete: protectedOperation({
        tags: ["Locations"],
        summary: "Delete a location",
        parameters: [uuidPathParameter("id", "Location ID")],
        responses: {
          "200": jsonResponse("Location deleted"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/units": {
      get: protectedOperation({
        tags: ["Units"],
        summary: "List units",
        responses: {
          "200": jsonResponse("Units retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      post: protectedOperation({
        tags: ["Units"],
        summary: "Create a unit",
        requestBody: jsonRequestBody(toOpenApiSchema(CreateUnitSchema)),
        responses: {
          "201": jsonResponse("Unit created", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/units/{id}": {
      put: protectedOperation({
        tags: ["Units"],
        summary: "Update a unit",
        parameters: [uuidPathParameter("id", "Unit ID")],
        requestBody: jsonRequestBody(toOpenApiSchema(EditUnitSchema)),
        responses: {
          "200": jsonResponse("Unit updated", genericObjectSchema),
          "400": jsonResponse("Invalid request body"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
      delete: protectedOperation({
        tags: ["Units"],
        summary: "Delete a unit",
        parameters: [uuidPathParameter("id", "Unit ID")],
        responses: {
          "200": jsonResponse("Unit deleted"),
          "401": jsonResponse("Unauthorized"),
          "403": jsonResponse("Forbidden"),
        },
      }),
    },
    "/item-statuses/paginated": {
      get: protectedOperation({
        tags: ["Item Statuses"],
        summary: "List paginated item statuses",
        parameters: [
          integerQueryParameter("page", "Page number", { minimum: 1 }),
          integerQueryParameter("limit", "Page size", { minimum: 1, maximum: 100 }),
        ],
        responses: {
          "200": jsonResponse("Paginated item statuses", paginatedDataSchema()),
          "401": jsonResponse("Unauthorized"),
        },
      }),
    },
    "/item-statuses": {
      get: protectedOperation({
        tags: ["Item Statuses"],
        summary: "List item statuses",
        responses: {
          "200": jsonResponse("Item statuses retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
        },
      }),
    },
    "/user": {
      get: protectedOperation({
        tags: ["Users"],
        summary: "List users",
        responses: {
          "200": jsonResponse("Users retrieved", genericArraySchema),
          "401": jsonResponse("Unauthorized"),
        },
      }),
    },
  },
} as const;
