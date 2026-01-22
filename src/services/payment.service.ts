import {
  PaymentStartBody,
  PaymentRequestBody,
  VerifyAuthBody,
  CheckStatusBody,
  NetopiaResponse,
} from '@/types';
import { callNetopia } from '@/utils/netopia';
import { isoUtcZeroMs, genOrderId } from '@/utils/general';

const netopiaNotifyUrl = process.env.NETOPIA_NOTIFY_URL;
const netopiaRedirectUrl = process.env.NETOPIA_REDIRECT_URL;
const netopiaPosSignature = process.env.NETOPIA_POS_SIGNATURE;

export class PaymentService {
  async startPayment(body: PaymentStartBody) {
    const clientPayload = body?.payload ?? {};

    // Basic validation
    const billing = clientPayload;

    if (!billing?.firstName || !billing?.lastName || !billing?.email) {
      throw new Error(
        'Missing required billing fields (firstName, lastName, email)',
      );
    }

    const gatewayPayload = {
      config: {
        emailTemplate: 'confirm',
        language: 'ro',
        notifyUrl: netopiaNotifyUrl,
        redirectUrl: netopiaRedirectUrl,
      },
      payment: {
        options: { installments: 1, bonus: 0 },
        instrument: {},
      },
      order: {
        posSignature: netopiaPosSignature,
        dateTime: isoUtcZeroMs(),
        description: 'Subscription name',
        orderID: genOrderId(),
        amount: 650, // Hardcoded
        currency: 'RON',
        billing,
      },
    };

    try {
      const paymentStartServiceResponse = (await callNetopia(
        '/payment/card/start',
        'POST',
        gatewayPayload,
      )) as NetopiaResponse;

      if (String(paymentStartServiceResponse.error?.code) !== '100') {
        return {
          success: true,
          data: paymentStartServiceResponse,
        };
      } else {
        throw new Error(
          paymentStartServiceResponse.error?.message || 'Unknown Netopia Error',
        );
      }
    } catch (error: any) {
      throw new Error(error.message || 'Payment service denial');
    }
  }

  async verifyAuth(body: VerifyAuthBody) {
    const verifyPayload = {
      paymentId: body.verify.paymentId,
      ...(body.verify.authData ? { authData: body.verify.authData } : {}),
    };

    const res = await callNetopia(
      '/payment/card/verify-auth',
      'POST',
      verifyPayload,
    );
    return { success: true, data: res };
  }

  async checkStatus(body: CheckStatusBody) {
    const res = await callNetopia('/operation/status', 'POST', body.status);
    return { success: true, data: res };
  }
}

export const paymentService = new PaymentService();
