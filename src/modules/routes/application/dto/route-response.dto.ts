import {
  RouteEntity,
  RouteStopItem,
} from '../../domain/entities/route.entity.js';

export interface RouteSummaryDto {
  id: string;
  routeCode: string;
  name: string;
  mode: string;
  operatorName?: string;
  source: string;
  status: string;
  totalStops: number;
}

export interface RouteDetailDto {
  id: string;
  routeCode: string;
  name: string;
  mode: string;
  operatorId: string;
  operatorName?: string;
  source: string;
  status: string;
  totalStops: number;
  stops: RouteStopItem[];
  attribution: {
    license: string;
    notice: string;
    source: string;
  };
}

export class RouteMapper {
  public static toSummaryDto(entity: RouteEntity): RouteSummaryDto {
    return {
      id: entity.id,
      routeCode: entity.routeCode,
      name: entity.name,
      mode: entity.mode,
      operatorName: entity.operatorName,
      source: entity.source,
      status: entity.status,
      totalStops: entity.stops.length,
    };
  }

  public static toDetailDto(entity: RouteEntity): RouteDetailDto {
    return {
      id: entity.id,
      routeCode: entity.routeCode,
      name: entity.name,
      mode: entity.mode,
      operatorId: entity.operatorId,
      operatorName: entity.operatorName,
      source: entity.source,
      status: entity.status,
      totalStops: entity.stops.length,
      stops: entity.stops,
      attribution: {
        license: 'ODbL / Official Transport Notice',
        notice:
          'Trayek dan urutan stop merupakan data koridor tervalidasi Malang Raya. Jadwal operasional realtime belum tersedia.',
        source: entity.source,
      },
    };
  }
}
