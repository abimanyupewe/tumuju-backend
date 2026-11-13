import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Global prefix as specified in SDD Section 4.3 & SRS Section 8
  app.setGlobalPrefix('api/v1');

  // Strict DTO validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global error filter matching SRS Section 8.1
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Global interceptor for request-id and response-time tracking
  app.useGlobalInterceptors(new RequestContextInterceptor());

  // CORS for client communication
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-request-id',
    exposedHeaders: 'x-request-id, x-response-time',
  });

  // OpenAPI / Swagger Documentation conforming to SDD Section 4.3
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TUMUJU REST API')
    .setDescription(
      'Smart Public Transportation Backend API untuk Malang Raya. Didukung data tervalidasi OpenStreetMap (ODbL) dan koridor resmi.',
    )
    .setVersion('0.1.1')
    .addTag(
      'Stops',
      'Pencarian halte, stasiun, terminal, dan koordinat spasial',
    )
    .addTag('Routes', 'Trayek rute transportasi umum dan urutan stop')
    .addTag('System', 'Status kesehatan dan kesiapan sistem backend')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'TUMUJU API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `[TUMUJU Backend] Server running on http://localhost:${port}/api/v1`,
  );
  console.log(
    `[TUMUJU Backend] OpenAPI Swagger Docs at http://localhost:${port}/api/docs`,
  );
}

await bootstrap();
