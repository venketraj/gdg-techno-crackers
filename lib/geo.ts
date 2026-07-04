export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function weightedCenter(
  currentLatitude: number,
  currentLongitude: number,
  currentWeight: number,
  nextLatitude: number,
  nextLongitude: number
) {
  const total = currentWeight + 1;
  return {
    latitude: (currentLatitude * currentWeight + nextLatitude) / total,
    longitude: (currentLongitude * currentWeight + nextLongitude) / total
  };
}
