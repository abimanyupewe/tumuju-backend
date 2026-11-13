import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { RouteEntity, RouteProps } from '../../domain/entities/route.entity.js';
import { IRoutesRepository } from '../../domain/repositories/routes.repository.interface.js';

@Injectable()
export class PrismaRoutesRepository implements IRoutesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mode?: string): Promise<RouteEntity[]> {
    const where = mode ? { mode } : {};
    const rows = await this.prisma.transportRoute.findMany({
      where,
      include: {
        operator: true,
        routeStops: {
          include: {
            stop: true,
          },
          orderBy: { stopSequence: 'asc' },
        },
      },
    });

    return rows.map((r) =>
      RouteEntity.create({
        id: r.id,
        operatorId: r.operatorId,
        operatorName: r.operator?.name,
        routeCode: r.routeCode,
        name: r.name,
        mode: r.mode as 'train' | 'bus' | 'angkot',
        source: r.source,
        status: r.status as 'active' | 'unverified' | 'planned',
        stops: r.routeStops.map((rs) => ({
          id: rs.id,
          stopId: rs.stopId,
          stopName: rs.stop.name,
          stopCode: rs.stop.code,
          latitude: rs.stop.latitude,
          longitude: rs.stop.longitude,
          stopSequence: rs.stopSequence,
          direction: rs.direction as 'outbound' | 'inbound',
        })),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<RouteEntity | null> {
    const r = await this.prisma.transportRoute.findUnique({
      where: { id },
      include: {
        operator: true,
        routeStops: {
          include: {
            stop: true,
          },
          orderBy: { stopSequence: 'asc' },
        },
      },
    });

    if (!r) return null;

    return RouteEntity.create({
      id: r.id,
      operatorId: r.operatorId,
      operatorName: r.operator?.name,
      routeCode: r.routeCode,
      name: r.name,
      mode: r.mode as 'train' | 'bus' | 'angkot',
      source: r.source,
      status: r.status as 'active' | 'unverified' | 'planned',
      stops: r.routeStops.map((rs) => ({
        id: rs.id,
        stopId: rs.stopId,
        stopName: rs.stop.name,
        stopCode: rs.stop.code,
        latitude: rs.stop.latitude,
        longitude: rs.stop.longitude,
        stopSequence: rs.stopSequence,
        direction: rs.direction as 'outbound' | 'inbound',
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async findByCode(code: string): Promise<RouteEntity | null> {
    const r = await this.prisma.transportRoute.findUnique({
      where: { routeCode: code },
      include: {
        operator: true,
        routeStops: {
          include: {
            stop: true,
          },
          orderBy: { stopSequence: 'asc' },
        },
      },
    });

    if (!r) return null;

    return RouteEntity.create({
      id: r.id,
      operatorId: r.operatorId,
      operatorName: r.operator?.name,
      routeCode: r.routeCode,
      name: r.name,
      mode: r.mode as 'train' | 'bus' | 'angkot',
      source: r.source,
      status: r.status as 'active' | 'unverified' | 'planned',
      stops: r.routeStops.map((rs) => ({
        id: rs.id,
        stopId: rs.stopId,
        stopName: rs.stop.name,
        stopCode: rs.stop.code,
        latitude: rs.stop.latitude,
        longitude: rs.stop.longitude,
        stopSequence: rs.stopSequence,
        direction: rs.direction as 'outbound' | 'inbound',
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async save(route: RouteEntity): Promise<void> {
    const json: RouteProps = route.toJSON();
    await this.prisma.transportRoute.upsert({
      where: { id: json.id },
      create: {
        id: json.id,
        operatorId: json.operatorId,
        routeCode: json.routeCode,
        name: json.name,
        mode: json.mode,
        source: json.source,
        status: json.status,
      },
      update: {
        operatorId: json.operatorId,
        routeCode: json.routeCode,
        name: json.name,
        mode: json.mode,
        source: json.source,
        status: json.status,
      },
    });
  }
}
