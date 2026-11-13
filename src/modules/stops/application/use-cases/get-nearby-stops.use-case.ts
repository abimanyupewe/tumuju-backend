import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../../common/errors/app-error.js';
import { Result } from '../../../../common/result/result.js';
import { STOPS_REPOSITORY } from '../../domain/repositories/stops.repository.interface.js';
import type { IStopsRepository } from '../../domain/repositories/stops.repository.interface.js';
import { StopMapper, StopResponseDto } from '../dto/stop-response.dto.js';

export interface GetNearbyStopsInput {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  limit?: number;
}

@Injectable()
export class GetNearbyStopsUseCase {
  constructor(
    @Inject(STOPS_REPOSITORY)
    private readonly stopsRepository: IStopsRepository,
  ) {}

  async execute(
    input: GetNearbyStopsInput,
  ): Promise<Result<StopResponseDto[]>> {
    if (input.latitude < -90 || input.latitude > 90) {
      return Result.fail(
        AppError.badRequest(
          'INVALID_COORDINATES',
          `Latitude harus berada di antara rentang -90 dan 90 (diterima: ${input.latitude}).`,
        ),
      );
    }
    if (input.longitude < -180 || input.longitude > 180) {
      return Result.fail(
        AppError.badRequest(
          'INVALID_COORDINATES',
          `Longitude harus berada di antara rentang -180 dan 180 (diterima: ${input.longitude}).`,
        ),
      );
    }

    const radius = Math.min(20000, Math.max(100, input.radiusMeters ?? 2000));
    const limit = Math.min(50, Math.max(1, input.limit ?? 20));

    const nearbyResults = await this.stopsRepository.findNearby(
      input.latitude,
      input.longitude,
      radius,
      limit,
    );

    const dtoList = nearbyResults.map((item) =>
      StopMapper.toDto(item.stop, item.distanceMeters),
    );

    return Result.ok(dtoList);
  }
}
