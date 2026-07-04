export const env = {
  databaseProvider: process.env.DATABASE_PROVIDER || "demo",
  databaseUrl: process.env.DATABASE_URL || "",
  storageProvider: process.env.STORAGE_PROVIDER || "local",
  aiProvider: process.env.AI_PROVIDER || "mock",
  openAICompatibleApiKey: process.env.OPENAI_COMPATIBLE_API_KEY || "",
  openAICompatibleBaseUrl: process.env.OPENAI_COMPATIBLE_BASE_URL || "https://openrouter.ai/api/v1",
  openAICompatibleModel: process.env.OPENAI_COMPATIBLE_MODEL || "google/gemini-3.1-flash-lite-image",
  openAICompatibleSiteUrl: process.env.OPENAI_COMPATIBLE_SITE_URL || "http://localhost:3000",
  openAICompatibleAppName: process.env.OPENAI_COMPATIBLE_APP_NAME || "Constituency Intelligence MVP",
  clusterRadiusMeters: Number(process.env.CLUSTER_RADIUS_METERS || 150),
  sensitivePlaceRadiusMeters: Number(process.env.SENSITIVE_PLACE_RADIUS_METERS || 300),
  openMeteoEnabled: process.env.OPEN_METEO_ENABLED !== "false",
  defaultLatitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || 9.9252),
  defaultLongitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || 78.1198),
  defaultZoom: Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || 13)
};

export function hasPostgresConfig() {
  return env.databaseProvider === "postgres" && Boolean(env.databaseUrl);
}
