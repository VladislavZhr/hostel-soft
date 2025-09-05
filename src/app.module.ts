// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    LoggerModule.forRootAsync({
      useFactory: () => {
        // транспорт: у файл + красивий консольний вивід
        const transport = pino.transport({
          targets: [
            {
              target: 'pino-pretty',
              options: { colorize: true },
              level: 'info',
            },
            {
              target: 'pino/file',
              options: { destination: './logs/app.log', mkdir: true },
              level: 'debug',
            },
          ],
        });
        return {
          pinoHttp: {
            transport,
            level: 'debug',
            // корисні поля у кожному логу HTTP:
            serializers: {
              req(req) {
                return { method: req.method, url: req.url, params: req.params, query: req.query };
              },
              res(res) {
                return { statusCode: res.statusCode };
              },
            },
          },
        };
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST') ?? '127.0.0.1',
        port: Number(cfg.get('DB_PORT') ?? 5432),
        username: cfg.get<string>('DB_USER') ?? 'postgres',
        password: cfg.get<string>('DB_PASS') ?? '',
        database: cfg.get<string>('DB_NAME') ?? 'postgres',
        autoLoadEntities: true,
        synchronize: true, // тільки для dev
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class AppModule {}
