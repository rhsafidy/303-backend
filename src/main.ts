import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentation de l’API')
    .setVersion('1.0')
    .addBearerAuth() // si tu utilises JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Accessible via http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
