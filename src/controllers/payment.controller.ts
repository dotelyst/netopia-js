import {
  PaymentRequestBody,
  PaymentStartBody,
  VerifyAuthBody,
  CheckStatusBody,
} from '@/types';
import { paymentService } from '@/services/payment.service';

export class PaymentController {
  async handlePaymentAction({
    body,
    set,
  }: {
    body: PaymentRequestBody;
    set: any;
  }) {
    if (!process.env.NETOPIA_API_KEY) {
      set.status = 500;
      return { error: 'NETOPIA_API_KEY missing' };
    }

    if (!body?.action) {
      set.status = 400;
      return { error: "Missing 'action' in request body." };
    }

    try {
      switch (body.action) {
        case 'start': {
          if (!body.payload) {
            set.status = 400;
            return { error: "Missing 'payload' for start." };
          }
          const result = await paymentService.startPayment(
            body as PaymentStartBody,
          );
          return result;
        }

        case 'verifyAuth': {
          const b = body as VerifyAuthBody;
          if (!b.verify?.paymentId) {
            set.status = 400;
            return { error: "Missing 'verify.paymentId'." };
          }
          return await paymentService.verifyAuth(b);
        }

        case 'status': {
          const b = body as CheckStatusBody;
          if (!b.status || (!b.status.paymentId && !b.status.orderID)) {
            set.status = 400;
            return { error: "Provide 'status.paymentId' or 'status.orderID'." };
          }
          return await paymentService.checkStatus(b);
        }

        default:
          set.status = 400;
          // @ts-ignore
          return { error: 'Unsupported action.', action: body.action };
      }
    } catch (error: any) {
      set.status = 500;
      return {
        success: false,
        message: `Error: ${error.message}`,
        error: error.stack,
      };
    }
  }

  async handlePaymentIpn({ body }: { body: any }) {
    console.log('IPN Received:', body);
    return 'OK';
  }
}

export const paymentController = new PaymentController();
