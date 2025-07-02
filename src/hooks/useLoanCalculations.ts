import { useMemo } from "react";
import { LoanCalculation } from "@/components/loan/types";

export const useLoanCalculations = (validLoanAmount: number, validLoanTerm: number): LoanCalculation => {
  return useMemo(() => {
    const interestRate = 14; // 14% annual interest rate
    const monthlyRate = interestRate / 100 / 12;
    
    console.log('Calculation inputs:', {
      validLoanAmount,
      validLoanTerm,
      monthlyRate,
      interestRate
    });
    
    // Calculate monthly payment using loan formula with validation
    if (validLoanAmount <= 0 || validLoanTerm <= 0 || monthlyRate <= 0) {
      console.log('Invalid inputs detected, returning zeros');
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestRate,
        paymentSchedule: []
      };
    }

    const monthlyPayment = (validLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, validLoanTerm)) / 
                          (Math.pow(1 + monthlyRate, validLoanTerm) - 1);
    
    console.log('Raw monthly payment calculation:', monthlyPayment);
    
    // Validate calculation results
    const validMonthlyPayment = isNaN(monthlyPayment) || !isFinite(monthlyPayment) ? 0 : monthlyPayment;
    const totalPayment = validMonthlyPayment * validLoanTerm;
    const totalInterest = totalPayment - validLoanAmount;
    
    console.log('Final calculations:', {
      validMonthlyPayment,
      totalPayment,
      totalInterest
    });

    // Generate payment schedule
    const paymentSchedule = [];
    let remainingBalance = validLoanAmount;
    
    for (let month = 1; month <= validLoanTerm; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = validMonthlyPayment - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - principalPayment);
      
      paymentSchedule.push({
        month,
        payment: validMonthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance
      });
    }

    return {
      monthlyPayment: validMonthlyPayment,
      totalPayment,
      totalInterest,
      interestRate,
      paymentSchedule
    };
  }, [validLoanAmount, validLoanTerm]);
};