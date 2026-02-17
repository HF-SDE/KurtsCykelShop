import { promises as fs } from "node:fs";
import path from "node:path";

async function main() {
  const cwd = process.cwd()+"/config/environment-variables";
  const entries = await fs.readdir(cwd, { withFileTypes: true });

  const matches = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => name.startsWith(".env") && name.endsWith(".example"));

  if (matches.length === 0) {
    console.log("No .env*.example files found.");
    return;
  }

  for (const file of matches) {
    const src = path.join(cwd, file);
    const dest = path.join(cwd, file.replace(/\.example$/, ".dev"));

    await fs.copyFile(src, dest);
    console.log(`Created ${path.basename(dest)}`);
  }
}

main().catch((err) => {
  console.error("Failed to create .dev env files:", err);
  process.exit(1);
});
