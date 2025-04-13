import { Controller, Get, Post } from '@nestjs/common';
import { ExampleService } from './example-usage';

@Controller('data-seeder')
export class DataSeederExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post('seed-typeorm-users')
  async seedTypeOrmUsers() {
    return this.exampleService.seedTypeOrmUsers();
  }

  @Post('seed-mongoose-users')
  async seedMongooseUsers() {
    return this.exampleService.seedMongooseUsers();
  }
  
  @Get('health')
  async checkHealth() {
    return { status: 'ok', message: 'Data Seeder service is running' };
  }
}