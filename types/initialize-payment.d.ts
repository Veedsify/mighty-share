export interface PaymentData {
  id: string;
  merchantId: string;
  virtualBankCode: string;
  virtualBankAccountNumber: string;
  businessBankAccountNumber: string | null;
  businessBankCode: string;
  transactionId: string;
  status: boolean;
  expiredAt: string; // ISO date string
  settlementType: string | null;
  createdAt: string; // ISO date string
  businessId: string;
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  subBusinessCode: string | null;
  customer: Customer;
}

export interface Customer {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  metadata: string; // JSON string, can be parsed if needed
}
