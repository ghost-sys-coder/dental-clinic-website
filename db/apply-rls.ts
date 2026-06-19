/**
 * Applies db/rls.sql to the database using the direct connection (DIRECT_URL).
 * Run automatically after every `db:push` via the npm script chain.
 */
import "dotenv/config";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

// .env.local overrides .env (Next.js convention)
config({ path: join(process.cwd(), ".env.local"), override: true });

const url = process.env.DIRECT_URL;
if (!url) {
  console.error("✗  DIRECT_URL is not set — cannot apply RLS");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const rlsPath = join(process.cwd(), "db", "rls.sql");
const rlsSql = readFileSync(rlsPath, "utf8");

async function main() {
  console.log("→  Applying RLS policies…");
  await sql.unsafe(rlsSql);
  console.log("✓  RLS policies applied");
  await sql.end();
}

main().catch((err: Error) => {
  console.error("✗  Failed to apply RLS:", err.message);
  process.exit(1);
});
