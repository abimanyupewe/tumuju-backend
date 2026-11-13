import { StopEntity } from '../../domain/entities/stop.entity.js';

export interface StopResponseDto {
  id: string;
  name: string;
  code: string | null;
  latitude: number;
  longitude: number;
  stopType: string;
  source: string;
  license: string;
  verifiedAt: string | null;
  distanceMeters?: number;
}

export interface PaginatedStopsDto {
  data: StopResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  attribution: {
    license: string;
    notice: string;
    url: string;
  };
}

export class StopMapper {
  public static toDto(
    entity: StopEntity,
    distanceMeters?: number,
  ): StopResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code ?? null,
      latitude: entity.latitude,
      longitude: entity.longitude,
      stopType: entity.stopType,
      source: entity.source,
      license: entity.license,
      verifiedAt: entity.verifiedAt ? entity.verifiedAt.toISOString() : null,
      ...(distanceMeters !== undefined ? { distanceMeters } : {}),
    };
  }

  public static toPaginatedDto(
    entities: StopEntity[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedStopsDto {
    return {
      data: entities.map((e) => this.toDto(e)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      attribution: {
        license: 'ODbL',
        notice:
          'Data titik transportasi bersumber dari OpenStreetMap (© OpenStreetMap contributors). Titik dapat berubah atau belum lengkap.',
        url: 'https://www.openstreetmap.org/copyright',
      },
    };
  }
}
