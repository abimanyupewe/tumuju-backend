import { StopEntity, StopType } from '../entities/stop.entity.js';

export interface NearbyStopResult {
  stop: StopEntity;
  distanceMeters: number;
}

export interface SearchStopsParams {
  query?: string;
  type?: StopType;
  limit: number;
  offset: number;
}

/**
 * Port (Interface) for Stops Repository.
 * Decoupled from ORM or storage engine.
 */
export interface IStopsRepository {
  search(
    params: SearchStopsParams,
  ): Promise<{ stops: StopEntity[]; total: number }>;
  findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    limit?: number,
  ): Promise<NearbyStopResult[]>;
  findById(id: string): Promise<StopEntity | null>;
  save(stop: StopEntity): Promise<void>;
  count(): Promise<number>;
}

export const STOPS_REPOSITORY = Symbol('STOPS_REPOSITORY');
