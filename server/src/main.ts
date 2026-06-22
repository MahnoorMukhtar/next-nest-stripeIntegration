import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: 'http://localhost:3000', // your Next.js frontend
    credentials: true,
  });

  // Capture raw body specifically for Stripe webhook verification
  app.use(
    '/api/stripe/webhook',
    json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }),
  );

  app.use(json())


  await app.listen(process.env.PORT ?? 3001);
  console.log('Server running on http://localhost:3001');
}
bootstrap();
