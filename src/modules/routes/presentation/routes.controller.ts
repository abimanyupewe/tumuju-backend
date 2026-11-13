import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  RouteDetailDto,
  RouteSummaryDto,
} from '../application/dto/route-response.dto.js';
import { GetRouteDetailUseCase } from '../application/use-cases/get-route-detail.use-case.js';
import { ListRoutesUseCase } from '../application/use-cases/list-routes.use-case.js';

@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
  constructor(
    private readonly listRoutesUseCase: ListRoutesUseCase,
    private readonly getRouteDetailUseCase: GetRouteDetailUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ambil daftar rute dan trayek transportasi umum tervalidasi',
  })
  @ApiQuery({ name: 'mode', required: false, enum: ['train', 'bus', 'angkot'] })
  @ApiResponse({ status: 200, description: 'Daftar rute berhasil diambil.' })
  async listRoutes(@Query('mode') mode?: string): Promise<RouteSummaryDto[]> {
    const result = await this.listRoutesUseCase.execute(mode);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ambil detail rute beserta urutan titik pemberhentian (stops)',
  })
  @ApiResponse({ status: 200, description: 'Detail rute berhasil diambil.' })
  @ApiResponse({ status: 404, description: 'Rute tidak ditemukan.' })
  async getRouteDetail(@Param('id') id: string): Promise<RouteDetailDto> {
    const result = await this.getRouteDetailUseCase.execute(id);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }
}
