import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  VersioningType,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // pino logger з nestjs-pino
  app.useLogger(app.get(Logger));

  // глобальна валідація DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // серіалізація (Exclude/Expose у DTO/Entities)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // префікс і версіонування API
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI }); // /v1/...

  // CORS для фронта
  app.enableCors({ origin: true, credentials: true });

  // коректне завершення (SIGTERM/SIGINT)
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  app.get(Logger).log(`Server listening on http://localhost:${port}`);
}
bootstrap();
