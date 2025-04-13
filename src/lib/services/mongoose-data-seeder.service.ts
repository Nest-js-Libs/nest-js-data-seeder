import { Injectable, Inject, Type, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { SeedOptions } from '../interfaces/seed-options.interface';
import { DataSeederModuleOptions } from '../data-seeder.module';

@Injectable()
export class MongooseDataSeederService {
  private readonly logger = new Logger(MongooseDataSeederService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @Inject('DATA_SEEDER_OPTIONS')
    private readonly options: DataSeederModuleOptions,
  ) {}

  /**
   * Genera y guarda en la base de datos un número específico de documentos Mongoose
   */
  async seed<T>(
    modelClass: Type<T>,
    count: number,
    options?: SeedOptions,
  ): Promise<T[]> {
    const model = this.getModel<T>(modelClass);
    const shouldClean =
      options?.cleanBeforeSeed ?? this.options.cleanBeforeSeed;

    if (shouldClean) {
      await this.clean(modelClass);
    }

    const entities = this.generate(modelClass, count, options);
    const savedEntities: T[] = [];

    // Guardar documentos uno por uno para manejar hooks y relaciones correctamente
    for (const entity of entities) {
      if (options?.afterGenerate) {
        await options.afterGenerate(entity);
      }

      const document = new model(entity);
      const savedEntity = await document.save();
      savedEntities.push(savedEntity);

      if (options?.afterSave) {
        await options.afterSave(savedEntity);
      }
    }

    this.logger.log(
      `Generados ${savedEntities.length} documentos de tipo ${modelClass.name}`,
    );
    return savedEntities;
  }

  /**
   * Genera documentos sin guardarlos en la base de datos
   */
  generate<T>(modelClass: Type<T>, count: number, options?: SeedOptions): T[] {
    const model = this.getModel<T>(modelClass);
    const schema = model.schema;
    const entities: T[] = [];

    for (let i = 0; i < count; i++) {
      const entity: any = {};

      // Generar valores para cada campo del esquema
      for (const [path, schemaType] of Object.entries(schema.paths)) {
        // Saltar campos especiales
        if (
          ['_id', '__v', 'createdAt', 'updatedAt', 'deletedAt'].includes(path)
        ) {
          continue;
        }

        // Usar valor personalizado si está definido en las opciones
        if (options?.overrides && path in options.overrides) {
          const override = options.overrides[path];

          if (typeof override === 'function') {
            entity[path] = override();
          } else if (Array.isArray(override)) {
            // Seleccionar un valor aleatorio del array
            const randomIndex = Math.floor(Math.random() * override.length);
            entity[path] = override[randomIndex];
          } else {
            entity[path] = override;
          }

          continue;
        }

        // Generar valor según el tipo de campo
        entity[path] = this.generateValueForSchemaType(schemaType, path);
      }

      // Manejar relaciones si están configuradas
      if (options?.relations) {
        for (const [relationName, relationConfig] of Object.entries(
          options.relations,
        )) {
          // Implementar lógica para relaciones
          // Esta es una implementación básica que se puede expandir
          if (schema.paths[relationName]) {
            // Lógica para diferentes tipos de relaciones
            // (referencias, subdocumentos, arrays de referencias)
            // Esta implementación se puede expandir según necesidades
          }
        }
      }

      entities.push(entity as T);
    }

    return entities;
  }

  /**
   * Elimina todos los documentos del tipo especificado
   */
  async clean<T>(modelClass: Type<T>): Promise<void> {
    const model = this.getModel<T>(modelClass);
    await model.deleteMany({});
    this.logger.log(
      `Eliminados todos los documentos de tipo ${modelClass.name}`,
    );
  }

  /**
   * Obtiene el modelo Mongoose a partir de la clase
   */
  private getModel<T>(modelClass: Type<T>): Model<any> {
    // Intentar obtener el modelo directamente si es un modelo Mongoose
    if (modelClass.prototype.constructor.name === 'model') {
      return modelClass as unknown as Model<any>;
    }

    // Intentar obtener el modelo por nombre
    const modelName = modelClass.name;
    const model = this.connection.models[modelName];

    if (!model) {
      throw new Error(
        `No se pudo encontrar el modelo Mongoose para ${modelName}`,
      );
    }

    return model;
  }

  /**
   * Genera un valor aleatorio según el tipo de esquema
   */
  private generateValueForSchemaType(schemaType: any, path: string): any {
    const instance = schemaType.instance?.toLowerCase();

    // Manejar tipos de datos comunes
    switch (instance) {
      case 'string':
        return this.generateTextValue(path);

      case 'number':
        return faker.number.int({ min: 1, max: 1000 });

      case 'date':
        return faker.date.recent();

      case 'boolean':
        return faker.datatype.boolean();

      case 'objectid':
        return null; // Se manejará en relaciones

      case 'array':
        // Generar array vacío por defecto
        return [];

      case 'map':
      case 'object':
        return { data: faker.lorem.word() };

      case 'buffer':
        return Buffer.from(faker.lorem.word());

      default:
        return null;
    }
  }

  /**
   * Genera un valor de texto basado en el nombre del campo
   */
  private generateTextValue(path: string): string {
    const name = path.toLowerCase();

    // Generar valores específicos según el nombre del campo
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
