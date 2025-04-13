import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSeederExampleModule } from './example/data-seeder-example.module';

export const swaggerConfig = app => {
  const options = new DocumentBuilder()
    .setTitle('DATA SEEDER')
    .setDescription('The DATA SEEDER API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};


async function bootstrap() {
  const app = await NestFactory.create(DataSeederExampleModule);
  swaggerConfig(app);
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();