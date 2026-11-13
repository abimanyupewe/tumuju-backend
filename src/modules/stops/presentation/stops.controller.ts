import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginatedStopsDto,
  StopResponseDto,
} from '../application/dto/stop-response.dto.js';
import { GetNearbyStopsUseCase } from '../application/use-cases/get-nearby-stops.use-case.js';
import { GetStopDetailUseCase } from '../application/use-cases/get-stop-detail.use-case.js';
import { SearchStopsUseCase } from '../application/use-cases/search-stops.use-case.js';
import { NearbyStopsQueryDto } from './dto/nearby-stops.query.dto.js';
import { SearchStopsQueryDto } from './dto/search-stops.query.dto.js';

@ApiTags('Stops')
@Controller('stops')
export class StopsController {
  constructor(
    private readonly searchStopsUseCase: SearchStopsUseCase,
    private readonly getNearbyStopsUseCase: GetNearbyStopsUseCase,
    private readonly getStopDetailUseCase: GetStopDetailUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cari titik transportasi (halte, stasiun, terminal) dengan paginasi dan filter moda',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Kata kunci nama atau kode stop',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['station', 'terminal', 'bus_stop', 'angkot_stop'],
    description: 'Filter jenis titik transportasi',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Nomor halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Batas item per halaman (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar stop berhasil diambil beserta atribusi ODbL.',
  })
  async search(
    @Query() query: SearchStopsQueryDto,
  ): Promise<PaginatedStopsDto> {
    const result = await this.searchStopsUseCase.execute({
      query: query.query,
      type: query.type,
      page: query.page,
      limit: query.limit,
    });

    if (result.isFailure) {
      throw result.error;
    }

    return result.value;
  }

  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cari titik transportasi di sekitar koordinat GPS (Haversine Distance)',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude (-90 s/d 90)' })
  @ApiQuery({
    name: 'lng',
    type: Number,
    description: 'Longitude (-180 s/d 180)',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Radius pencarian dalam meter (default: 2000)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Batas hasil (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar stop terdekat diurutkan berdasarkan jarak (meter).',
  })
  @ApiResponse({ status: 400, description: 'Koordinat tidak valid.' })
  async getNearby(
    @Query() query: NearbyStopsQueryDto,
  ): Promise<StopResponseDto[]> {
    const result = await this.getNearbyStopsUseCase.execute({
      latitude: query.lat,
      longitude: query.lng,
      radiusMeters: query.radius,
      limit: query.limit,
    });

    if (result.isFailure) {
      throw result.error;
    }

    return result.value;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ambil detail lengkap titik transportasi berdasarkan ID unik',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unik titik transportasi (misal: stop-ml-stasiun-kotabaru)',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail titik transportasi berhasil diambil.',
  })
  @ApiResponse({
    status: 404,
    description: 'Titik transportasi tidak ditemukan.',
  })
  async getById(@Param('id') id: string): Promise<StopResponseDto> {
    const result = await this.getStopDetailUseCase.execute(id);

    if (result.isFailure) {
      throw result.error;
    }

    return result.value;
  }
}
