export interface PaymentRequest {
  orderId?: string;
  amount: number;
  currency: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  method: 'DEMO' | 'MOBILE_MONEY' | 'CARD';
  provider?: string; // 'M-Pesa' | 'Airtel Money' | 'Orange Money' | 'Visa'
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  provider: string;
  isDemo: boolean;
  message: string;
  timestamp: string;
}

export interface PaymentProviderAdapter {
  id: string;
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}

// Concrete Demo Provider Implementation
class DemoPaymentAdapter implements PaymentProviderAdapter {
  id = 'DEMO_GATEWAY';
  name = 'Paiement Démonstration Sécurisé';

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate real asynchronous gateway confirmation
    await new Promise(resolve => setTimeout(resolve, 1400));

    return {
      success: true,
      transactionId: `TX-DEMO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PAID',
      provider: 'Mode Démonstration Officiel (Test)',
      isDemo: true,
      message: 'Transaction de démonstration approuvée avec succès. Aucun débit réel effectué.',
      timestamp: new Date().toISOString(),
    };
  }
}

// Extensible Payment Service
export class PaymentService {
  private static instance: PaymentService;
  private demoAdapter = new DemoPaymentAdapter();

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async executePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // In demo environment, use demo adapter
    return this.demoAdapter.processPayment(request);
  }
}

export const paymentService = PaymentService.getInstance();
