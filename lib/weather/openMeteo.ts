import { env } from "@/lib/env";
import type { CivicCategory } from "@/types";

interface OpenMeteoResponse {
  hourly?: {
    precipitation?: number[];
  };
}

export async function getRainfallRiskScore(params: {
  latitude: number;
  longitude: number;
  category: CivicCategory;
}): Promise<number> {
  if (!env.openMeteoEnabled) return 0;
  const rainSensitive = ["drain_blockage", "flooding", "water_leakage"].includes(params.category);
  if (!rainSensitive) return 0;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(params.latitude));
  url.searchParams.set("longitude", String(params.longitude));
  url.searchParams.set("hourly", "precipitation");
  url.searchParams.set("forecast_days", "2");

  try {
    const response = await fetch(url.toString(), { next: { revalidate: 60 * 30 } });
    if (!response.ok) return 0;
    const data = (await response.json()) as OpenMeteoResponse;
    const maxRainMm = (data.hourly?.precipitation || []).reduce((max, value) => Math.max(max, Number(value) || 0), 0);
    if (maxRainMm >= 20) return 10;
    if (maxRainMm >= 10) return 7;
    if (maxRainMm >= 5) return 4;
    if (maxRainMm > 0) return 2;
    return 0;
  } catch {
    return 0;
  }
}
