import dotenv from "dotenv";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

dotenv.config();

function toTypeUnion(codes) {
  if (codes.length === 0) {
    return "never";
  }

  return codes.map((code) => JSON.stringify(code)).join(" | ");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const result = await client.query('SELECT "code" FROM "Permission" ORDER BY "code" ASC');
    const codes = [...new Set(result.rows.map((row) => String(row.code)).filter(Boolean))];
    const union = toTypeUnion(codes);
    const outputPath = path.resolve(process.cwd(), "../permissions.d.ts");
    const output = [
      "// Auto-generated from database table `Permission`.",
      "// Do not edit manually. Run `npm run prisma:generate` to regenerate.",
      "",
      `export type Permission = ${union};`,
      "",
    ].join("\n");

    await writeFile(outputPath, output, "utf8");
    console.info(`Generated ${path.relative(process.cwd(), outputPath)} (${codes.length} permissions).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
