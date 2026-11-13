import { beforeEach, describe, expect, it } from 'vitest';
import { GetRouteDetailUseCase } from './application/use-cases/get-route-detail.use-case.js';
import { ListRoutesUseCase } from './application/use-cases/list-routes.use-case.js';
import { RouteEntity } from './domain/entities/route.entity.js';
import { InMemoryRoutesRepository } from './infrastructure/repositories/in-memory-routes.repository.js';

describe('RoutesModule Unit Tests', () => {
  let repository: InMemoryRoutesRepository;
  let listUseCase: ListRoutesUseCase;
  let detailUseCase: GetRouteDetailUseCase;

  beforeEach(() => {
    repository = new InMemoryRoutesRepository();
    listUseCase = new ListRoutesUseCase(repository);
    detailUseCase = new GetRouteDetailUseCase(repository);
  });

  describe('RouteEntity & Domain Properties', () => {
    it('should sort route stops by stopSequence ascending', () => {
      const route = RouteEntity.create({
        id: 'test-route',
        operatorId: 'test-op',
        routeCode: 'TEST-01',
        name: 'Rute Uji Coba',
        mode: 'bus',
        source: 'dishub',
        status: 'active',
        stops: [
          {
            id: 'rs-2',
            stopId: 'stop-2',
            stopName: 'Halte Kedua',
            latitude: -7.95,
            longitude: 112.62,
            stopSequence: 2,
            direction: 'outbound',
          },
          {
            id: 'rs-1',
            stopId: 'stop-1',
            stopName: 'Halte Pertama',
            latitude: -7.94,
            longitude: 112.61,
            stopSequence: 1,
            direction: 'outbound',
          },
        ],
      });

      expect(route.stops[0].stopSequence).toBe(1);
      expect(route.stops[0].stopName).toBe('Halte Pertama');
      expect(route.stops[1].stopSequence).toBe(2);
      expect(route.stops[1].stopName).toBe('Halte Kedua');
    });
  });

  describe('ListRoutesUseCase', () => {
    it('should return all verified Malang Raya routes', async () => {
      const result = await listUseCase.execute();
      expect(result.isSuccess).toBe(true);

      const routes = result.value;
      expect(routes.length).toBeGreaterThanOrEqual(3);

      const codes = routes.map((r) => r.routeCode);
      expect(codes).toContain('KAI-PENATARAN');
      expect(codes).toContain('MAL-BUS-01');
      expect(codes).toContain('ANGKOT-ADL');
    });

    it('should filter routes by mode', async () => {
      const result = await listUseCase.execute('train');
      expect(result.isSuccess).toBe(true);

      const routes = result.value;
      expect(routes.length).toBe(1);
      expect(routes[0].routeCode).toBe('KAI-PENATARAN');
      expect(routes[0].mode).toBe('train');
    });
  });

  describe('GetRouteDetailUseCase', () => {
    it('should return route detail with ordered stops and attribution notice', async () => {
      const result = await detailUseCase.execute('route-kai-penataran');
      expect(result.isSuccess).toBe(true);

      const route = result.value;
      expect(route.name).toContain('Penataran');
      expect(route.stops.length).toBe(3);
      expect(route.stops[0].stopCode).toBe('BMG');
      expect(route.stops[1].stopCode).toBe('ML');
      expect(route.stops[2].stopCode).toBe('MLK');
      expect(route.attribution.notice).toBeDefined();
    });

    it('should return ROUTE_NOT_FOUND when ID does not exist', async () => {
      const result = await detailUseCase.execute('route-non-existent');
      expect(result.isFailure).toBe(true);
      expect(result.error.statusCode).toBe(404);
      expect(result.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});
