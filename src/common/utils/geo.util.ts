/**
 * Geospatial utility functions for calculating distances and bounding boxes.
 * Formula: Haversine distance on WGS84 sphere (Earth Radius: 6,371,000 meters).
 */
export class GeoUtil {
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * Calculates Haversine distance in meters between two lat/lng coordinates.
   */
  public static calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (angle: number) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(this.EARTH_RADIUS_METERS * c);
  }

  /**
   * Generates a bounding box around a coordinate for spatial indexing pre-filtering.
   */
  public static getBoundingBox(
    lat: number,
    lng: number,
    radiusMeters: number,
  ): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    const latDelta =
      (radiusMeters / this.EARTH_RADIUS_METERS) * (180 / Math.PI);
    const lngDelta =
      ((radiusMeters / this.EARTH_RADIUS_METERS) * (180 / Math.PI)) /
      Math.cos((lat * Math.PI) / 180);

    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }
}
