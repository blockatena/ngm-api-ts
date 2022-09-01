import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // initialize Swagger

  const config = new DocumentBuilder()
    .setTitle('NFT Game Machine API')
    .setDescription('API Demontstration ')
    .setVersion('1.0')
    .addTag('NGM APIs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('ngmapi', app, document);
  const PORT = process.env.PORT || 8080;

  await app.listen(PORT);
}
bootstrap();
