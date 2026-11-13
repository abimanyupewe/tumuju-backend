import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { RequestContextInterceptor } from '../src/common/interceptors/request-context.interceptor.js';

describe('TUMUJU REST API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.useGlobalInterceptors(new RequestContextInterceptor());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('returns system health, memory telemetry, and transport data snapshot status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(res.body).toMatchObject({
        status: 'ok',
        service: 'tumuju-backend',
        version: '0.1.1',
        transportData: {
          region: 'Malang Raya',
          license: 'ODbL',
          stopsCount: expect.any(Number),
        },
      });
      expect(res.body.transportData.stopsCount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/stops', () => {
    it('returns 200 with list of stops, pagination meta, and ODbL attribution', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stops?limit=5&page=1')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(5);

      expect(res.body.meta).toEqual({
        total: expect.any(Number),
        page: 1,
        limit: 5,
        totalPages: expect.any(Number),
      });

      expect(res.body.attribution).toMatchObject({
        license: 'ODbL',
        notice: expect.stringContaining('OpenStreetMap'),
        url: 'https://www.openstreetmap.org/copyright',
      });

      expect(res.headers).toHaveProperty('x-request-id');
      expect(res.headers).toHaveProperty('x-response-time');
    });

    it('filters stops by query keyword', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stops?query=Batu')
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Terminal Batu');
    });
  });

  describe('GET /api/v1/stops/nearby', () => {
    it('returns nearby stops with distance in meters', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stops/nearby?lat=-7.982563&lng=112.630761&radius=3000')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('distanceMeters');
      expect(res.body[0].distanceMeters).toBe(0);
    });

    it('returns 400 when coordinates are out of bounds', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stops/nearby?lat=999&lng=112.630761')
        .expect(400);

      expect(res.body).toMatchObject({
        statusCode: 400,
        code: 'BAD_REQUEST',
        requestId: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/stops/:id', () => {
    it('returns 200 with stop details when found', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stops/stop-ml-stasiun-kotabaru')
        .expect(200);

      expect(res.body).toMatchObject({
        id: 'stop-ml-stasiun-kotabaru',
        name: 'Stasiun Malang (Kotabaru)',
        code: 'ML',
        stopType: 'station',
        license: 'ODbL',
      });
    });

    it('returns 404 with standard error structure when not found', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stops/stop-unknown-404')
        .expect(404);

      expect(res.body).toMatchObject({
        statusCode: 404,
        code: 'STOP_NOT_FOUND',
        message: expect.stringContaining('tidak ditemukan'),
        requestId: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/routes', () => {
    it('returns list of verified routes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/routes')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('filters routes by mode', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/routes?mode=train')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].routeCode).toBe('KAI-PENATARAN');
    });
  });

  describe('GET /api/v1/routes/:id', () => {
    it('returns route detail with ordered stops', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/routes/route-kai-penataran')
        .expect(200);

      expect(res.body).toMatchObject({
        id: 'route-kai-penataran',
        routeCode: 'KAI-PENATARAN',
        stops: expect.any(Array),
      });
      expect(res.body.stops.length).toBe(3);
      expect(res.body.stops[0].stopSequence).toBe(1);
    });

    it('returns 404 when route does not exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/routes/route-ghost-404')
        .expect(404);

      expect(res.body).toMatchObject({
        statusCode: 404,
        code: 'ROUTE_NOT_FOUND',
        message: expect.stringContaining('tidak ditemukan'),
      });
    });
  });
});
