import { AppError } from '../../../../common/errors/app-error.js';

export type StopType = 'station' | 'terminal' | 'bus_stop' | 'angkot_stop';

export interface StopProps {
  id: string;
  name: string;
  code?: string | null;
  latitude: number;
  longitude: number;
  stopType: StopType;
  source: string;
  sourceId?: string | null;
  license: string;
  verifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Pure Domain Entity for TransportStop.
 * Zero framework dependencies, strictly validates business rules (lat/lng bounds, valid type).
 */
export class StopEntity {
  private constructor(private readonly props: StopProps) {
    this.validateCoordinates(props.latitude, props.longitude);
  }

  public static create(props: StopProps): StopEntity {
    return new StopEntity({
      ...props,
      license: props.license || 'ODbL',
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  private validateCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw AppError.badRequest(
        'INVALID_LATITUDE',
        `Latitude harus berada di antara rentang -90 dan 90 (diterima: ${lat}).`,
      );
    }
    if (lng < -180 || lng > 180) {
      throw AppError.badRequest(
        'INVALID_LONGITUDE',
        `Longitude harus berada di antara rentang -180 dan 180 (diterima: ${lng}).`,
      );
    }
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get code(): string | null | undefined {
    return this.props.code;
  }

  public get latitude(): number {
    return this.props.latitude;
  }

  public get longitude(): number {
    return this.props.longitude;
  }

  public get stopType(): StopType {
    return this.props.stopType;
  }

  public get source(): string {
    return this.props.source;
  }

  public get sourceId(): string | null | undefined {
    return this.props.sourceId;
  }

  public get license(): string {
    return this.props.license;
  }

  public get verifiedAt(): Date | null | undefined {
    return this.props.verifiedAt;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON(): StopProps {
    return { ...this.props };
  }
}
