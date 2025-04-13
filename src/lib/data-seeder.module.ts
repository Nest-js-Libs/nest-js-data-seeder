import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmDataSeederService } from './services/typeorm-data-seeder.service';
import { DataSeederService } from './services/data-seeder.service';
import { MongooseDataSeederService } from './services/mongoose-data-seeder.service';

export interface DataSeederModuleOptions {
  /**
   * Limpiar datos existentes antes de generar nuevos
   */
  cleanBeforeSeed?: boolean;
  connection: any;
}

@Global()
@Module({})
export class DataSeederModule {
  static forRoot(options?: DataSeederModuleOptions): DynamicModule {
    const defaultOptions: DataSeederModuleOptions = {
      cleanBeforeSeed: false,
      connection: null,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return {
      module: DataSeederModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'DATA_SEEDER_OPTIONS',
          useValue: mergedOptions,
        },
        {
          provide: 'DatabaseConnection',
          useFactory: () => {
            // Return your database connection here
            // This could be from options or another service
            return options.connection;
          },
        },
        DataSeederService,
        TypeOrmDataSeederService,
        MongooseDataSeederService,
      ],
      exports: [DataSeederService],
    };
  }
}
