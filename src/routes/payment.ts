import { Elysia } from 'elysia';
import { paymentController } from '@/controllers/payment.controller';

export const paymentRoutes = (app: Elysia) =>
  app.group('/payment', (app) =>
    app
      .post('/', ({ body, set }) =>
        paymentController.handlePaymentAction({ body: body as any, set }),
      )
      .post('/callback', ({ body }) =>
        paymentController.handlePaymentIpn({ body }),
      )
      .get('/health', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
      })),
  );
