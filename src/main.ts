import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { APP } from 'src/utils/constants/APP/swagger.description';
import * as fs from 'fs';
import { WHITE_LIST_CLIENTS } from './utils/constants/APP/whilelist.clients';
import { HttpExceptionFilter } from './filters/base-exception.fiter';

global.__basedir = __dirname;
async function bootstrap() {
  const { TITLE, DESCRIPTION, VERSION, TAG, SERVERS, CONTACT } = APP;
  const { LOCALHOST, DEVELOP, PRODUCTION, README, SWAGGER } = SERVERS;
  const app = await NestFactory.create(AppModule, {
    logger: ['warn', 'error', 'debug', 'log', 'verbose'],
    cors: true,
  });
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(DESCRIPTION)
    .setVersion(VERSION)
    .addServer(LOCALHOST.URL, LOCALHOST.DESCRIPTION)
    .addServer(DEVELOP.URL, DEVELOP.DESCRIPTION)
    .addServer(PRODUCTION.URL, PRODUCTION.DESCRIPTION)
    .setContact(CONTACT.NAME, CONTACT.URL, CONTACT.EMAIL)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup('gamestoweb3api', app, document);
  const PORT = configService.get('PORT') || 3000;
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORT);
  console.log(
    `Application is running on: ${await app.getUrl()}/gamestoweb3api`,
  );
  console.table(WHITE_LIST_CLIENTS);
  // app.enableCors({
  //   origin: [...WHITE_LIST_CLIENTS], methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  // });
}
bootstrap();
