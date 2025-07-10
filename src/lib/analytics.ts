// Analytics utility functions for Google Analytics 4

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Check if user has consented to analytics
const hasAnalyticsConsent = (): boolean => {
  return localStorage.getItem('cookie-consent') === 'accepted';
};

// Track page views
export const trackPageView = (page_title: string, page_location: string) => {
  if (!hasAnalyticsConsent() || typeof window.gtag === 'undefined') return;
  
  window.gtag('config', 'G-T2VKMD3NV4', {
    page_title,
    page_location,
  });
};

// Track custom events
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!hasAnalyticsConsent() || typeof window.gtag === 'undefined') return;
  
  window.gtag('event', eventName, parameters);
};

// Conversion tracking events
export const trackRegistrationStarted = () => {
  trackEvent('registration_started', {
    event_category: 'engagement',
    event_label: 'user_registration'
  });
};

export const trackRegistrationCompleted = () => {
  trackEvent('registration_completed', {
    event_category: 'conversion',
    event_label: 'user_registration'
  });
};

export const trackLoanApplicationStarted = (loanAmount: number) => {
  trackEvent('loan_application_started', {
    event_category: 'engagement',
    event_label: 'loan_application',
    value: loanAmount
  });
};

export const trackLoanApplicationSubmitted = (loanAmount: number, loanTerm: number) => {
  trackEvent('loan_application_submitted', {
    event_category: 'conversion',
    event_label: 'loan_application',
    value: loanAmount,
    loan_term: loanTerm
  });
};

export const trackBoardApplicationSubmitted = () => {
  trackEvent('board_application_submitted', {
    event_category: 'conversion',
    event_label: 'board_application'
  });
};

export const trackDiscountRequested = (accountType: string) => {
  trackEvent('discount_requested', {
    event_category: 'engagement',
    event_label: 'discount_request',
    account_type: accountType
  });
};

export const trackCalculatorUsage = (calculatorType: string, amount?: number) => {
  trackEvent('calculator_used', {
    event_category: 'engagement',
    event_label: calculatorType,
    value: amount
  });
};

export const trackModalOpen = (modalType: string) => {
  trackEvent('modal_opened', {
    event_category: 'engagement',
    event_label: modalType
  });
};

export const trackLanguageChange = (language: string) => {
  trackEvent('language_changed', {
    event_category: 'engagement',
    event_label: 'language_selector',
    language: language
  });
};

export const trackCTAClick = (ctaName: string, location: string) => {
  trackEvent('cta_clicked', {
    event_category: 'engagement',
    event_label: ctaName,
    location: location
  });
};