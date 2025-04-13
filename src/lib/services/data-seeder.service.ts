import { Injectable, Inject, Type } from '@nestjs/common';
import { TypeOrmDataSeederService } from './typeorm-data-seeder.service';
import { SeedOptions } from '../interfaces/seed-options.interface';
import { DataSeederModuleOptions } from '../data-seeder.module';
import { MongooseDataSeederService } from './mongoose-data-seeder.service';

@Injectable()
export class DataSeederService {
  constructor(
    @Inject('DATA_SEEDER_OPTIONS')
    private readonly options: DataSeederModuleOptions,
    private readonly typeormSeeder: TypeOrmDataSeederService,
    private readonly mongooseSeeder: MongooseDataSeederService,
  ) {}

  /**
   * Genera y guarda en la base de datos un número específico de entidades
   * @param entityClass La clase de la entidad (TypeORM o Mongoose)
   * @param count Número de entidades a generar
   * @param options Opciones de configuración para la generación
   * @returns Array de entidades generadas y guardadas
   */
  async seed<T>(
    entityClass: Type<T>,
    count: number,
    options?: SeedOptions,
  ): Promise<T[]> {
    // Combinar las opciones del módulo con las opciones proporcionadas
    const mergedOptions: SeedOptions = {
      ...options,
      // Si no se especifica cleanBeforeSeed en las opciones, usar el valor del módulo
      cleanBeforeSeed: options?.cleanBeforeSeed !== undefined 
        ? options.cleanBeforeSeed 
        : this.options.cleanBeforeSeed
    };

    console.log('mergedOptions', this.isTypeOrmEntity(entityClass));
    
    // Determinar si es una entidad TypeORM o Mongoose
    if (this.isTypeOrmEntity(entityClass)) {
      return this.typeormSeeder.seed(entityClass, count, mergedOptions);
    } else if (this.isMongooseModel(entityClass)) {
      return this.mongooseSeeder.seed(entityClass, count, mergedOptions);
    }

    throw new Error(
      `La clase proporcionada no es una entidad válida de TypeORM ni un modelo de Mongoose`,
    );
  }

  /**
   * Genera y guarda una única entidad
   * @param entityClass La clase de la entidad
   * @param options Opciones de configuración
   * @returns La entidad generada y guardada
   */
  async seedOne<T>(entityClass: Type<T>, options?: SeedOptions): Promise<T> {
    const [entity] = await this.seed(entityClass, 1, options);
    return entity;
  }

  /**
   * Genera entidades sin guardarlas en la base de datos
   * @param entityClass La clase de la entidad
   * @param count Número de entidades a generar
   * @param options Opciones de configuración
   * @returns Array de entidades generadas
   */
  generate<T>(entityClass: Type<T>, count: number, options?: SeedOptions): T[] {
    // Combinar las opciones del módulo con las opciones proporcionadas
    const mergedOptions: SeedOptions = {
      ...options,
      // Si no se especifica cleanBeforeSeed en las opciones, usar el valor del módulo
      cleanBeforeSeed: options?.cleanBeforeSeed !== undefined 
        ? options.cleanBeforeSeed 
        : this.options.cleanBeforeSeed
    };
    
    if (this.isTypeOrmEntity(entityClass)) {
      return this.typeormSeeder.generate(entityClass, count, mergedOptions);
    } else if (this.isMongooseModel(entityClass)) {
      return this.mongooseSeeder.generate(entityClass, count, mergedOptions);
    }

    throw new Error(
      `La clase proporcionada no es una entidad válida de TypeORM ni un modelo de Mongoose`,
    );
  }

  /**
   * Genera una única entidad sin guardarla
   * @param entityClass La clase de la entidad
   * @param options Opciones de configuración
   * @returns La entidad generada
   */
  generateOne<T>(entityClass: Type<T>, options?: SeedOptions): T {
    const [entity] = this.generate(entityClass, 1, options);
    return entity;
  }

  /**
   * Elimina todas las entidades del tipo especificado
   * @param entityClass La clase de la entidad
   */
  async clean<T>(entityClass: Type<T>): Promise<void> {
    if (this.isTypeOrmEntity(entityClass)) {
      return this.typeormSeeder.clean(entityClass);
    } else if (this.isMongooseModel(entityClass)) {
      return this.mongooseSeeder.clean(entityClass);
    }

    throw new Error(
      `La clase proporcionada no es una entidad válida de TypeORM ni un modelo de Mongoose`,
    );
  }

  /**
   * Verifica si la clase es una entidad de TypeORM
   */
  private isTypeOrmEntity(entityClass: any): boolean {
    return (
      entityClass.prototype?.constructor?.name &&
      typeof entityClass === 'function' &&
      Reflect.hasMetadata('typeorm:entity', entityClass)
    );
  }

  /**
   * Verifica si la clase es un modelo de Mongoose
   */
  private isMongooseModel(entityClass: any): boolean {
    return (
      entityClass.prototype?.constructor?.name &&
      typeof entityClass === 'function' &&
      (Reflect.hasMetadata('mongoose:schema', entityClass) ||
        (entityClass.db && entityClass.collection))
    );
  }
}
