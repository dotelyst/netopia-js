import { PaymentActionContext, PaymentIpnContext } from '@/types';
import { PaymentService } from '@/services/payment.service';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async handlePaymentAction({ body, set }: PaymentActionContext) {
    return await this.paymentService.handleRequest(body);
  }

  handlePaymentIpn({ body }: PaymentIpnContext) {
    return this.paymentService.processIpn(body);
  }
}
