import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { GetRouteDetailUseCase } from './application/use-cases/get-route-detail.use-case.js';
import { ListRoutesUseCase } from './application/use-cases/list-routes.use-case.js';
import { ROUTES_REPOSITORY } from './domain/repositories/routes.repository.interface.js';
import { InMemoryRoutesRepository } from './infrastructure/repositories/in-memory-routes.repository.js';
import { PrismaRoutesRepository } from './infrastructure/repositories/prisma-routes.repository.js';
import { RoutesController } from './presentation/routes.controller.js';

@Module({
  controllers: [RoutesController],
  providers: [
    PrismaService,
    InMemoryRoutesRepository,
    PrismaRoutesRepository,
    {
      provide: ROUTES_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        inMemoryRepo: InMemoryRoutesRepository,
      ) => {
        if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
          return new PrismaRoutesRepository(prismaService);
        }
        return inMemoryRepo;
      },
      inject: [PrismaService, InMemoryRoutesRepository],
    },
    ListRoutesUseCase,
    GetRouteDetailUseCase,
  ],
  exports: [ROUTES_REPOSITORY, ListRoutesUseCase, GetRouteDetailUseCase],
})
export class RoutesModule {}
