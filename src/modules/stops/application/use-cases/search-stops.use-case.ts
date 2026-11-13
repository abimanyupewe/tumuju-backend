import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common/result/result.js';
import { StopType } from '../../domain/entities/stop.entity.js';
import { STOPS_REPOSITORY } from '../../domain/repositories/stops.repository.interface.js';
import type { IStopsRepository } from '../../domain/repositories/stops.repository.interface.js';
import { PaginatedStopsDto, StopMapper } from '../dto/stop-response.dto.js';

export interface SearchStopsInput {
  query?: string;
  type?: StopType;
  page: number;
  limit: number;
}

@Injectable()
export class SearchStopsUseCase {
  constructor(
    @Inject(STOPS_REPOSITORY)
    private readonly stopsRepository: IStopsRepository,
  ) {}

  async execute(input: SearchStopsInput): Promise<Result<PaginatedStopsDto>> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    const offset = (page - 1) * limit;

    const { stops, total } = await this.stopsRepository.search({
      query: input.query,
      type: input.type,
      limit,
      offset,
    });

    const response = StopMapper.toPaginatedDto(stops, total, page, limit);
    return Result.ok(response);
  }
}
