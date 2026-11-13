import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../../common/errors/app-error.js';
import { Result } from '../../../../common/result/result.js';
import { STOPS_REPOSITORY } from '../../domain/repositories/stops.repository.interface.js';
import type { IStopsRepository } from '../../domain/repositories/stops.repository.interface.js';
import { StopMapper, StopResponseDto } from '../dto/stop-response.dto.js';

@Injectable()
export class GetStopDetailUseCase {
  constructor(
    @Inject(STOPS_REPOSITORY)
    private readonly stopsRepository: IStopsRepository,
  ) {}

  async execute(id: string): Promise<Result<StopResponseDto>> {
    if (!id || id.trim().length === 0) {
      return Result.fail(
        AppError.badRequest(
          'INVALID_ID',
          'ID halte/stasiun tidak boleh kosong.',
        ),
      );
    }

    const stop = await this.stopsRepository.findById(id);
    if (!stop) {
      return Result.fail(
        AppError.notFound(
          'STOP_NOT_FOUND',
          `Titik transportasi dengan ID '${id}' tidak ditemukan.`,
        ),
      );
    }

    return Result.ok(StopMapper.toDto(stop));
  }
}
