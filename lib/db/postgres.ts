import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { env } from "@/lib/env";

let pool: Pool | null = null;

export function getPostgresPool() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is missing. Add a local PostgreSQL connection string to .env.local.");
  }

  pool ??= new Pool({
    connectionString: env.databaseUrl,
    max: 8
  });

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return getPostgresPool().query<T>(text, params);
}
