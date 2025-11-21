import { AppModule } from './app.module';
import { environment } from './shared/config/env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { GlobalExceptionFilter } from './application/exceptions/exceptions-filter';
import { DatabaseService } from './domain/services/database/database.service';

const port = environment.APP_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('SfTech - Web Store Api')
    .setDescription('SfTech integration with Web Store')
    .setVersion('1.1')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'SfTech API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  SwaggerModule.setup('api', app, document, customOptions);

  app.enableCors();

  // Configura shutdown hooks para fechar conexões adequadamente
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);

  await app.listen(port);
  console.info(`Application is running on: http://localhost:${port}`);
  console.info(`Swagger UI is running on: http://localhost:${port}/api`);
  console.info(
    `Swagger JSON is available at: http://localhost:${port}/api-json`,
  );
}

bootstrap();
