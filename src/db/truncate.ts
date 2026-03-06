import { sql } from "drizzle-orm";

import { db } from "./index";

async function main() {
  await db.execute(
    sql`TRUNCATE TABLE transaksi, warga, verification, session, account, "user", kategori_kas RESTART IDENTITY CASCADE`,
  );
  console.log("All tables truncated.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
