import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthController } from './health/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    // ── Environment validation ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        FRONTEND_ORIGIN: Joi.string().required(),
      }),
    }),

    // ── Database ───────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // ── Rate limiting ──────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100,
      },
    ]),

    // ── Feature modules ────────────────────────────────────────────────
    UsersModule,
    AuthModule,
    TasksModule,
  ],
})
export class AppModule {}
