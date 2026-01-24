import {
  PaymentStartBody,
  VerifyAuthBody,
  CheckStatusBody,
  NetopiaResponse,
} from '@/types';
import { callNetopia } from '@/utils/netopia';
import { isoUtcZeroMs, genOrderId } from '@/utils/general';

const netopiaNotifyUrl = process.env.NETOPIA_NOTIFY_URL;
const netopiaRedirectUrl = process.env.NETOPIA_REDIRECT_URL;
const netopiaPosSignature = process.env.NETOPIA_POS_SIGNATURE;
const netopiaApiKey = process.env.NETOPIA_API_KEY;

export class PaymentService {
  async handleRequest(body: unknown): Promise<{ status: number; data: any }> {
    try {
      if (!netopiaApiKey) {
        return { status: 500, data: { error: 'NETOPIA_API_KEY missing' } };
      }

      const safeBody = body as { action?: string; payload?: any };

      if (!safeBody?.action) {
        return {
          status: 400,
          data: { error: "Missing 'action' in request body." },
        };
      }

      switch (safeBody.action) {
        case 'start': {
          if (!safeBody.payload) {
            return {
              status: 400,
              data: { error: "Missing 'payload' for start." },
            };
          }
          const result = await this.startPayment(
            safeBody as unknown as PaymentStartBody,
          );
          return { status: 200, data: result };
        }

        case 'verifyAuth': {
          const b = safeBody as unknown as VerifyAuthBody;
          if (!b.verify?.paymentId) {
            return {
              status: 400,
              data: { error: "Missing 'verify.paymentId'." },
            };
          }
          const result = await this.verifyAuth(b);
          return { status: 200, data: result };
        }

        case 'status': {
          const b = safeBody as unknown as CheckStatusBody;
          if (!b.status || (!b.status.paymentId && !b.status.orderID)) {
            return {
              status: 400,
              data: {
                error: "Provide 'status.paymentId' or 'status.orderID'.",
              },
            };
          }
          const result = await this.checkStatus(b);
          return { status: 200, data: result };
        }

        default:
          return {
            status: 400,
            data: {
              error: 'Unsupported action.',
              action: safeBody.action,
            },
          };
      }
    } catch (error: any) {
      return {
        status: 500,
        data: {
          success: false,
          message: `Error: ${error.message}`,
          error: error.stack,
        },
      };
    }
  }

  async startPayment(body: PaymentStartBody) {
    const clientPayload = body?.payload ?? {};

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
        amount: 100, // Hardcoded
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

  async processIpn(body: unknown) {
    console.log('Processing IPN:', body);
    return 'OK';
  }
}
