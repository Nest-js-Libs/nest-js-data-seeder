# Módulo Data Seeder

### @nest-js/data-seeder

[![npm version](https://img.shields.io/npm/v/@nest-js/data-seeder.svg)](https://www.npmjs.com/package/@nest-js/data-seeder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Este módulo proporciona funcionalidades para generar datos de prueba automáticamente para entidades de TypeORM o Mongoose en la aplicación NestJS.

## Características

- Generación automática de datos para entidades TypeORM y Mongoose
- Configuración flexible para personalizar los campos a generar
- Soporte para relaciones entre entidades
- Opciones para limpiar datos existentes antes de generar nuevos
- Posibilidad de ejecutar seeders durante el arranque de la aplicación

## Instalación

El módulo viene incluido en el template. Para utilizarlo, simplemente importa el módulo en tu aplicación:

```typescript
import { DataSeederModule } from './app/data-seeder';

@Module({
  imports: [
    DataSeederModule.forRoot(),
  ],
})
export class AppModule {}
```

## Uso

### Generar datos para entidades TypeORM

```typescript
import { Injectable } from '@nestjs/common';
import { DataSeederService } from './app/data-seeder';
import { UserEntity } from './users/entities/user.entity';

@Injectable()
export class AppService {
  constructor(private readonly dataSeederService: DataSeederService) {}

  async seedUsers() {
    // Generar 10 usuarios con datos aleatorios
    const users = await this.dataSeederService.seed(UserEntity, 10);
    console.log(`Generados ${users.length} usuarios`);
    return users;
  }
}
```

### Personalizar la generación de datos

```typescript
import { Injectable } from '@nestjs/common';
import { DataSeederService } from './app/data-seeder';
import { ProductEntity } from './products/entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private readonly dataSeederService: DataSeederService) {}

  async seedProducts() {
    // Generar 20 productos con datos personalizados
    const products = await this.dataSeederService.seed(ProductEntity, 20, {
      overrides: {
        price: () => Math.random() * 100 + 10, // Precio entre 10 y 110
        inStock: true, // Valor fijo para todos los productos
        category: ['Electronics', 'Home', 'Clothing'], // Selección aleatoria de estas categorías
      },
      relations: {
        // Configuración para relaciones
      }
    });
    return products;
  }
}
```

## API

### DataSeederService

#### `seed<T>(entityClass: Type<T>, count: number, options?: SeedOptions): Promise<T[]>`

Genera y guarda en la base de datos un número específico de entidades.

- `entityClass`: La clase de la entidad (TypeORM o Mongoose)
- `count`: Número de entidades a generar
- `options`: Opciones de configuración para la generación

#### `seedOne<T>(entityClass: Type<T>, options?: SeedOptions): Promise<T>`

Genera y guarda una única entidad.

#### `generate<T>(entityClass: Type<T>, count: number, options?: SeedOptions): T[]`

Genera entidades sin guardarlas en la base de datos.

#### `clean<T>(entityClass: Type<T>): Promise<void>`

Elimina todas las entidades del tipo especificado de la base de datos.