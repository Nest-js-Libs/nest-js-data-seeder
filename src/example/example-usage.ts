import { Injectable } from '@nestjs/common';
import { UserEntity } from './typeorm-entity/users.entity';
import { UserDocument } from './mongose-entity-schema/users-entity-schema';
import { DataSeederService } from '../lib/services/data-seeder.service';

@Injectable()
export class ExampleService {
  constructor(private readonly dataSeederService: DataSeederService) {}

  /**
   * Ejemplo de generación de datos para TypeORM
   */
  async seedTypeOrmUsers() {
    // Generar 10 usuarios con datos aleatorios
    const users = await this.dataSeederService.seed(UserEntity, 10);
    console.log(`Generados ${users.length} usuarios con TypeORM`);

    return users;
  }

  /**
   * Ejemplo de generación de datos para Mongoose
   */
  async seedMongooseUsers() {
    // Generar 10 usuarios con datos aleatorios
    const users = await this.dataSeederService.seed(UserDocument, 10);
    console.log(`Generados ${users.length} usuarios con Mongoose`);

    return users;
  }
}
