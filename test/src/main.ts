import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: 'OZPKEZELQLEQZKLEMLZMELMQLEMQZ',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: false,
        secure: false,
      },
    }),
  );

  // Enable CORS for HTTP requests
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true, // Allow credentials (cookies)
  });


  await app.listen(3000);
}

bootstrap();