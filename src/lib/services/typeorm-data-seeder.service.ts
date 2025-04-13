import { Injectable, Inject, Type, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget } from 'typeorm';
import { faker } from '@faker-js/faker';
import { SeedOptions } from '../interfaces/seed-options.interface';
import { DataSeederModuleOptions } from '../data-seeder.module';

@Injectable()
export class TypeOrmDataSeederService {
  private readonly logger = new Logger(TypeOrmDataSeederService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject('DATA_SEEDER_OPTIONS')
    private readonly options: DataSeederModuleOptions,
  ) {}

  /**
   * Genera y guarda en la base de datos un número específico de entidades TypeORM
   */
  async seed<T>(
    entityClass: Type<T>,
    count: number,
    options?: SeedOptions,
  ): Promise<T[]> {
    const repository = this.dataSource.getRepository(entityClass);
    const shouldClean =
      options?.cleanBeforeSeed ?? this.options.cleanBeforeSeed;

    if (shouldClean) {
      await this.clean(entityClass);
    }

    const entities = this.generate(entityClass, count, options);
    const savedEntities: T[] = [];

    // Guardar entidades una por una para manejar hooks y relaciones correctamente
    for (const entity of entities) {
      if (options?.afterGenerate) {
        await options.afterGenerate(entity);
      }

      const savedEntity = await repository.save(entity as any);
      savedEntities.push(savedEntity);

      if (options?.afterSave) {
        await options.afterSave(savedEntity);
      }
    }

    this.logger.log(
      `Generadas ${savedEntities.length} entidades de tipo ${entityClass.name}`,
    );
    return savedEntities;
  }

  /**
   * Genera entidades sin guardarlas en la base de datos
   */
  generate<T>(entityClass: Type<T>, count: number, options?: SeedOptions): T[] {
    const entities: T[] = [];
    const metadata = this.dataSource.getMetadata(
      entityClass as EntityTarget<any>,
    );

    for (let i = 0; i < count; i++) {
      const entity = new (entityClass as any)();

      // Generar valores para cada columna
      for (const column of metadata.columns) {
        // Saltar columnas de ID generadas automáticamente y timestamps
        if (
          (column.isPrimary && column.isGenerated) ||
          ['createdAt', 'updatedAt', 'deletedAt'].includes(column.propertyName)
        ) {
          continue;
        }

        // Usar valor personalizado si está definido en las opciones
        if (options?.overrides && column.propertyName in options.overrides) {
          const override = options.overrides[column.propertyName];

          if (typeof override === 'function') {
            entity[column.propertyName] = override();
          } else if (Array.isArray(override)) {
            // Seleccionar un valor aleatorio del array
            const randomIndex = Math.floor(Math.random() * override.length);
            entity[column.propertyName] = override[randomIndex];
          } else {
            entity[column.propertyName] = override;
          }

          continue;
        }

        // Generar valor según el tipo de columna
        entity[column.propertyName] = this.generateValueForColumn(column);
      }

      // Manejar relaciones si están configuradas
      if (options?.relations) {
        for (const [relationName, relationConfig] of Object.entries(
          options.relations,
        )) {
          // Implementar lógica para relaciones
          // Esta es una implementación básica que se puede expandir
          const relation = metadata.relations.find(
            r => r.propertyName === relationName,
          );

          if (relation) {
            // Lógica para diferentes tipos de relaciones
            // (one-to-one, one-to-many, many-to-many)
            // Esta implementación se puede expandir según necesidades
          }
        }
      }

      entities.push(entity);
    }

    return entities;
  }

  /**
   * Elimina todas las entidades del tipo especificado
   */
  async clean<T>(entityClass: Type<T>): Promise<void> {
    const repository = this.dataSource.getRepository(entityClass);
    await repository.clear();
    this.logger.log(
      `Eliminadas todas las entidades de tipo ${entityClass.name}`,
    );
  }

  /**
   * Genera un valor aleatorio según el tipo de columna
   */
  private generateValueForColumn(column: any): any {
    // Verificar si column.type es una cadena o un objeto
    let type;
    if (typeof column.type === 'string') {
      type = column.type.toLowerCase();
    } else if (column.type && typeof column.type === 'object') {
      // Si es un objeto, intentar obtener el nombre
      type = column.type.name ? column.type.name.toLowerCase() : 'string';
    } else {
      // Valor por defecto si no se puede determinar el tipo
      type = 'string';
    }

    // Manejar tipos de datos comunes
    switch (type) {
      case 'varchar':
      case 'text':
      case 'string':
        return this.generateTextValue(column);

      case 'int':
      case 'integer':
      case 'number':
        return faker.number.int({ min: 1, max: 1000 });

      case 'float':
      case 'double':
      case 'decimal':
        return faker.number.float({ min: 1, max: 1000, fractionDigits: 2 });

      case 'boolean':
        return faker.datatype.boolean();

      case 'date':
        return faker.date.past();

      case 'datetime':
      case 'timestamp':
        return faker.date.recent();

      case 'json':
      case 'jsonb':
        return { data: faker.lorem.sentence() };

      case 'uuid':
        return faker.string.uuid();

      case 'enum':
        if (column.enum && column.enum.length > 0) {
          const randomIndex = Math.floor(Math.random() * column.enum.length);
          return column.enum[randomIndex];
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Genera un valor de texto basado en el nombre de la columna
   */
  private generateTextValue(column: any): string {
    const name = column.propertyName.toLowerCase();

    // Generar valores específicos según el nombre de la columna
    if (name.includes('name')) {
      return faker.person.fullName();
    } else if (name.includes('first')) {
      return faker.person.firstName();
    } else if (name.includes('last')) {
      return faker.person.lastName();
    } else if (name.includes('email')) {
      return faker.internet.email();
    } else if (name.includes('phone')) {
      return faker.phone.number();
    } else if (name.includes('address')) {
      return faker.location.streetAddress();
    } else if (name.includes('city')) {
      return faker.location.city();
    } else if (name.includes('country')) {
      return faker.location.country();
    } else if (name.includes('zip') || name.includes('postal')) {
      return faker.location.zipCode();
    } else if (name.includes('company')) {
      return faker.company.name();
    } else if (name.includes('job') || name.includes('title')) {
      return faker.person.jobTitle();
    } else if (name.includes('description')) {
      return faker.lorem.paragraph();
    } else if (
      name.includes('image') ||
      name.includes('avatar') ||
      name.includes('photo')
    ) {
      return faker.image.url();
    } else if (name.includes('url') || name.includes('website')) {
      return faker.internet.url();
    } else if (name.includes('username')) {
      return faker.internet.userName();
    } else if (name.includes('password')) {
      return faker.internet.password();
    } else if (name.includes('color')) {
      return faker.color.rgb();
    } else {
      // Valor genérico para otros casos
      return faker.lorem.sentence();
    }
  }
}
