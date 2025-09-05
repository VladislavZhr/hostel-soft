// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
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
