import { NextResponse } from "next/server";
import { env, hasPostgresConfig } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: hasPostgresConfig() ? "postgres" : "demo",
    databaseProvider: env.databaseProvider,
    aiProvider: env.aiProvider,
    storageProvider: env.storageProvider,
    openRouterConfigured: Boolean(env.openAICompatibleApiKey),
    postgresConfigured: hasPostgresConfig()
  });
}
