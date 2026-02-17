import { faker } from "@faker-js/faker";
import {
  Prisma,
  PrismaClient,
  RawMaterial,
  RawMaterial_MenuItem,
  Table,
} from "@prisma/client";
import { menuItem } from "@utils/configs";
import { hash } from "argon2";

// Use crypto to generate random hex strings

const prisma = new PrismaClient();

const permissionGroups = [
  "Administrator",
  "Order",
  "Menu",
  "Stock",
  "Table",
  "Reservation",
  "Stripe",
] as const;
type PermissionGroups = (typeof permissionGroups)[number];
const permissions: {
  code: string;
  group: PermissionGroups;
  description: string;
}[] = [
  {
    code: "administrator:stats:view",
    group: "Administrator",
    description: "See Stats",
  },
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
  {
    code: "stripe:terminal:create",
    group: "Stripe",
    description: "Create terminal",
  },
  {
    code: "stripe:payment:create",
    group: "Stripe",
    description: "Create a payment",
  },
  {
    code: "stripe:payment:check",
    group: "Stripe",
    description: "Check if a payment was successful",
  },
  { code: "order:view", group: "Order", description: "View order" },
  { code: "order:create", group: "Order", description: "Create order" },
  {
    code: "order:status:update:completed",
    group: "Order",
    description: "Update order status to completed",
  },
  {
    code: "order:status:update:deliver",
    group: "Order",
    description: "Update order status to deliver",
  },
  { code: "menu:view", group: "Menu", description: "View menu" },
  { code: "menu:update", group: "Menu", description: "Update menu" },
  { code: "menu:create", group: "Menu", description: "Create menu" },
  { code: "menu:delete", group: "Menu", description: "Delete menu" },
  { code: "stock:view", group: "Stock", description: "View stock" },
  { code: "stock:update", group: "Stock", description: "Update stock" },
  { code: "stock:create", group: "Stock", description: "Create stock" },
  { code: "stock:delete", group: "Stock", description: "Delete stock" },
  { code: "table:view", group: "Table", description: "View tables" },
  { code: "table:create", group: "Table", description: "Create table" },
  { code: "table:delete", group: "Table", description: "Delete table" },
  {
    code: "reservation:view",
    group: "Reservation",
    description: "View reservation",
  },
  {
    code: "reservation:update",
    group: "Reservation",
    description: "Update reservation",
  },
  {
    code: "reservation:create",
    group: "Reservation",
    description: "Create reservation",
  },
  {
    code: "reservation:delete",
    group: "Reservation",
    description: "Delete reservation",
  },
];
const users = [
  {
    initials: "AD",
    username: "admin",
    password: "admin",
    name: "Super Admin",
    email: "admin@example.com",
  },
  {
    initials: "KU",
    username: "kok",
    password: "12345678",
    name: "Kok User",
    email: "kok@example.com",
  },
  {
    initials: "TU",
    username: "tjener",
    password: "87654321",
    name: "Tjener User",
    email: "tjener@example.com",
  },
  {
    initials: "ADMIN",
    username: "administration",
    password: "administration",
    name: "Admin User",
    email: "administration@example.com",
  },
];

interface Menu {
  name: string;
  price: number;
  category: string[];
}

/**
 * Menu items
 */
const menu: Menu[] = [
  { name: "Nachos Supreme", price: 129, category: ["Food"] },
  { name: "Caesar Salad", price: 139, category: ["Food"] },
  { name: "Tiger's Prawn Salad", price: 139, category: ["Food", "Salad"] },
  { name: "Vegan's salad", price: 119, category: ["Food", "Salad"] },
  { name: "Club Sandwich", price: 139, category: ["Food", "Sandwich"] },
  { name: "Salmon Sandwich", price: 149, category: ["Food", "Sandwich"] },
  { name: "Spicy Steak Sandwich", price: 149, category: ["Food", "Sandwich"] },
  { name: "Tuna Sandwich", price: 139, category: ["Food", "Sandwich"] },
  { name: "Vesuvius Burger", price: 139, category: ["Food", "Burger"] },
  { name: "Spicy Burger", price: 139, category: ["Food", "Burger"] },
  { name: "Crispy Chicken Burger", price: 139, category: ["Food", "Burger"] },
  { name: "Tomato Soup", price: 99, category: ["Food", "Soup"] },
  { name: "Pasta with Chicken", price: 169, category: ["Food", "Pasta"] },
  {
    name: "Pasta with Beef tenderloin",
    price: 179,
    category: ["Food", "Pasta"],
  },
  { name: "Pasta with tiger prawn", price: 179, category: ["Food", "Pasta"] },
  { name: "Aperol Spritz", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Espresso Martini", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Dark & Stormy", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Mojito", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Gin Tonic", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Moscow Mule", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Strawberry Daiquiri", price: 85, category: ["Drink", "Alcohol"] },
  { name: "Gin Hass", price: 85, category: ["Drink", "Alcohol"] },
];

type MenuItems = Omit<Menu, "category">;

const menuItems: MenuItems[] = menu.map((item) => ({
  name: item.name,
  price: item.price,
}));

interface RawMaterials {
  name: string;
  quantity: number;
  unit: string;
}

const rawMaterials: RawMaterials[] = [
  { name: "Jalapeno", quantity: 100, unit: "kg" },
  { name: "Cheese", quantity: 100, unit: "kg" },
  { name: "Beef", quantity: 100, unit: "kg" },
  { name: "Chicken", quantity: 100, unit: "kg" },
  { name: "Pork", quantity: 100, unit: "kg" },
  { name: "Lettuce", quantity: 100, unit: "kg" },
  { name: "Tomato", quantity: 100, unit: "kg" },
  { name: "Onion", quantity: 100, unit: "kg" },
  { name: "Bacon", quantity: 100, unit: "kg" },
  { name: "Sour cream", quantity: 100, unit: "l" },
  { name: "TortillaChip", quantity: 100, unit: "bag" },
  { name: "Salsa", quantity: 100, unit: "l" },
  { name: "Guacamole", quantity: 100, unit: "kg" },
  { name: "Cesar dressing", quantity: 100, unit: "l" },
  { name: "Croutons", quantity: 100, unit: "kg" },
  { name: "Parmesan", quantity: 100, unit: "kg" },
  { name: "Chicken breast", quantity: 100, unit: "kg" },
  { name: "Heart salad", quantity: 100, unit: "kg" },
  { name: "Tiger prawn", quantity: 100, unit: "kg" },
  { name: "Coleslaw", quantity: 100, unit: "kg" },
  { name: "Avocado", quantity: 100, unit: "pcs" },
  { name: "Noodles", quantity: 100, unit: "kg" },
  { name: "Cucumber", quantity: 100, unit: "kg" },
  { name: "Carrot", quantity: 100, unit: "kg" },
  { name: "Edamame beans", quantity: 100, unit: "kg" },
  { name: "Mint", quantity: 100, unit: "leaf" },
  { name: "Cashew nuts", quantity: 100, unit: "kg" },
  { name: "Gomadressing", quantity: 100, unit: "l" },
  { name: "Sweet potato", quantity: 100, unit: "kg" },
  { name: "Falafel", quantity: 100, unit: "kg" },
  { name: "Baby spinach", quantity: 100, unit: "kg" },
  { name: "Pomegranate", quantity: 100, unit: "kg" },
  { name: "Bulgur", quantity: 100, unit: "kg" },
  { name: "Feta", quantity: 100, unit: "kg" },
  { name: "Basil pesto", quantity: 100, unit: "l" },
  { name: "Pumpkin seeds", quantity: 100, unit: "kg" },
  { name: "Curry mayonnaise", quantity: 100, unit: "l" },
  { name: "Salad", quantity: 100, unit: "kg" },
  { name: "French fries", quantity: 100, unit: "kg" },
  { name: "Mayonnaise", quantity: 100, unit: "l" },
  { name: "Smoked salmon", quantity: 100, unit: "kg" },
  { name: "Sandwich bread", quantity: 100, unit: "pcs" },
  { name: "Pickled red onion", quantity: 100, unit: "kg" },
  { name: "Spicy chill mayo", quantity: 100, unit: "l" },
  { name: "Chill mayo", quantity: 100, unit: "l" },
  { name: "Tune moussé", quantity: 100, unit: "kg" },
  { name: "Brioche bun", quantity: 100, unit: "pcs" },
  { name: "Minced Beef", quantity: 100, unit: "kg" },
  { name: "Pickled", quantity: 100, unit: "kg" },
  { name: "Burger dressing", quantity: 100, unit: "l" },
  { name: "Fresh basil", quantity: 100, unit: "kg" },
  { name: "Butter", quantity: 100, unit: "kg" },
  { name: "Bread", quantity: 100, unit: "pcs" },
  { name: "Pasta", quantity: 100, unit: "kg" },
  { name: "Mushrooms", quantity: 100, unit: "kg" },
  { name: "Tomato sauce", quantity: 100, unit: "l" },
  { name: "Basil", quantity: 100, unit: "kg" },
  { name: "Aperol", quantity: 100, unit: "l" },
  { name: "Prosecco", quantity: 100, unit: "l" },
  { name: "Sparkling water", quantity: 100, unit: "l" },
  { name: "Orange", quantity: 100, unit: "pcs" },
  { name: "Vodka", quantity: 100, unit: "l" },
  { name: "Tequila", quantity: 100, unit: "l" },
  { name: "Espresso", quantity: 100, unit: "l" },
  { name: "Vanilla syrup", quantity: 100, unit: "l" },
  { name: "Dark rum", quantity: 100, unit: "l" },
  { name: "Kahlua", quantity: 100, unit: "l" },
  { name: "Ginger beer", quantity: 100, unit: "l" },
  { name: "Lime", quantity: 100, unit: "pcs" },
  { name: "Gum syrup", quantity: 100, unit: "l" },
  { name: "Rom", quantity: 100, unit: "l" },
  { name: "Cane sugar", quantity: 100, unit: "kg" },
  { name: "Lime juice", quantity: 100, unit: "l" },
  { name: "Gin", quantity: 100, unit: "l" },
  { name: "Tonic", quantity: 100, unit: "l" },
  { name: "Citrus", quantity: 100, unit: "pcs" },
  { name: "Lemon", quantity: 100, unit: "pcs" },
  { name: "White rom", quantity: 100, unit: "l" },
  { name: "Strawberry", quantity: 100, unit: "pcs" },
  { name: "Mango juice", quantity: 100, unit: "l" },
];

interface IRawMaterial_MenuItem {
  menuItemId: string;
  rawMaterialId: string;
  quantity: number;
}

// prettier-ignore
const rawMaterial_MenuItem: IRawMaterial_MenuItem[] = [
  // Nachos Supreme
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'TortillaChip', quantity: 0.5 },
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'Chicken', quantity: 0.3 },
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'Jalapeno', quantity: 0.1 },
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'Cheese', quantity: 0.5 },
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'Salsa', quantity: 0.08 },
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'Guacamole', quantity: 0.08 },
  { menuItemId: 'Nachos Supreme', rawMaterialId: 'Sour cream', quantity: 0.04 },
  // Caesar Salad
  { menuItemId: 'Caesar Salad', rawMaterialId: 'Chicken breast', quantity: 0.2 },
  { menuItemId: 'Caesar Salad', rawMaterialId: 'Heart salad', quantity: 0.5 },
  { menuItemId: 'Caesar Salad', rawMaterialId: 'Cesar dressing', quantity: 0.3 },
  { menuItemId: 'Caesar Salad', rawMaterialId: 'Parmesan', quantity: 0.01 },
  { menuItemId: 'Caesar Salad', rawMaterialId: 'Croutons', quantity: 0.05 },
  // Tiger's Prawn Salad
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Tiger prawn', quantity: 0.2 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Coleslaw', quantity: 0.2 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Avocado', quantity: 1 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Noodles', quantity: 0.1 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Cucumber', quantity: 0.5 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Carrot', quantity: 0.05 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Edamame beans', quantity: 0.03 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Mint', quantity: 2 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Cashew nuts', quantity: 0.05 },
  { menuItemId: "Tiger's Prawn Salad", rawMaterialId: 'Gomadressing', quantity: 0.1 },
  // Vegan's salad
  { menuItemId: "Vegan's salad", rawMaterialId: 'Sweet potato', quantity: 0.05 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Falafel', quantity: 0.02 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Baby spinach', quantity: 0.02 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Pomegranate', quantity: 0.02 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Bulgur', quantity: 0.01 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Bulgur', quantity: 0.01 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Feta', quantity: 0.04 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Tomato', quantity: 0.3 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Edamame beans', quantity: 0.01 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Basil pesto', quantity: 0.2 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Pumpkin seeds', quantity: 0.02 },
  { menuItemId: "Vegan's salad", rawMaterialId: 'Mint', quantity: 2 },

  // Club Sandwich
  { menuItemId: 'Club Sandwich', rawMaterialId: 'Chicken breast', quantity: 0.065 },
  { menuItemId: 'Club Sandwich', rawMaterialId: 'Bacon', quantity: 0.01 },
  { menuItemId: 'Club Sandwich', rawMaterialId: 'Curry mayonnaise', quantity: 0.05 },
  { menuItemId: 'Club Sandwich', rawMaterialId: 'Tomato', quantity: 0.1 },
  { menuItemId: 'Club Sandwich', rawMaterialId: 'Salad', quantity: 0.05 },

  // Salmon Sandwich
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'Smoked salmon', quantity: 0.1 },
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'Basil pesto', quantity: 0.02 },
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'Salad', quantity: 0.05 },
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'Avocado', quantity: 0.5 },
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'Pickled red onion', quantity: 0.07 },
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'Mayonnaise', quantity: 0.5 },
  { menuItemId: 'Salmon Sandwich', rawMaterialId: 'French fries', quantity: 0.2 },

  // Spicy Steak Sandwich
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Beef', quantity: 0.08 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Salad', quantity: 0.05 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Guacamole', quantity: 0.01 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Jalapeno', quantity: 0.2 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Pickled red onion', quantity: 0.07 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Spicy chill mayo', quantity: 0.02 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'Mayonnaise', quantity: 0.5 },
  { menuItemId: 'Spicy Steak Sandwich', rawMaterialId: 'French fries', quantity: 0.2 },

  // Tuna Sandwich
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'Tune moussé', quantity: 0.1 },
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'Salad', quantity: 0.05 },
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'Avocado', quantity: 0.5 },
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'Pickled red onion', quantity: 0.07 },
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'Basil pesto', quantity: 0.02 },
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'Mayonnaise', quantity: 0.5 },
  { menuItemId: 'Tuna Sandwich', rawMaterialId: 'French fries', quantity: 0.2 },

  // Vesuvius Burger
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Minced Beef', quantity: 0.1 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Brioche bun', quantity: 1 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Salad', quantity: 0.05 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Pickled', quantity: 0.05 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Tomato', quantity: 0.1 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Pickled red onion', quantity: 0.07 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Burger dressing', quantity: 0.05 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'French fries', quantity: 0.2 },
  { menuItemId: 'Vesuvius Burger', rawMaterialId: 'Mayonnaise', quantity: 0.5 },

  // Spicy Burger
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Minced Beef', quantity: 0.1 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Brioche bun', quantity: 1 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Salad', quantity: 0.05 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Tomato', quantity: 0.1 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Jalapeno', quantity: 0.05 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Pickled red onion', quantity: 0.07 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Spicy chill mayo', quantity: 0.05 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'French fries', quantity: 0.2 },
  { menuItemId: 'Spicy Burger', rawMaterialId: 'Mayonnaise', quantity: 0.5 },

  // Crispy Chicken Burger
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Chicken', quantity: 0.1 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Brioche bun', quantity: 1 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Salad', quantity: 0.05 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Tomato', quantity: 0.1 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Pickled red onion', quantity: 0.07 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Spicy chill mayo', quantity: 0.02 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Jalapeno', quantity: 0.2 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Guacamole', quantity: 0.05 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'Mayonnaise', quantity: 0.5 },
  { menuItemId: 'Crispy Chicken Burger', rawMaterialId: 'French fries', quantity: 0.2 },

  // Tomato Soup
  { menuItemId: 'Tomato Soup', rawMaterialId: 'Tomato', quantity: 1 },
  { menuItemId: 'Tomato Soup', rawMaterialId: 'Sour cream', quantity: 0.2 },
  { menuItemId: 'Tomato Soup', rawMaterialId: 'Basil', quantity: 0.01 },
  { menuItemId: 'Tomato Soup', rawMaterialId: 'Bread', quantity: 1 },
  { menuItemId: 'Tomato Soup', rawMaterialId: 'Butter', quantity: 0.01 },

  // Pasta with Chicken
  { menuItemId: 'Pasta with Chicken', rawMaterialId: 'Pasta', quantity: 0.2 },
  { menuItemId: 'Pasta with Chicken', rawMaterialId: 'Chicken', quantity: 0.2 },
  { menuItemId: 'Pasta with Chicken', rawMaterialId: 'Mushrooms', quantity: 0.05 },
  { menuItemId: 'Pasta with Chicken', rawMaterialId: 'Parmesan', quantity: 0.01 },

  // Pasta with Beef tenderloin
  { menuItemId: 'Pasta with Beef tenderloin', rawMaterialId: 'Pasta', quantity: 0.2 },
  { menuItemId: 'Pasta with Beef tenderloin', rawMaterialId: 'Beef', quantity: 0.2 },
  { menuItemId: 'Pasta with Beef tenderloin', rawMaterialId: 'Mushrooms', quantity: 0.05 },
  { menuItemId: 'Pasta with Beef tenderloin', rawMaterialId: 'Parmesan', quantity: 0.01 },

  // Pasta with tiger prawn
  { menuItemId: 'Pasta with tiger prawn', rawMaterialId: 'Pasta', quantity: 0.2 },
  { menuItemId: 'Pasta with tiger prawn', rawMaterialId: 'Tiger prawn', quantity: 0.2 },
  { menuItemId: 'Pasta with tiger prawn', rawMaterialId: 'Tomato sauce', quantity: 0.1 },
  { menuItemId: 'Pasta with tiger prawn', rawMaterialId: 'Parmesan', quantity: 0.01 },
  { menuItemId: 'Pasta with tiger prawn', rawMaterialId: 'Basil', quantity: 0.01 },

  // Aperol Spritz
  { menuItemId: 'Aperol Spritz', rawMaterialId: 'Aperol', quantity: 0.04 },
  { menuItemId: 'Aperol Spritz', rawMaterialId: 'Prosecco', quantity: 0.1 },
  { menuItemId: 'Aperol Spritz', rawMaterialId: 'Sparkling water', quantity: 0.1 },
  { menuItemId: 'Aperol Spritz', rawMaterialId: 'Orange', quantity: 0.1 },

  // Espresso Martini
  { menuItemId: 'Espresso Martini', rawMaterialId: 'Espresso', quantity: 0.1 },
  { menuItemId: 'Espresso Martini', rawMaterialId: 'Kahlua', quantity: 0.05 },
  { menuItemId: 'Espresso Martini', rawMaterialId: 'Vodka', quantity: 0.05 },
  { menuItemId: 'Espresso Martini', rawMaterialId: 'Vanilla syrup', quantity: 0.02 },

  // Dark & Stormy
  { menuItemId: 'Dark & Stormy', rawMaterialId: 'Dark rum', quantity: 0.05 },
  { menuItemId: 'Dark & Stormy', rawMaterialId: 'Ginger beer', quantity: 0.1 },
  { menuItemId: 'Dark & Stormy', rawMaterialId: 'Lime juice', quantity: 0.1 },
  { menuItemId: 'Dark & Stormy', rawMaterialId: 'Gum syrup', quantity: 0.1 },

  // Mojito
  { menuItemId: 'Mojito', rawMaterialId: 'Rom', quantity: 0.05 },
  { menuItemId: 'Mojito', rawMaterialId: 'Lime juice', quantity: 0.1 },

  { menuItemId: 'Mojito', rawMaterialId: 'Lime', quantity: 0.1 },
  { menuItemId: 'Mojito', rawMaterialId: 'Cane sugar', quantity: 0.1 },
  { menuItemId: 'Mojito', rawMaterialId: 'Mint', quantity: 2 },

  // Gin Tonic
  { menuItemId: 'Gin Tonic', rawMaterialId: 'Gin', quantity: 0.05 },
  { menuItemId: 'Gin Tonic', rawMaterialId: 'Tonic', quantity: 0.1 },
  { menuItemId: 'Gin Tonic', rawMaterialId: 'Citrus', quantity: 0.1 },

  // Moscow Mule
  { menuItemId: 'Moscow Mule', rawMaterialId: 'Vodka', quantity: 0.05 },
  { menuItemId: 'Moscow Mule', rawMaterialId: 'Ginger beer', quantity: 0.01 },
  { menuItemId: 'Moscow Mule', rawMaterialId: 'Lime juice', quantity: 0.05 },

  // Strawberry Daiquiri
  { menuItemId: 'Strawberry Daiquiri', rawMaterialId: 'White rom', quantity: 0.05, },
  { menuItemId: 'Strawberry Daiquiri', rawMaterialId: 'Strawberry', quantity: 0.1, },
  { menuItemId: 'Strawberry Daiquiri', rawMaterialId: 'Lime juice', quantity: 0.05, },
  { menuItemId: 'Strawberry Daiquiri', rawMaterialId: 'Gum syrup', quantity: 0.05, },

  // Gin Hass
  { menuItemId: 'Gin Hass', rawMaterialId: 'Gin', quantity: 0.05 },
  { menuItemId: 'Gin Hass', rawMaterialId: 'Mango juice', quantity: 0.1 },
  { menuItemId: 'Gin Hass', rawMaterialId: 'Lime juice', quantity: 0.05 },
  { menuItemId: 'Gin Hass', rawMaterialId: 'Lemon', quantity: 0.1 },
];

/**
 * Used for generating test data to PostgreSQL database
 * PostgreSQL database is used in the app and management side
 */
async function seedDatabase() {
  console.log("Seeding database...");
  const today = new Date();

  // Insert permission groups if not existing
  const existingGroups = await prisma.permissionGroup.count();
  if (existingGroups === 0) {
    await prisma.permissionGroup.createMany({
      data: permissionGroups.map((name) => ({ name })),
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

  // Insert users if not existing
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    await prisma.user.createMany({
      data: await Promise.all(
        users.map(async (user) => ({
          ...user,
          password: await hash(user.password),
        })),
      ),
      skipDuplicates: true,
    });
  }

  // Fetch User IDs
  const usersMap = Object.fromEntries(
    (await prisma.user.findMany({ select: { id: true, username: true } })).map(
      (user) => [user.username, user.id],
    ),
  );

  // Find permissions to kok user
  const kokPermission = await prisma.permission.findMany({
    where: {
      OR: [
        { code: { startsWith: "menu" } },
        { code: { startsWith: "stock" } },
        { code: { equals: "order:view" } },
        { code: { equals: "order:status:update:deliver" } },
      ],
    },
  });

  // Find permissions to tjener user
  const tjenerPermission = await prisma.permission.findMany({
    where: {
      OR: [
        { code: { equals: "order:status:update:deliver" } },
        { code: { equals: "order:status:update:completed" } },
        { code: { equals: "order:view" } },
        { code: { equals: "order:create" } },
        { code: { equals: "table:view" } },
        { code: { equals: "stock:view" } },
        { code: { startsWith: "reservation" } },
        { code: { startsWith: "stripe" } },
      ],
    },
  });

  // Find permissions to administration user
  const administrationPermission = await prisma.permission.findMany({
    where: {
      OR: [
        { code: { startsWith: "administrator" } },
        { code: { startsWith: "menu" } },
        { code: { startsWith: "stock" } },
        { code: { startsWith: "table" } },
      ],
    },
  });

  await assignPermissions(
    usersMap,
    "admin",
    permissions.map((p) => p.code),
  );
  await assignPermissions(
    usersMap,
    "kok",
    kokPermission.map((p) => p.code),
  );
  await assignPermissions(
    usersMap,
    "tjener",
    tjenerPermission.map((p) => p.code),
  );
  await assignPermissions(
    usersMap,
    "administration",
    administrationPermission.map((p) => p.code),
  );

  // Stock
  await prisma.rawMaterial.createMany({
    data: rawMaterials,
    skipDuplicates: true,
  });

  // Barcode
  await addBarcodeToRawMaterial("Mango juice", "5741000142899");

  // Menu
  const menusToCreate = connectOrCreateMenuItemCategory(menu).map((menuItem) =>
    prisma.menuItem.create({ data: menuItem }),
  );

  await prisma.$transaction(menusToCreate);

  // await prisma.menuItem.createMany({
  //   data: connectOrCreateMenuItemCategory(menu),
  // });

  const rawMaterial_MenuItemMap = await Promise.all(
    rawMaterial_MenuItem.map(async (rawMaterialMenuItem) => ({
      menuItemId: await findMenuItem(rawMaterialMenuItem.menuItemId),
      rawMaterialId: await findRawMaterialItem(
        rawMaterialMenuItem.rawMaterialId,
      ),
      quantity: rawMaterialMenuItem.quantity,
    })),
  );

  // RawMaterial_MenuItem
  await prisma.rawMaterial_MenuItem.createMany({
    data: rawMaterial_MenuItemMap,
  });

  // Table
  await prisma.table.createMany({
    data: (() => {
      const tables: Prisma.TableCreateManyInput[] = [];
      for (let i = 1; i <= 28; i++) {
        tables.push({ number: i });
      }
      return tables;
    })(),
  });

  // Reservation
  const futureDays = 50; // Number of future days
  const pastDays = 200; // Number of past days
  const tableAmount = 28; // First table ID

  const reservationData: Prisma.ReservationUncheckedCreateInput[] = []; // Array to hold test data
  today.setDate(new Date().getDate()); // Set today's date

  for (let day = -pastDays; day <= futureDays; day++) {
    // Clone today's date and add/subtract days
    const reservationDate = new Date(today);
    reservationDate.setDate(today.getDate() + day);

    // Generate a random number of reservations (10-30 per day)
    const reservationCount = Math.floor(Math.random() * 21) + 10;

    for (let i = 0; i < reservationCount; i++) {
      // Generate random party size (1-10 people)
      const amount = Math.floor(Math.random() * 10) + 1;

      // Calculate number of tables required (1 table for every 2 people)
      const tableCount = Math.ceil(amount / 2);

      // Generate unique table IDs within the specified range
      const selectedTableNumbers = Array.from({ length: tableCount }, () =>
        randomTable(tableAmount),
      );

      const selectedTableTmp = selectedTableNumbers.map(
        async (selectedTableNumber) => {
          return await findTable(selectedTableNumber);
        },
      );

      const selectedTables = await Promise.all(selectedTableTmp);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Generate random data for the reservation
      const name = `${firstName} ${lastName}`; // Randomized guest name
      const email = faker.internet.email({ firstName, lastName }); // Corresponding email
      const phone = faker.phone.number({ style: "international" }); // Random phone number
      const reservationTime = new Date(
        reservationDate.setHours(Math.floor(Math.random() * 12) + 10), // Random hour (10AM - 10PM)
      );

      // Push generated reservation data into the testData array

      reservationData.push({
        amount,
        name,
        email,
        phone,
        reservationTime,
      });
    }
  }

  // Create the reservations
  const reservations = await prisma.reservation.createManyAndReturn({
    data: reservationData,
  });

  /**
   * This creates orders and associated menu items for the past 50 days.
   */

  const dateForOrder = new Date();
  const order_MenuData: Prisma.Order_MenuUncheckedCreateInput[] = [];
  for (let day = 0; day < 1200; day++) {
    const orderCount = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5

    for (let i = 0; i < orderCount; i++) {
      const table = await findTable(randomTable(tableAmount));

      // Create the order (Let Prisma handle the ID)
      const newOrder = await prisma.order.create({
        data: {
          createdAt: dateForOrder,
          updatedAt: dateForOrder,
          Reservation: {
            connect: {
              id: reservations[Math.floor(Math.random() * reservations.length)]
                .id,
            },
          },
          Table: {
            connect: {
              id: table.id,
            },
          },
        },
      });

      const orderMenuCount = Math.floor(Math.random() * 5) + 1; // Random number of items (1-5)
      const selectedMenuItems = Array.from(
        { length: orderMenuCount },
        () => menuItems[Math.floor(Math.random() * menuItems.length)],
      );

      for (const menuItem of selectedMenuItems) {
        // Get the menuItemId (simulate retrieval from menuItems table)
        const menuItemId = await prisma.menuItem.findFirst({
          where: { name: menuItem.name },
          select: { id: true },
        });

        if (menuItemId) {
          // Create the order_Menu (Let Prisma handle the ID)
          order_MenuData.push({
            orderId: newOrder.id, // Use the 12-byte hex orderId
            menuItemId: menuItemId.id,
            status: ["toPrepare", "deliver", "completed"][
              Math.floor(Math.random() * 3)
            ], // Random status
            quantity: Math.floor(Math.random() * 3) + 1, // Random quantity (1-3)
            note: Math.random() > 0.7 ? "Special note" : "", // Random note with 30% chance
            menuItemPrice: menuItem.price, // Match price from the list
          });
        }
      }
    }
    dateForOrder.setDate(dateForOrder.getDate() - 1);
  }

  // Create the orders and reservations
  await prisma.order_Menu.createMany({ data: order_MenuData });
}

async function assignPermissions(
  usersMap: { [k: string]: string },
  username: string,
  codes: string[],
) {
  const userId = usersMap[username];
  const permissions = await prisma.permission.findMany({
    where: { code: { in: codes } },
  });
  await prisma.userPermissions.createMany({
    data: permissions.map((permission) => ({
      userId,
      assignedBy: usersMap["admin"],
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });
}

/**
 * Generate random table number in a specified range
 * @param {number} amount Amount of tables
 * @returns {number} Random table number
 */
function randomTable(amount: number): number {
  return Math.floor(
    Math.random() * (Number(JSON.stringify(amount)) - 1 + 1) + 1,
  );
}

/**
 * Find table id by number
 * @param {number} number Table number
 * @returns {Promise<string>} Table id
 * @throws {Error} Table id not found
 */
async function findTable(number: number): Promise<Table> {
  try {
    const result = await prisma.table.findFirst({
      where: {
        number,
      },
    });
    if (result) {
      return result;
    }
    throw new Error("Table id not found");
  } catch (error: unknown) {
    throw new Error((error as Error).message);
  }
}

/**
 * Find permission group id by name
 * @async
 * @param {string} name Permission group name
 * @returns {Promise<string>} Permission group id
 */
async function findPermissionGroup(name: string): Promise<string> {
  try {
    const result = await prisma.permissionGroup.findFirst({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });
    if (result) {
      return result.id;
    }
    throw new Error("Permission group not found");
  } catch (error: unknown) {
    return (error as Error).message;
  }
}

/**
 * Help function - Find menu item id by name
 * @async
 * @param {string} name Menu item name
 * @returns {Promise<string>} Menu item id
 */
async function findMenuItem(name: string): Promise<string> {
  try {
    const result = await prisma.menuItem.findFirst({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });
    if (result) {
      return result.id;
    }
    throw new Error(`Menu item not found ${name}`);
  } catch (error: unknown) {
    return (error as Error).message;
  }
}

interface MenuCopy extends Prisma.MenuItemCreateInput {
  category?: string[];
}

function connectOrCreateMenuItemCategory(
  menu: Menu[],
): Prisma.MenuItemCreateInput[] {
  const menuCopy = [...menu] as MenuCopy[];

  for (const menuItem of menuCopy) {
    if (!menuItem.category) continue;

    for (const category of menuItem.category) {
      menuItem.Categories = {
        connectOrCreate: [
          { where: { name: category }, create: { name: category } },
        ],
      };

      delete menuItem.category;
    }
  }

  return menuCopy;
}

/**
 * Help function - Find RawMaterial item id by name
 * @async
 * @param {string} name RawMaterial item name
 * @returns {Promise<string>} RawMaterial item id
 */
async function findRawMaterialItem(name: string): Promise<string> {
  try {
    const result = await prisma.rawMaterial.findFirst({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });
    if (result) {
      return result.id;
    }
    throw new Error(`Row item not found ${name}`);
  } catch (error: unknown) {
    return (error as Error).message;
  }
}

async function addBarcodeToRawMaterial(
  rawMaterialName: string,
  barcodeNumber: string,
) {
  // Find the raw material by its name
  const rawMaterial = await prisma.rawMaterial.findUnique({
    where: { name: rawMaterialName }, // Search by name instead of id
  });

  if (!rawMaterial) {
    throw new Error("Raw material not found");
  }

  const findBarcode = await prisma.barcode.findFirst({
    where: { barcodeNumber },
  });

  if (findBarcode) return;

  // Add the barcode and relate it to the found raw material
  const barcode = await prisma.barcode.create({
    data: {
      barcodeNumber: barcodeNumber, // The barcode number to add
      rawMaterialId: rawMaterial.id,
    },
  });
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
