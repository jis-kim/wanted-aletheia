import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './database.config';
import Joi from 'joi';

@Module({})
export class DatabaseModule {
  static forRoot(envFilePath: string | string[]): DynamicModule {
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
          }),
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            ...configService.get('database'),
          }),
          inject: [ConfigService],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
