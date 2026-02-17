import {
  PermissionGroupCreateInput,
  UserCreateInput,
} from "@/generated/prisma/models";

import { PrismaClient } from "@prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";

// Use crypto to generate random hex strings

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const permissionGroups = [
  { name: "Kurt" },
  { name: "Administrator" },
  { name: "Medarbejder" },
  { name: "BundenAfFødekæden" },
] as const satisfies PermissionGroupCreateInput[];

type PermissionSeed = {
  code: string;
  group: string;
  description: string;
};

const permissions: PermissionSeed[] = [
  {
    code: "administrator:users:view",
    group: "Administrator",
    description: "See users information",
  },
  {
    code: "administrator:users:update",
    group: "Administrator",
    description: "Update users information",
  },
  {
    code: "administrator:users:create",
    group: "Administrator",
    description: "Create new users",
  },
  {
    code: "administrator:users:management",
    group: "Administrator",
    description: "Give user permissions",
  },
  {
    code: "administrator:permission:create",
    group: "Administrator",
    description: "Create new permission",
  },
  {
    code: "administrator:permission:view",
    group: "Administrator",
    description: "View permissions and their groups",
  },
  {
    code: "administrator:permissiongroup:create",
    group: "Administrator",
    description: "Create new permission group",
  },
  {
    code: "administrator:dashboard:view",
    group: "Administrator",
    description: "View the admin dashboard",
  },
  {
    code: "administrator:dashboard:login",
    group: "Administrator",
    description: "Login to the admin dashboard",
  },
  { code: "storage:view", group: "storage", description: "View storage" },
  {
    code: "storage:create:item",
    group: "Storage",
    description: "Create storage item",
  },
];

const roles = [
  {
    name: "Admin",
    description: "Full access",
    permissionCodes: permissions.map((permission) => permission.code),
  },
  {
    name: "Kurt",
    description: "Han er ham",
    permissionCodes: ["storage:view", "storage:create:item"],
  },
  {
    name: "Medarbejder",
    description: "Almindelig medarbejder",
    permissionCodes: ["storage:view"],
  },
  {
    name: "BundenAfFødekæden",
    description: "Lærlinge og praktikanter",
    permissionCodes: [],
  },
];

const users = [
  {
    initials: "AD",
    username: "admin",
    password: "admin",
    firstName: "Super",
    lastName: "Admin",
    email: "admin@example.com",
  },
  {
    initials: "KU",
    username: "kurt",
    password: "12345678",
    firstName: "Kurt",
    lastName: "Kurtsen",
    email: "kurt@example.com",
  },
  {
    initials: "MAB",
    username: "medarbejder",
    password: "87654321",
    firstName: "Medarbejder",
    lastName: "Bruger",
    email: "medarbejder@example.com",
  },
  {
    initials: "BOT",
    username: "elev",
    password: "elev",
    firstName: "BundenAf",
    lastName: "Fødekæden",
    email: "noob69@example.com",
  },
] satisfies UserCreateInput[];

/**
 * Used for generating test data to PostgreSQL database
 * PostgreSQL database is used in the app and management side
 */
async function seedDatabase() {
  console.log("Seeding database...");

  // Insert permission groups if not existing
  const existingGroups = await prisma.permissionGroup.count();
  if (existingGroups === 0) {
    await prisma.permissionGroup.createMany({
      data: permissionGroups,
      skipDuplicates: true,
    });
  }

  // Fetch Permission Group IDs
  const permissionGroupsMap = Object.fromEntries(
    (
      await prisma.permissionGroup.findMany({
        select: { id: true, name: true },
      })
    ).map((pg) => [pg.name, pg.id]),
  );

  // Insert permissions if not existing
  const existingPermissions = await prisma.permission.count();
  if (existingPermissions === 0) {
    await prisma.permission.createMany({
      data: permissions.map(({ code, group, description }) => ({
        code,
        description,
        permissionGroupId: permissionGroupsMap[group],
      })),
      skipDuplicates: true,
    });
  }

  // Insert roles if not existing
  const existingRoles = await prisma.role.count();
  if (existingRoles === 0) {
    await prisma.role.createMany({
      data: roles.map(({ name, description }) => ({ name, description })),
      skipDuplicates: true,
    });
  }

  const permissionsMap = Object.fromEntries(
    (
      await prisma.permission.findMany({ select: { id: true, code: true } })
    ).map((permission) => [permission.code, permission.id]),
  );

  for (const role of roles) {
    const permissionIds = role.permissionCodes
      .map((code) => permissionsMap[code])
      .filter(Boolean)
      .map((id) => ({ id }));

    if (permissionIds.length === 0) continue;

    await prisma.role.update({
      where: { name: role.name },
      data: { permissions: { connect: permissionIds } },
    });
  }

  // Insert users if not existing
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await hash(user.password),
      })),
    );

    await prisma.user.createMany({
      data: usersWithHashedPasswords,
      skipDuplicates: true,
    });
  }

  // Fetch User IDs
  const usersMap = Object.fromEntries(
    (await prisma.user.findMany({ select: { id: true, username: true } })).map(
      (user) => [user.username, user.id],
    ),
  );

  const rolesMap = Object.fromEntries(
    (await prisma.role.findMany({ select: { id: true, name: true } })).map(
      (role) => [role.name, role.id],
    ),
  );

  await assignRoles(usersMap, "admin", rolesMap["Admin"]);
  await assignRoles(usersMap, "kok", rolesMap["Kok"]);
  await assignRoles(usersMap, "tjener", rolesMap["Tjener"]);
  await assignRoles(usersMap, "administration", rolesMap["Administration"]);

  async function assignRoles(
    usersMap: { [k: string]: string },
    username: string,
    roleId: string | undefined,
  ) {
    const userId = usersMap[username];

    if (!userId || !roleId) {
      console.warn(`Skipping role assignment for ${username}.`);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roles: { connect: { id: roleId } } },
    });
  }
}

/**
 * Generate data to PostgreSQL
 */
seedDatabase()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
