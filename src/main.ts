import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
global.__basedir = __dirname;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors();
  // initialize Swagger
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('NFT Game Machine API')
    .setDescription('API Demontstration ')
    .setVersion('1.0')
    .addTag('NGM APIs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('ngmapi', app, document);
  const PORT = configService.get('PORT') || 3000;
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}/ngmapi`);
}
bootstrap();
