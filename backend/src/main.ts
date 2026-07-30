import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS is not strictly required since the frontend proxies requests through
  // Next.js rewrites (same-origin from the browser's perspective, server-to-server
  // beneath that), but a permissive setting is kept here as a safety net for
  // direct testing against the backend. Configurable via CORS_ORIGIN so a
  // deployed frontend origin can be added without a code change.
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({
    origin: corsOrigins,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
