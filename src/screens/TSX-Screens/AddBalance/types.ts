export interface IPaymentApp {
  id: "paypal" | "venmo" | "bank_of_america";
  name: string;
  deepLink: string;
}

