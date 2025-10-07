import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  VersioningType,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as YAML from 'yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // 🔇 повністю вимикає всі логи Nest
  });

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
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // експорт у swagger.json/yaml
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  writeFileSync('./swagger.yaml', YAML.stringify(document));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: [
      'https://9430813741ef.ngrok-free.app',
      'http://192.168.0.219:3000',
      'http://192.168.0.207:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  // ❌ нічого не логуй
}
bootstrap();
