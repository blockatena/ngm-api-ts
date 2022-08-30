import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //

  // initialize Swagger

  const config = new DocumentBuilder()
    .setTitle('REST API')
    .setDescription('REST API DEMONSTRATION')
    .setVersion('1.0')
    .addTag('APIS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('restapi', app, document);

  //
  await app.listen(8080);
}
bootstrap();
