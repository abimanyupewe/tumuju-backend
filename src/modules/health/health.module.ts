import { Module } from '@nestjs/common';
import { StopsModule } from '../stops/stops.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [StopsModule],
  controllers: [HealthController],
})
export class HealthModule {}
