import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const redisClient = new Redis(process.env.EXTERNAL_REDIS);

  redisClient.on('error', (err) => {
    console.log('Error while connecting with Redis db!');
    console.log(err);
    process.exit(1);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected with db!');
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('SfTech - Web Store Api')
    .setDescription('SfTech integration with Web Store')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'SfTech API Docs',
  };

  SwaggerModule.setup('api', app, document, customOptions);

  app.enableCors();
  await app.listen(3003);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
