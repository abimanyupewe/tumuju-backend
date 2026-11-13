import { Injectable } from '@nestjs/common';
import { GeoUtil } from '../../../../common/utils/geo.util.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { StopEntity, StopType } from '../../domain/entities/stop.entity.js';
import {
  IStopsRepository,
  NearbyStopResult,
  SearchStopsParams,
} from '../../domain/repositories/stops.repository.interface.js';

@Injectable()
export class PrismaStopsRepository implements IStopsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    params: SearchStopsParams,
  ): Promise<{ stops: StopEntity[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (params.query && params.query.trim().length > 0) {
      where.OR = [
        { name: { contains: params.query.trim(), mode: 'insensitive' } },
        { code: { contains: params.query.trim(), mode: 'insensitive' } },
      ];
    }

    if (params.type) {
      where.stopType = params.type;
    }

    const [rows, total] = await Promise.all([
      this.prisma.transportStop.findMany({
        where,
        take: params.limit,
        skip: params.offset,
        orderBy: { name: 'asc' },
      }),
      this.prisma.transportStop.count({ where }),
    ]);

    const stops = rows.map((r) =>
      StopEntity.create({
        id: r.id,
        name: r.name,
        code: r.code,
        latitude: r.latitude,
        longitude: r.longitude,
        stopType: r.stopType as StopType,
        source: r.source,
        sourceId: r.sourceId,
        license: r.license,
        verifiedAt: r.verifiedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    );

    return { stops, total };
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    limit = 20,
  ): Promise<NearbyStopResult[]> {
    const bbox = GeoUtil.getBoundingBox(lat, lng, radiusMeters);

    const candidates = await this.prisma.transportStop.findMany({
      where: {
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      },
    });

    const results: NearbyStopResult[] = [];

    for (const r of candidates) {
      const distance = GeoUtil.calculateDistanceMeters(
        lat,
        lng,
        r.latitude,
        r.longitude,
      );
      if (distance <= radiusMeters) {
        results.push({
          stop: StopEntity.create({
            id: r.id,
            name: r.name,
            code: r.code,
            latitude: r.latitude,
            longitude: r.longitude,
            stopType: r.stopType as StopType,
            source: r.source,
            sourceId: r.sourceId,
            license: r.license,
            verifiedAt: r.verifiedAt,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }),
          distanceMeters: distance,
        });
      }
    }

    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return results.slice(0, limit);
  }

  async findById(id: string): Promise<StopEntity | null> {
    const r = await this.prisma.transportStop.findUnique({
      where: { id },
    });
    if (!r) return null;

    return StopEntity.create({
      id: r.id,
      name: r.name,
      code: r.code,
      latitude: r.latitude,
      longitude: r.longitude,
      stopType: r.stopType as StopType,
      source: r.source,
      sourceId: r.sourceId,
      license: r.license,
      verifiedAt: r.verifiedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async save(stop: StopEntity): Promise<void> {
    await this.prisma.transportStop.upsert({
      where: { id: stop.id },
      create: {
        id: stop.id,
        name: stop.name,
        code: stop.code,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopType: stop.stopType,
        source: stop.source,
        sourceId: stop.sourceId,
        license: stop.license,
        verifiedAt: stop.verifiedAt,
      },
      update: {
        name: stop.name,
        code: stop.code,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopType: stop.stopType,
        source: stop.source,
        sourceId: stop.sourceId,
        license: stop.license,
        verifiedAt: stop.verifiedAt,
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.transportStop.count();
  }
}
