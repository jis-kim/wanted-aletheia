import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import Joi from 'joi';

import databaseConfig from './database.config';

/**
 * DatabaseModule
 * envFile, entities를 받아 TypeOrmModule.forRootAsync를 통해 TypeOrmModule을 동적으로 생성하는 모듈
 */
@Module({})
export class DatabaseModule {
  static forRoot(envFilePath: string | string[], entities: EntityClassOrSchema[]): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
          envFilePath: envFilePath,
          validationSchema: Joi.object({
            MARIADB_HOST: Joi.string().required(),
            MARIADB_PORT: Joi.number().required(),
            MARIADB_DATABASE: Joi.string().required(),
            MARIADB_USER: Joi.string().required(),
            MARIADB_PASSWORD: Joi.string().required(),
            SERVICE_NAME: Joi.string().required(),
            NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
          }),
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            ...configService.get('database'),
            entities: entities,
          }),
          inject: [ConfigService],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
