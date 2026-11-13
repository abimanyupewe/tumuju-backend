import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common/result/result.js';
import { ROUTES_REPOSITORY } from '../../domain/repositories/routes.repository.interface.js';
import type { IRoutesRepository } from '../../domain/repositories/routes.repository.interface.js';
import { RouteMapper, RouteSummaryDto } from '../dto/route-response.dto.js';

@Injectable()
export class ListRoutesUseCase {
  constructor(
    @Inject(ROUTES_REPOSITORY)
    private readonly routesRepository: IRoutesRepository,
  ) {}

  async execute(mode?: string): Promise<Result<RouteSummaryDto[]>> {
    const entities = await this.routesRepository.findAll(mode);
    const dtoList = entities.map((e) => RouteMapper.toSummaryDto(e));
    return Result.ok(dtoList);
  }
}
