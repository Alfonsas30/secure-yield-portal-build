import { useMemo } from "react";
import { LoanCalculation } from "@/components/loan/types";

export const useLoanCalculations = (validLoanAmount: number, validLoanTerm: number): LoanCalculation => {
  return useMemo(() => {
    const interestRate = 14; // 14% annual interest rate
    const monthlyRate = interestRate / 100 / 12; // Convert to monthly decimal
    
    // Input validation
    if (validLoanAmount <= 0 || validLoanTerm <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestRate,
        paymentSchedule: []
      };
    }

    // Simplified PMT calculation - standard loan formula
    // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const P = validLoanAmount;
    const r = monthlyRate;
    const n = validLoanTerm;
    
    // Calculate (1+r)^n once
    const powerFactor = Math.pow(1 + r, n);
    
    // PMT formula
    const monthlyPayment = P * (r * powerFactor) / (powerFactor - 1);
    
    // Round to 2 decimal places
    const roundedMonthlyPayment = Math.round(monthlyPayment * 100) / 100;
    const totalPayment = Math.round(roundedMonthlyPayment * validLoanTerm * 100) / 100;
    const totalInterest = Math.round((totalPayment - validLoanAmount) * 100) / 100;
    
    // Debug logging
    console.log('Loan Calculation Debug:', {
      principal: P,
      monthlyRate: r,
      termMonths: n,
      powerFactor,
      monthlyPayment: roundedMonthlyPayment,
      totalPayment,
      totalInterest
    });

    // Generate payment schedule
    const paymentSchedule = [];
    let remainingBalance = validLoanAmount;
    
    for (let month = 1; month <= validLoanTerm; month++) {
      const interestPayment = Math.round(remainingBalance * r * 100) / 100;
      const principalPayment = Math.round((roundedMonthlyPayment - interestPayment) * 100) / 100;
      remainingBalance = Math.max(0, Math.round((remainingBalance - principalPayment) * 100) / 100);
      
      paymentSchedule.push({
        month,
        payment: roundedMonthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance
      });
    }

    return {
      monthlyPayment: roundedMonthlyPayment,
      totalPayment,
      totalInterest,
      interestRate,
      paymentSchedule
    };
  }, [validLoanAmount, validLoanTerm]);
};