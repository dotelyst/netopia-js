import { Elysia } from 'elysia';
import { PaymentController } from '@/controllers/payment.controller';
import { PaymentService } from '@/services/payment.service';

const paymentService = new PaymentService();
const paymentController = new PaymentController(paymentService);

export const paymentRoutes = (app: Elysia) =>
  app.group('/payment', (app) =>
    app
      .post('/', ({ body, set }) =>
        paymentController.handlePaymentAction({ body: body as any, set }),
      )
      .post('/callback', ({ body }) =>
        paymentController.handlePaymentIpn({ body: body as any }),
      )
      .get('/health', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
      })),
  );
