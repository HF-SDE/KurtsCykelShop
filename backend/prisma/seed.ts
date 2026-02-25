import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";
import { PermissionGroupCreateInput, UserCreateInput } from "@prisma/models";

// Note: Faker will use default locale. For Danish-specific data, we use faker methods that support localization
// The Danish locale (da) is available in faker for names, addresses, phone numbers etc.

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const permissionGroups = [
  { name: "Kurt" },
  { name: "Administrator" },
  { name: "Medarbejder" },
  { name: "BundenAfFødekæden" },
  { name: "Storage" },
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
    code: "administrator:roles:view",
    group: "Administrator",
    description: "View roles",
  },
  {
    code: "administrator:roles:create",
    group: "Administrator",
    description: "Create new roles",
  },
  {
    code: "administrator:roles:update",
    group: "Administrator",
    description: "Update existing roles",
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
  { code: "storage:view", group: "Storage", description: "View storage" },
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
    (await prisma.permission.findMany({ select: { id: true, code: true } })).map((permission) => [
      permission.code,
      permission.id,
    ]),
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
    (await prisma.user.findMany({ select: { id: true, username: true } })).map((user) => [user.username, user.id]),
  );

  const rolesMap = Object.fromEntries(
    (await prisma.role.findMany({ select: { id: true, name: true } })).map((role) => [role.name, role.id]),
  );

  // await assignRoles(usersMap, "admin", rolesMap["Admin"]);
  // await assignRoles(usersMap, "kok", rolesMap["Kok"]);
  // await assignRoles(usersMap, "tjener", rolesMap["Tjener"]);
  // await assignRoles(usersMap, "administration", rolesMap["Administration"]);
  // todo: assign the right roles to users

  async function assignRoles(usersMap: { [k: string]: string }, username: string, roleId: string | undefined) {
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

  // ==================== Helper Functions for Generating Test Data ====================

  function generateUnits() {
    const units = [
      { code: "STK", name: "Stykker" },
      { code: "PAR", name: "Par" },
      { code: "SÆT", name: "Sæt" },
      { code: "MTR", name: "Meter" },
      { code: "LTR", name: "Liter" },
      { code: "KG", name: "Kilogram" },
      { code: "GRM", name: "Gram" },
      { code: "BOX", name: "Kasse" },
      { code: "PKG", name: "Pakke" },
      { code: "RUL", name: "Rulle" },
      { code: "TUB", name: "Tube" },
      { code: "FLS", name: "Flaske" },
      { code: "DÅS", name: "Dåse" },
      { code: "CM", name: "Centimeter" },
      { code: "MM", name: "Millimeter" },
    ];
    return units;
  }

  function generateItemStatuses() {
    const statuses = [
      { code: "IN_STOCK", description: "På lager" },
      { code: "OUT_OF_STOCK", description: "Udsolgt" },
      { code: "ORDERED", description: "Bestilt" },
      { code: "DISCONTINUED", description: "Udgået" },
      { code: "RESERVED", description: "Reserveret" },
      { code: "DAMAGED", description: "Defekt" },
      { code: "RETURN", description: "Retur" },
      { code: "PENDING", description: "Afventer" },
    ];
    return statuses;
  }

  function generateLocations() {
    const locations = [
      { name: "Hylde A1", description: "Hovedlager - øverste hylde", isActive: true },
      { name: "Hylde A2", description: "Hovedlager - midterste hylde", isActive: true },
      { name: "Hylde A3", description: "Hovedlager - nederste hylde", isActive: true },
      { name: "Hylde B1", description: "Sekundært lager - øverste hylde", isActive: true },
      { name: "Hylde B2", description: "Sekundært lager - midterste hylde", isActive: true },
      { name: "Værksted 1", description: "Værkstedsområde - primær", isActive: true },
      { name: "Værksted 2", description: "Værkstedsområde - sekundær", isActive: true },
      { name: "Showroom", description: "Udstillingsrum", isActive: true },
      { name: "Baglokale", description: "Baglokale opbevaring", isActive: true },
      { name: "Kælder", description: "Kælder opbevaring", isActive: true },
      { name: "Loft", description: "Loft opbevaring", isActive: false },
      { name: "Modtagelse", description: "Modtagelsesområde", isActive: true },
    ];
    return locations;
  }

  function generateVendors() {
    const vendors = [];
    const vendorNames = [
      "Shimano Danmark ApS",
      "SRAM Nordic",
      "Campagnolo Scandinavia",
      "Continental Cykeldæk",
      "Schwalbe Danmark",
      "Mavic Wheels Nordic",
      "DT Swiss Danmark",
      "Brooks England",
      "Selle Royal",
      "FSA Components",
      "Race Face Nordic",
      "Hope Technology",
      "Chris King Denmark",
      "Park Tool Supply",
      "Pedro's Danmark",
      "Finish Line Nordic",
      "Muc-Off Scandinavia",
      "Kool Stop Danmark",
      "Jagwire Components",
      "Bontrager Nordic",
      "Vittoria Tires Denmark",
      "Ergon Bike",
      "Topeak Denmark",
      "Lezyne Danmark",
      "Cateye Nordic",
    ];

    for (const name of vendorNames) {
      vendors.push({
        name,
        address: faker.location.streetAddress(),
        mail: faker.internet.email({ provider: "example.dk" }),
        phone: faker.phone.number(),
        url: `https://www.${name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}.dk`,
        description: `Leverandør af cykeldele og tilbehør`,
      });
    }
    return vendors;
  }

  function generateReferenceTypes() {
    return [
      { name: "ServiceOrder" },
      { name: "Sale" },
      { name: "Return" },
      { name: "Adjustment" },
      { name: "Transfer" },
      { name: "Purchase" },
      { name: "Damaged" },
      { name: "Theft" },
    ];
  }

  function generateCustomers(count: number) {
    const customers = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      let email = faker.internet.email({ firstName, lastName, provider: "example.dk" }).toLowerCase();

      // Ensure unique email
      while (usedEmails.has(email)) {
        email = faker.internet.email({ firstName, lastName, provider: "example.dk" }).toLowerCase();
      }
      usedEmails.add(email);

      customers.push({
        firstName,
        lastName,
        email,
        phone: Math.random() > 0.2 ? faker.phone.number() : null, // 20% null phones
      });
    }
    return customers;
  }

  function generateItems(
    count: number,
    unitIds: string[],
    statusIds: string[],
    locationIds: string[],
    vendorIds: string[],
  ) {
    const items = [];
    const partNames = [
      "Kæde",
      "Kassette",
      "Krank",
      "Pedaler",
      "Håndtag",
      "Sadelstang",
      "Sadel",
      "Forgaffel",
      "Styr",
      "Bremsekaliber",
      "Bremseklodser",
      "Bremseskiver",
      "Dæk",
      "Slange",
      "Fælg",
      "Nav",
      "Eger",
      "Gear",
      "Skiftegreb",
      "Kabel",
      "Gearhus",
      "Krankleje",
      "Styrleje",
      "Lygte for",
      "Lygte bag",
      "Refleks",
      "Pumpe",
      "Lås",
      "Kampagne",
      "Bæreposer",
    ];

    const brands = [
      "Shimano",
      "SRAM",
      "Campagnolo",
      "Continental",
      "Schwalbe",
      "Mavic",
      "Brooks",
      "FSA",
      "Hope",
      "Chris King",
    ];

    for (let i = 0; i < count; i++) {
      const partName = faker.helpers.arrayElement(partNames);
      const brand = faker.helpers.arrayElement(brands);
      const model = faker.string.alphanumeric(3).toUpperCase();

      // Realistic quantity distribution
      let quantity: number;
      const rand = Math.random();
      if (rand < 0.1) {
        quantity = 0; // 10% out of stock
      } else if (rand < 0.3) {
        quantity = faker.number.int({ min: 1, max: 10 }); // 20% low stock
      } else {
        quantity = faker.number.int({ min: 11, max: 150 }); // 70% well stocked
      }

      // Price in øre (cents) - realistic bike part prices
      const price = faker.number.int({ min: 5000, max: 500000 }); // 50-5000 kr
      const purchasePrice = Math.floor(price * faker.number.float({ min: 0.5, max: 0.9 })); // Purchase price is 50-90% of sale price

      items.push({
        sku: `BIKE-${String(i + 1).padStart(5, "0")}`,
        name: `${brand} ${partName} ${model}`,
        description: faker.commerce.productDescription(),
        quantity,
        minSellQuantity: faker.number.int({ min: 1, max: 5 }),
        price,
        purchasePrice,
        isPublic: Math.random() > 0.3, // 70% public
        unitId: faker.helpers.arrayElement(unitIds),
        statusId: quantity === 0 ? statusIds.find((id, idx) => idx === 1) || statusIds[0] : statusIds[0], // OUT_OF_STOCK if quantity is 0
        locationId: faker.helpers.arrayElement(locationIds),
        vendorId: faker.helpers.arrayElement(vendorIds),
      });
    }
    return items;
  }

  function generateBarcodes(itemIds: string[], count: number) {
    const barcodes = [];
    const usedCodes = new Set<string>();

    // Distribute 1-3 barcodes per item
    for (const itemId of itemIds) {
      const numBarcodes = Math.floor(Math.random() * 3) + 1; // 1-3 barcodes

      for (let i = 0; i < numBarcodes && barcodes.length < count; i++) {
        let code = faker.string.numeric(13); // EAN-13 format

        // Ensure unique barcode
        while (usedCodes.has(code)) {
          code = faker.string.numeric(13);
        }
        usedCodes.add(code);

        barcodes.push({
          code,
          itemId,
        });
      }

      if (barcodes.length >= count) break;
    }
    return barcodes;
  }

  function generateServiceOrders(count: number, customerIds: string[], userIds: string[]) {
    const orders = [];
    const statuses = ["completed", "in-progress", "pending", "cancelled"];
    const statusWeights = [0.4, 0.3, 0.2, 0.1]; // 40%, 30%, 20%, 10%

    // Date range: last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 0; i < count; i++) {
      const createdAt = faker.date.between({ from: sixMonthsAgo, to: new Date() });
      const estimatedCompletion = faker.date.soon({ days: faker.number.int({ min: 1, max: 14 }), refDate: createdAt });

      // Weighted random status selection
      const rand = Math.random();
      let status = statuses[0];
      let cumulative = 0;
      for (let j = 0; j < statuses.length; j++) {
        cumulative += statusWeights[j];
        if (rand <= cumulative) {
          status = statuses[j];
          break;
        }
      }

      const completedAt =
        status === "completed" ? faker.date.between({ from: createdAt, to: estimatedCompletion }) : null;

      orders.push({
        customerId: faker.helpers.arrayElement(customerIds),
        description: faker.lorem.sentence(),
        estimatedCompletion,
        completedAt,
        assignedToId: Math.random() > 0.25 ? faker.helpers.arrayElement(userIds) : null, // 75% assigned, 25% unassigned
        assignedById: faker.helpers.arrayElement(userIds),
        status,
        createdAt,
      });
    }
    return orders;
  }

  function generateServiceRepairs(serviceOrderIds: string[], userIds: string[], count: number) {
    const repairs = [];
    const repairTitles = [
      "Udskiftning af kæde",
      "Justering af gear",
      "Udskiftning af bremseklodser",
      "Hjuljustering",
      "Udskiftning af dæk",
      "Reparation af punktering",
      "Udskiftning af kabeltræk",
      "Justering af bremser",
      "Udskiftning af kranklejre",
      "Reparation af gaffel",
      "Udskiftning af pedaler",
      "Styrleje justering",
      "Udskiftning af sadel",
      "Reparation af eger",
      "Komplet service",
    ];

    // 1-2 repairs per order on average
    for (const orderId of serviceOrderIds) {
      const numRepairs = Math.random() < 0.6 ? 1 : Math.random() < 0.9 ? 2 : 0; // 60% one, 30% two, 10% none

      for (let i = 0; i < numRepairs && repairs.length < count; i++) {
        repairs.push({
          serviceOrderId: orderId,
          title: faker.helpers.arrayElement(repairTitles),
          description: faker.lorem.paragraph(),
          createdById: faker.helpers.arrayElement(userIds),
        });
      }

      if (repairs.length >= count) break;
    }
    return repairs;
  }

  function generateServicePartsUsed(serviceOrderIds: string[], itemIds: string[], count: number) {
    const parts = [];
    const usedPairs = new Set<string>();

    // 0-3 parts per order on average
    for (const orderId of serviceOrderIds) {
      const numParts = Math.floor(Math.random() * 4); // 0-3 parts
      const shuffledItems = faker.helpers.shuffle([...itemIds]);

      for (let i = 0; i < numParts && i < shuffledItems.length && parts.length < count; i++) {
        const itemId = shuffledItems[i];
        const pairKey = `${orderId}-${itemId}`;

        // Respect unique constraint
        if (!usedPairs.has(pairKey)) {
          usedPairs.add(pairKey);
          parts.push({
            serviceOrderId: orderId,
            itemId,
            quantity: faker.number.int({ min: 1, max: 5 }),
          });
        }
      }

      if (parts.length >= count) break;
    }
    return parts;
  }

  function generateServiceOrderInvoices(completedOrderIds: string[]) {
    return completedOrderIds.map((orderId) => ({
      serviceOrderId: orderId,
      price: faker.number.int({ min: 50000, max: 2000000 }), // 500-20000 kr
      issuedAt: faker.date.recent({ days: 30 }),
    }));
  }

  function generateCustomerLogs(customerIds: string[], userIds: string[], count: number) {
    const logs = [];
    const fields = ["firstName", "lastName", "email", "phone"];

    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      logs.push({
        customerId: faker.helpers.arrayElement(customerIds),
        tableField: faker.helpers.arrayElement(fields),
        oldValue: faker.person.firstName(),
        newValue: faker.person.firstName(),
        changedById: faker.helpers.arrayElement(userIds),
        changedByName: `${user.firstName} ${user.lastName}`,
      });
    }
    return logs;
  }

  function generateServiceOrderLogs(serviceOrderIds: string[], userIds: string[], count: number) {
    const logs = [];
    const fields = ["status", "assignedToId", "description", "estimatedCompletion"];
    const statuses = ["completed", "in-progress", "pending", "cancelled"];

    for (let i = 0; i < count; i++) {
      const field = faker.helpers.arrayElement(fields);
      const user = faker.helpers.arrayElement(users);
      let oldValue: string | null = null;
      let newValue: string | null = null;

      if (field === "status") {
        oldValue = faker.helpers.arrayElement(statuses);
        newValue = faker.helpers.arrayElement(statuses);
      } else if (field === "assignedToId") {
        oldValue = faker.helpers.arrayElement(userIds);
        newValue = faker.helpers.arrayElement(userIds);
      } else {
        oldValue = faker.lorem.sentence();
        newValue = faker.lorem.sentence();
      }

      logs.push({
        serviceOrderId: faker.helpers.arrayElement(serviceOrderIds),
        tableField: field,
        oldValue,
        newValue,
        changedById: faker.helpers.arrayElement(userIds),
        changedByName: `${user.firstName} ${user.lastName}`,
      });
    }
    return logs;
  }

  function generateLocationLogs(locationIds: string[], userIds: string[], count: number) {
    const logs = [];

    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      logs.push({
        locationId: faker.helpers.arrayElement(locationIds),
        tableField: "location",
        oldLocationId: faker.helpers.arrayElement(locationIds),
        newLocationId: faker.helpers.arrayElement(locationIds),
        changedById: faker.helpers.arrayElement(userIds),
        changedByName: `${user.firstName} ${user.lastName}`,
      });
    }
    return logs;
  }

  function generatePriceLogs(itemIds: string[], userIds: string[], count: number) {
    const logs = [];

    for (let i = 0; i < count; i++) {
      const oldPrice = faker.number.int({ min: 5000, max: 400000 });
      const newPrice = faker.number.int({ min: 5000, max: 400000 });
      const user = faker.helpers.arrayElement(users);

      logs.push({
        itemId: faker.helpers.arrayElement(itemIds),
        oldPrice,
        newPrice,
        changedById: faker.helpers.arrayElement(userIds),
        changedByName: `${user.firstName} ${user.lastName}`,
      });
    }
    return logs;
  }

  function generateInventoryTransactions(
    itemIds: string[],
    locationIds: string[],
    unitIds: string[],
    referenceTypeIds: string[],
    userIds: string[],
    count: number,
  ) {
    const transactions = [];
    const types = ["IN", "OUT", "ADJUSTMENT", "TRANSFER"];

    // Date range: last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (let i = 0; i < count; i++) {
      const type = faker.helpers.arrayElement(types);
      const quantityChange =
        type === "IN" ? faker.number.int({ min: 1, max: 50 }) : faker.number.int({ min: -50, max: -1 });
      const user = faker.helpers.arrayElement(users);

      transactions.push({
        itemId: faker.helpers.arrayElement(itemIds),
        locationId: faker.helpers.arrayElement(locationIds),
        type,
        quantityChange,
        unitId: faker.helpers.arrayElement(unitIds),
        referenceTypeId: faker.helpers.arrayElement(referenceTypeIds),
        referenceId: faker.string.uuid(),
        performedById: faker.helpers.arrayElement(userIds),
        performedByName: `${user.firstName} ${user.lastName}`,
        createdAt: faker.date.between({ from: oneYearAgo, to: new Date() }),
      });
    }
    return transactions;
  }

  function generateSaleLogs(itemIds: string[], unitIds: string[], userIds: string[], count: number) {
    const sales = [];

    // Date range: last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (let i = 0; i < count; i++) {
      const originalPrice = faker.number.int({ min: 5000, max: 500000 });
      const salePrice =
        Math.random() > 0.7 ? faker.number.int({ min: originalPrice * 0.7, max: originalPrice * 0.95 }) : originalPrice; // 30% discounted

      sales.push({
        itemId: faker.helpers.arrayElement(itemIds),
        salePricePerUnit: Math.floor(salePrice),
        originalPricePerUnit: originalPrice,
        quantity: faker.number.int({ min: 1, max: 10 }),
        unitId: faker.helpers.arrayElement(unitIds),
        soldById: faker.helpers.arrayElement(userIds),
        createdAt: faker.date.between({ from: oneYearAgo, to: new Date() }),
      });
    }
    return sales;
  }

  // ==================== Seeding Logic ====================

  console.log("\n🌱 Seeding foundation models...");

  // Seed Units
  const existingUnits = await prisma.unit.count();
  if (existingUnits === 0) {
    const unitsData = generateUnits();
    await prisma.unit.createMany({ data: unitsData });
    console.log(`✅ Created ${unitsData.length} units`);
  }

  // Seed ItemStatuses
  const existingItemStatuses = await prisma.itemStatus.count();
  if (existingItemStatuses === 0) {
    const statusesData = generateItemStatuses();
    await prisma.itemStatus.createMany({ data: statusesData });
    console.log(`✅ Created ${statusesData.length} item statuses`);
  }

  // Seed Locations
  const existingLocations = await prisma.location.count();
  if (existingLocations === 0) {
    const locationsData = generateLocations();
    await prisma.location.createMany({ data: locationsData });
    console.log(`✅ Created ${locationsData.length} locations`);
  }

  // Seed Vendors
  const existingVendors = await prisma.vendor.count();
  if (existingVendors === 0) {
    const vendorsData = generateVendors();
    await prisma.vendor.createMany({ data: vendorsData });
    console.log(`✅ Created ${vendorsData.length} vendors`);
  }

  // Seed ReferenceTypes
  const existingReferenceTypes = await prisma.referenceType.count();
  if (existingReferenceTypes === 0) {
    const referenceTypesData = generateReferenceTypes();
    await prisma.referenceType.createMany({ data: referenceTypesData });
    console.log(`✅ Created ${referenceTypesData.length} reference types`);
  }

  // Fetch IDs for foreign keys
  const allUnits = await prisma.unit.findMany({ select: { id: true } });
  const unitIds = allUnits.map((u) => u.id);

  const allStatuses = await prisma.itemStatus.findMany({ select: { id: true } });
  const statusIds = allStatuses.map((s) => s.id);

  const allLocations = await prisma.location.findMany({ select: { id: true } });
  const locationIds = allLocations.map((l) => l.id);

  const allVendors = await prisma.vendor.findMany({ select: { id: true } });
  const vendorIds = allVendors.map((v) => v.id);

  const allReferenceTypes = await prisma.referenceType.findMany({ select: { id: true } });
  const referenceTypeIds = allReferenceTypes.map((r) => r.id);

  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const userIdsList = allUsers.map((u) => u.id);

  console.log("\n🌱 Seeding business entities...");

  // Seed Customers
  const existingCustomers = await prisma.customer.count();
  if (existingCustomers === 0) {
    const customersData = generateCustomers(100);
    await prisma.customer.createMany({ data: customersData });
    console.log(`✅ Created ${customersData.length} customers`);
  }

  const allCustomers = await prisma.customer.findMany({ select: { id: true } });
  const customerIds = allCustomers.map((c) => c.id);

  // Seed Items
  const existingItems = await prisma.item.count();
  if (existingItems === 0) {
    const itemsData = generateItems(100, unitIds, statusIds, locationIds, vendorIds);
    await prisma.item.createMany({ data: itemsData });
    console.log(`✅ Created ${itemsData.length} items`);
  }

  const allItems = await prisma.item.findMany({ select: { id: true } });
  const itemIds = allItems.map((i) => i.id);

  // Seed Barcodes
  const existingBarcodes = await prisma.barcode.count();
  if (existingBarcodes === 0) {
    const barcodesData = generateBarcodes(itemIds, 200);
    await prisma.barcode.createMany({ data: barcodesData });
    console.log(`✅ Created ${barcodesData.length} barcodes`);
  }

  console.log("\n🌱 Seeding service orders...");

  // Seed ServiceOrders
  const existingServiceOrders = await prisma.serviceOrder.count();
  if (existingServiceOrders === 0) {
    const serviceOrdersData = generateServiceOrders(100, customerIds, userIdsList);
    await prisma.serviceOrder.createMany({ data: serviceOrdersData });
    console.log(`✅ Created ${serviceOrdersData.length} service orders`);
  }

  const allServiceOrders = await prisma.serviceOrder.findMany({ select: { id: true, status: true } });
  const serviceOrderIds = allServiceOrders.map((so) => so.id);
  const completedOrderIds = allServiceOrders.filter((so) => so.status === "completed").map((so) => so.id);

  // Seed ServiceRepairs
  const existingServiceRepairs = await prisma.serviceRepair.count();
  if (existingServiceRepairs === 0) {
    const serviceRepairsData = generateServiceRepairs(serviceOrderIds, userIdsList, 150);
    await prisma.serviceRepair.createMany({ data: serviceRepairsData });
    console.log(`✅ Created ${serviceRepairsData.length} service repairs`);
  }

  // Seed ServicePartsUsed
  const existingServicePartsUsed = await prisma.servicePartsUsed.count();
  if (existingServicePartsUsed === 0) {
    const servicePartsUsedData = generateServicePartsUsed(serviceOrderIds, itemIds, 220);
    await prisma.servicePartsUsed.createMany({ data: servicePartsUsedData });
    console.log(`✅ Created ${servicePartsUsedData.length} service parts used`);
  }

  // Seed ServiceOrderInvoices
  const existingServiceOrderInvoices = await prisma.serviceOrderInvoice.count();
  if (existingServiceOrderInvoices === 0) {
    const serviceOrderInvoicesData = generateServiceOrderInvoices(completedOrderIds);
    await prisma.serviceOrderInvoice.createMany({ data: serviceOrderInvoicesData });
    console.log(`✅ Created ${serviceOrderInvoicesData.length} service order invoices`);
  }

  console.log("\n🌱 Seeding logs...");

  // Seed CustomerLogs
  const existingCustomerLogs = await prisma.customerLog.count();
  if (existingCustomerLogs === 0) {
    const customerLogsData = generateCustomerLogs(customerIds, userIdsList, 150);
    await prisma.customerLog.createMany({ data: customerLogsData });
    console.log(`✅ Created ${customerLogsData.length} customer logs`);
  }

  // Seed ServiceOrderLogs
  const existingServiceOrderLogs = await prisma.serviceOrderLog.count();
  if (existingServiceOrderLogs === 0) {
    const serviceOrderLogsData = generateServiceOrderLogs(serviceOrderIds, userIdsList, 250);
    await prisma.serviceOrderLog.createMany({ data: serviceOrderLogsData });
    console.log(`✅ Created ${serviceOrderLogsData.length} service order logs`);
  }

  // Seed LocationLogs
  const existingLocationLogs = await prisma.locationLog.count();
  if (existingLocationLogs === 0) {
    const locationLogsData = generateLocationLogs(locationIds, userIdsList, 80);
    await prisma.locationLog.createMany({ data: locationLogsData });
    console.log(`✅ Created ${locationLogsData.length} location logs`);
  }

  // Seed PriceLogs
  const existingPriceLogs = await prisma.priceLog.count();
  if (existingPriceLogs === 0) {
    const priceLogsData = generatePriceLogs(itemIds, userIdsList, 120);
    await prisma.priceLog.createMany({ data: priceLogsData });
    console.log(`✅ Created ${priceLogsData.length} price logs`);
  }

  console.log("\n🌱 Seeding transactions...");

  // Seed InventoryTransactions
  const existingInventoryTransactions = await prisma.inventoryTransaction.count();
  if (existingInventoryTransactions === 0) {
    const inventoryTransactionsData = generateInventoryTransactions(
      itemIds,
      locationIds,
      unitIds,
      referenceTypeIds,
      userIdsList,
      300,
    );
    await prisma.inventoryTransaction.createMany({ data: inventoryTransactionsData });
    console.log(`✅ Created ${inventoryTransactionsData.length} inventory transactions`);
  }

  // Seed SaleLogs
  const existingSaleLogs = await prisma.saleLog.count();
  if (existingSaleLogs === 0) {
    const saleLogsData = generateSaleLogs(itemIds, unitIds, userIdsList, 200);
    await prisma.saleLog.createMany({ data: saleLogsData });
    console.log(`✅ Created ${saleLogsData.length} sale logs`);
  }

  console.log("\n✨ Database seeding completed successfully!\n");
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
