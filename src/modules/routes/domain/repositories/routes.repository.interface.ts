import { RouteEntity } from '../entities/route.entity.js';

export interface IRoutesRepository {
  findAll(mode?: string): Promise<RouteEntity[]>;
  findById(id: string): Promise<RouteEntity | null>;
  findByCode(code: string): Promise<RouteEntity | null>;
  save(route: RouteEntity): Promise<void>;
}

export const ROUTES_REPOSITORY = Symbol('ROUTES_REPOSITORY');
