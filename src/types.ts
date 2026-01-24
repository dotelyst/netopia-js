export interface PaymentStartBody {
  action: 'start';
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  };
}

export interface VerifyAuthBody {
  action: 'verifyAuth';
  verify: {
    paymentId: string;
    authData?: any;
  };
}

export interface CheckStatusBody {
  action: 'status';
  status: {
    paymentId?: string;
    orderID?: string;
  };
}

export type PaymentRequestBody =
  | PaymentStartBody
  | VerifyAuthBody
  | CheckStatusBody;

export interface NetopiaError {
  code: number | string;
  message: string;
}

export interface NetopiaResponse {
  error?: NetopiaError;
  payment?: {
    status: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface NetopiaIPNBody {
  [key: string]: any; // TODO: Define strict IPN shape based on documentation
}

export interface HttpResponseSet {
  status?: number | string;
}

export interface PaymentActionContext {
  body: unknown;
  set: HttpResponseSet;
}

export interface PaymentIpnContext {
  body: NetopiaIPNBody;
}
