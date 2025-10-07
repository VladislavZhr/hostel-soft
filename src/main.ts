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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as YAML from 'yaml';


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

  const config = new DocumentBuilder()
    .setTitle('Hostel API')
    .setDescription('Документація інвентаризації')
    .setVersion('1.0.0')
    .addBearerAuth() // якщо використовуєш JWT — додасть кнопку Authorize
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // UI: http://localhost:3000/api/docs

// === ЕКСПОРТ ДО ФАЙЛІВ ===
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  writeFileSync('./swagger.yaml', YAML.stringify(document));


  // серіалізація (Exclude/Expose у DTO/Entities)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: [
      'https://9430813741ef.ngrok-free.app',  // бек через ngrok
      'http://192.168.0.219:3000',            // твій локальний фронт на Windows
      'http://192.168.0.207:3000',            // фронт напарника
      'http://localhost:3000',
    ],
    credentials: true,
  });


  // префікс і версіонування API
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI }); // /v1/...

  // CORS для фронта
  app.enableCors({ origin: true, credentials: true });

  // коректне завершення (SIGTERM/SIGINT)
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  //await app.listen(port);
  await app.listen(port, '0.0.0.0');  // <-- важливо
  app.get(Logger).log(`Server listening on http://localhost:${port}`);
}
bootstrap();
