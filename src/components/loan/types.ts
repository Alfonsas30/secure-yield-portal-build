export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  interestRate: number;
  paymentSchedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanData {
  loanAmount: number;
  loanTerm: number;
  monthlyPayment: number;
  totalPayment: number;
  interestRate: number;
}