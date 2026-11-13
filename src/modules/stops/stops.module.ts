import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { GetNearbyStopsUseCase } from './application/use-cases/get-nearby-stops.use-case.js';
import { GetStopDetailUseCase } from './application/use-cases/get-stop-detail.use-case.js';
import { SearchStopsUseCase } from './application/use-cases/search-stops.use-case.js';
import { STOPS_REPOSITORY } from './domain/repositories/stops.repository.interface.js';
import { InMemoryStopsRepository } from './infrastructure/repositories/in-memory-stops.repository.js';
import { PrismaStopsRepository } from './infrastructure/repositories/prisma-stops.repository.js';
import { StopsController } from './presentation/stops.controller.js';

@Module({
  controllers: [StopsController],
  providers: [
    PrismaService,
    InMemoryStopsRepository,
    PrismaStopsRepository,
    {
      provide: STOPS_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        inMemoryRepo: InMemoryStopsRepository,
      ) => {
        // If DATABASE_URL is configured, use Prisma; otherwise use verified InMemory snapshot
        if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
          return new PrismaStopsRepository(prismaService);
        }
        return inMemoryRepo;
      },
      inject: [PrismaService, InMemoryStopsRepository],
    },
    SearchStopsUseCase,
    GetNearbyStopsUseCase,
    GetStopDetailUseCase,
  ],
  exports: [
    STOPS_REPOSITORY,
    SearchStopsUseCase,
    GetNearbyStopsUseCase,
    GetStopDetailUseCase,
  ],
})
export class StopsModule {}
