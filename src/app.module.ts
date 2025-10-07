import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core'; // 👈 додай це
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // 👈 і це

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isDev = cfg.get('NODE_ENV') === 'development';

        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? {
                targets: [
                  {
                    target: 'pino-pretty',
                    level: 'debug',
                    options: {
                      colorize: true,
                      singleLine: true,
                      translateTime: 'HH:MM:ss Z',
                    },
                  },
                  {
                    target: 'pino/file',
                    level: 'debug',
                    options: {
                      destination: './logs/app.log',
                      mkdir: true,
                    },
                  },
                ],
              }
              : {
                targets: [
                  {
                    target: 'pino/file',
                    level: 'info',
                    options: {
                      destination: './logs/app.log',
                      mkdir: true,
                    },
                  },
                ],
              },
            serializers: {
              req(req) {
                return {
                  method: req.method,
                  url: req.url,
                  params: req.params,
                  query: req.query,
                };
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
        synchronize: true, // тільки для розробки
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),

    UsersModule,
    AuthModule,
    StudentsModule,
    InventoryModule,
    AuditModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 👈 глобально активує JWT-перевірку
    },
  ],
})
export class AppModule {}
