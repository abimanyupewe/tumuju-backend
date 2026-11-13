import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { STOPS_REPOSITORY } from '../stops/domain/repositories/stops.repository.interface.js';
import type { IStopsRepository } from '../stops/domain/repositories/stops.repository.interface.js';

@ApiTags('System')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    @Inject(STOPS_REPOSITORY)
    private readonly stopsRepository: IStopsRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Periksa status kesehatan dan kesiapan sistem backend',
  })
  @ApiResponse({ status: 200, description: 'Sistem operasional dan sehat.' })
  async checkHealth() {
    const memory = process.memoryUsage();
    const stopsCount = await this.stopsRepository.count();

    return {
      status: 'ok',
      service: 'tumuju-backend',
      version: '0.1.1',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      },
      transportData: {
        region: 'Malang Raya',
        stopsCount,
        license: 'ODbL',
        source: 'OpenStreetMap Snapshot (Dishub Malang Corridors)',
        lastAudit: '2026-11-12',
      },
    };
  }
}
