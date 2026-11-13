import { beforeEach, describe, expect, it } from 'vitest';
import { GeoUtil } from '../../common/utils/geo.util.js';
import { GetNearbyStopsUseCase } from './application/use-cases/get-nearby-stops.use-case.js';
import { GetStopDetailUseCase } from './application/use-cases/get-stop-detail.use-case.js';
import { SearchStopsUseCase } from './application/use-cases/search-stops.use-case.js';
import { StopEntity } from './domain/entities/stop.entity.js';
import { InMemoryStopsRepository } from './infrastructure/repositories/in-memory-stops.repository.js';

describe('StopsModule Unit Tests', () => {
  let repository: InMemoryStopsRepository;
  let searchUseCase: SearchStopsUseCase;
  let nearbyUseCase: GetNearbyStopsUseCase;
  let detailUseCase: GetStopDetailUseCase;

  beforeEach(() => {
    repository = new InMemoryStopsRepository();
    searchUseCase = new SearchStopsUseCase(repository);
    nearbyUseCase = new GetNearbyStopsUseCase(repository);
    detailUseCase = new GetStopDetailUseCase(repository);
  });

  describe('StopEntity & Domain Validation', () => {
    it('should create valid StopEntity', () => {
      const stop = StopEntity.create({
        id: 'stop-test-1',
        name: 'Halte Uji Coba',
        latitude: -7.98,
        longitude: 112.63,
        stopType: 'bus_stop',
        source: 'osm',
        license: 'ODbL',
      });

      expect(stop.id).toBe('stop-test-1');
      expect(stop.name).toBe('Halte Uji Coba');
      expect(stop.license).toBe('ODbL');
    });

    it('should reject invalid coordinates out of boundary', () => {
      expect(() => {
        StopEntity.create({
          id: 'invalid-lat',
          name: 'Invalid Lat',
          latitude: 95.0, // > 90
          longitude: 112.63,
          stopType: 'bus_stop',
          source: 'osm',
          license: 'ODbL',
        });
      }).toThrowError(/Latitude harus berada/);

      expect(() => {
        StopEntity.create({
          id: 'invalid-lng',
          name: 'Invalid Lng',
          latitude: -7.98,
          longitude: -185.0, // < -180
          stopType: 'bus_stop',
          source: 'osm',
          license: 'ODbL',
        });
      }).toThrowError(/Longitude harus berada/);
    });
  });

  describe('GeoUtil Haversine Calculation', () => {
    it('should compute approximate distance between Stasiun Malang Kotabaru and Kotalama (~1.9km)', () => {
      // Stasiun Kotabaru: -7.977526, 112.637375
      // Stasiun Kotalama: -7.994467, 112.637042
      const distance = GeoUtil.calculateDistanceMeters(
        -7.977526,
        112.637375,
        -7.994467,
        112.637042,
      );

      // Distance is ~1880m
      expect(distance).toBeGreaterThan(1700);
      expect(distance).toBeLessThan(2100);
    });
  });

  describe('SearchStopsUseCase', () => {
    it('should return paginated stops with ODbL attribution', async () => {
      const result = await searchUseCase.execute({ page: 1, limit: 10 });
      expect(result.isSuccess).toBe(true);

      const val = result.value;
      expect(val.data.length).toBeGreaterThan(0);
      expect(val.meta.page).toBe(1);
      expect(val.meta.limit).toBe(10);
      expect(val.attribution.license).toBe('ODbL');
      expect(val.attribution.url).toContain('openstreetmap.org/copyright');
    });

    it('should filter stops by query name', async () => {
      const result = await searchUseCase.execute({
        query: 'Arjosari',
        page: 1,
        limit: 10,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.data.length).toBe(1);
      expect(result.value.data[0].name).toContain('Arjosari');
      expect(result.value.data[0].stopType).toBe('terminal');
    });

    it('should filter stops by type', async () => {
      const result = await searchUseCase.execute({
        type: 'station',
        page: 1,
        limit: 10,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.data.length).toBe(3); // Kotabaru, Kotalama, Blimbing
      for (const item of result.value.data) {
        expect(item.stopType).toBe('station');
      }
    });
  });

  describe('GetNearbyStopsUseCase', () => {
    it('should return nearby stops sorted by distance in meters', async () => {
      // Near Alun-Alun Malang: -7.982563, 112.630761
      const result = await nearbyUseCase.execute({
        latitude: -7.982563,
        longitude: 112.630761,
        radiusMeters: 3000,
        limit: 5,
      });

      expect(result.isSuccess).toBe(true);
      const stops = result.value;
      expect(stops.length).toBeGreaterThan(0);
      expect(stops[0].name).toBe('Halte Alun-Alun Kota Malang');
      expect(stops[0].distanceMeters).toBe(0);

      // Verify sorted ascending
      for (let i = 1; i < stops.length; i++) {
        expect(stops[i].distanceMeters!).toBeGreaterThanOrEqual(
          stops[i - 1].distanceMeters!,
        );
      }
    });
  });

  describe('GetStopDetailUseCase', () => {
    it('should return stop detail if found', async () => {
      const result = await detailUseCase.execute('stop-ml-stasiun-kotabaru');
      expect(result.isSuccess).toBe(true);
      expect(result.value.name).toBe('Stasiun Malang (Kotabaru)');
      expect(result.value.code).toBe('ML');
    });

    it('should return STOP_NOT_FOUND error if not found', async () => {
      const result = await detailUseCase.execute('stop-non-existent');
      expect(result.isFailure).toBe(true);
      expect(result.error.statusCode).toBe(404);
      expect(result.error.code).toBe('STOP_NOT_FOUND');
    });
  });
});
