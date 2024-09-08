import { registerAs } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default registerAs('database', () => ({
  type: 'mariadb',
  host: process.env.MARIADB_HOST,
  port: parseInt(process.env.MARIADB_PORT || '3306', 10),
  username: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : true,
  autoLoadEntities: true,
  namingStrategy: new SnakeNamingStrategy(),
}));
