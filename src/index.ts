import { Elysia } from 'elysia';
import { paymentRoutes } from '@/routes/payment';

const app = new Elysia()
  .onRequest(({ request }) => {
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
    );
  })
  .onError(({ code, error, set }) => {
    console.error(`[Error] ${code}:`, error);
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Not Found' };
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: errorMessage };
  })
  .group('/api', (app) => app.use(paymentRoutes))
  .listen(3000);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
