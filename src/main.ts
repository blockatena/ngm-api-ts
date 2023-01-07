import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

global.__basedir = __dirname;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors();
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('GamesToWeb3')
    .setDescription(`This is Api Demonstraion for <strong>GamesToWeb3</strong> , an Nft <em>Marketplace</em> 
    <article>
    What is a marketplace in NFT?
    Non-Fungible Token or NFT marketplace is a marketplace that functions as a public Blockchain platform. However, this platform is gaining traction and driving developers and businesses to construct a marketplace, despite being in its nascent stage.
    </article>
    <h4>We support Multi chain Environment </h4>
    <p>In Production</p>
    <ul>
    <li>Ethereum</li>
    <li>Polygon</li>
    </ul>
    <p>In Development</p>
    <ul>
    <li>Goeril</li>
    <li>Mumbai</li>
    </ul>
    
    `)
    .setVersion('1.0')
    .addTag('NGM APIs')
    .addServer("https://www.api.gamestoweb3.com", "Production")
    .addServer("https://www.testnets-api.gamestoweb3.com", "Development")
    .addServer("http://[::1]:8080", "localhost")
    .setContact("Customer Care", "www.blockatena.com", "hello@blockatena.com").
    build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync("./swagger-spec.json", JSON.stringify(document));
  SwaggerModule.setup('ngmapi', app, document);
  const PORT = configService.get('PORT') || 3000;
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}/ngmapi`);
}
bootstrap();
