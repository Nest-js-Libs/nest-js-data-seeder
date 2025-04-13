import { Module } from '@nestjs/common';
import { ExampleService } from './example-usage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSeederModule } from '../lib/data-seeder.module';
import { DataSeederExampleController } from './data-seeder-example.controller';
import { UserEntity } from './typeorm-entity/users.entity';

@Module({
  imports: [
    // Configuración de TypeORM con SQLite en memoria para pruebas
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [UserEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),

    // Importamos el módulo DataSeeder
    DataSeederModule.forRoot({ 
        cleanBeforeSeed: true, 
    }),
  ],
  controllers: [DataSeederExampleController],
  providers: [ExampleService],
  exports: [],
})
export class DataSeederExampleModule {}
