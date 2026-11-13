import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../../common/errors/app-error.js';
import { Result } from '../../../../common/result/result.js';
import { ROUTES_REPOSITORY } from '../../domain/repositories/routes.repository.interface.js';
import type { IRoutesRepository } from '../../domain/repositories/routes.repository.interface.js';
import { RouteDetailDto, RouteMapper } from '../dto/route-response.dto.js';

@Injectable()
export class GetRouteDetailUseCase {
  constructor(
    @Inject(ROUTES_REPOSITORY)
    private readonly routesRepository: IRoutesRepository,
  ) {}

  async execute(id: string): Promise<Result<RouteDetailDto>> {
    if (!id || id.trim().length === 0) {
      return Result.fail(
        AppError.badRequest('INVALID_ID', 'ID rute tidak boleh kosong.'),
      );
    }

    const route = await this.routesRepository.findById(id);
    if (!route) {
      return Result.fail(
        AppError.notFound(
          'ROUTE_NOT_FOUND',
          `Rute transportasi dengan ID '${id}' tidak ditemukan.`,
        ),
      );
    }

    return Result.ok(RouteMapper.toDetailDto(route));
  }
}
