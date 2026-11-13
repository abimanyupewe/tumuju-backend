import { Injectable } from '@nestjs/common';
import { RouteEntity } from '../../domain/entities/route.entity.js';
import { IRoutesRepository } from '../../domain/repositories/routes.repository.interface.js';
import { MALANG_ROUTES_SNAPSHOT } from '../datasources/malang-routes-dataset.js';

@Injectable()
export class InMemoryRoutesRepository implements IRoutesRepository {
  private readonly routes: Map<string, RouteEntity> = new Map();

  constructor() {
    for (const item of MALANG_ROUTES_SNAPSHOT) {
      const entity = RouteEntity.create(item);
      this.routes.set(entity.id, entity);
    }
  }

  async findAll(mode?: string): Promise<RouteEntity[]> {
    let list = Array.from(this.routes.values());
    if (mode) {
      list = list.filter((r) => r.mode === mode);
    }
    return list;
  }

  async findById(id: string): Promise<RouteEntity | null> {
    return this.routes.get(id) || null;
  }

  async findByCode(code: string): Promise<RouteEntity | null> {
    for (const r of this.routes.values()) {
      if (r.routeCode.toLowerCase() === code.toLowerCase()) {
        return r;
      }
    }
    return null;
  }

  async save(route: RouteEntity): Promise<void> {
    this.routes.set(route.id, route);
  }
}
