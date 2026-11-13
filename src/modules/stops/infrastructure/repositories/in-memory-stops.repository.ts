import { Injectable } from '@nestjs/common';
import { GeoUtil } from '../../../../common/utils/geo.util.js';
import { StopEntity } from '../../domain/entities/stop.entity.js';
import {
  IStopsRepository,
  NearbyStopResult,
  SearchStopsParams,
} from '../../domain/repositories/stops.repository.interface.js';
import { MALANG_STOPS_SNAPSHOT } from '../datasources/malang-stops-dataset.js';

@Injectable()
export class InMemoryStopsRepository implements IStopsRepository {
  private readonly stops: Map<string, StopEntity> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    for (const item of MALANG_STOPS_SNAPSHOT) {
      const entity = StopEntity.create(item);
      this.stops.set(entity.id, entity);
    }
  }

  async search(
    params: SearchStopsParams,
  ): Promise<{ stops: StopEntity[]; total: number }> {
    let list = Array.from(this.stops.values());

    if (params.query && params.query.trim().length > 0) {
      const q = params.query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.code && s.code.toLowerCase().includes(q)),
      );
    }

    if (params.type) {
      list = list.filter((s) => s.stopType === params.type);
    }

    const total = list.length;
    const paginated = list.slice(params.offset, params.offset + params.limit);

    return { stops: paginated, total };
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    limit = 20,
  ): Promise<NearbyStopResult[]> {
    const results: NearbyStopResult[] = [];

    for (const stop of this.stops.values()) {
      const distance = GeoUtil.calculateDistanceMeters(
        lat,
        lng,
        stop.latitude,
        stop.longitude,
      );

      if (distance <= radiusMeters) {
        results.push({ stop, distanceMeters: distance });
      }
    }

    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return results.slice(0, limit);
  }

  async findById(id: string): Promise<StopEntity | null> {
    return this.stops.get(id) || null;
  }

  async save(stop: StopEntity): Promise<void> {
    this.stops.set(stop.id, stop);
  }

  async count(): Promise<number> {
    return this.stops.size;
  }
}
