export const modals = {
  registration: {
    title: 'Registration',
    accountType: 'Account Type',
    personal: 'Personal',
    company: 'Business',
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    namePlaceholder: 'Enter full name',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '+370...',
    originalPrice: 'Original Price:',
    discount: 'Discount',
    finalPrice: 'Final Price:',
    payButton: 'Pay with Stripe',
    campaignBanner: '50% DISCOUNT PROMOTION!',
    campaignDescription: 'For new customers until 2025-09-01',
    timeLeft: 'Time left:',
    validationError: 'Fill in all required fields',
    paymentError: 'Failed to create payment'
  },
  discount: {
    title: 'Request Discount Code',
    description: 'Fill out the form and we will send you a discount code within 24 hours',
    accountType: 'Account Type',
    personal: 'Personal',
    company: 'Business',
    name: 'Full Name',
    email: 'Email',
    namePlaceholder: 'Enter full name',
    emailPlaceholder: 'name@example.com',
    submitButton: 'Send Request',
    howItWorks: 'How does it work?',
    howItWorksList: [
      'Your request will be sent to the administrator',
      'You will receive a response by email within 24 hours',
      'Upon approval - you will receive a 50% discount code',
      'The code is valid for 30 days'
    ],
    validationError: 'Fill in all fields',
    success: 'Success!',
    successDescription: 'Your discount request has been successfully sent. We will contact you within 24 hours.',
    submitError: 'Failed to send request. Please try again.'
  },
  board: {
    title: 'Become a Board Member',
    description: 'Fill out the form and we will contact you soon to discuss opportunities.',
    warning: '⚠️ ATTENTION: To become a board member, a contribution of at least €100,000 is required.',
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    experience: 'Experience and Motivation',
    namePlaceholder: 'Enter full name',
    emailPlaceholder: 'Enter email',
    phonePlaceholder: 'Enter phone number',
    experiencePlaceholder: 'Describe your experience in finance, management or related fields, as well as your motivation to become a board member...',
    cancel: 'Cancel',
    submit: 'Submit Application',
    submitting: 'Sending...',
    success: 'Application successfully submitted!',
    successDescription: 'We will contact you soon.',
    submitError: 'Failed to submit application. Please try again.'
  },
  loan: {
    title: 'Loan Application',
    description: 'Fill out the form and get a decision within 24 hours',
    summary: {
      title: 'Loan Parameters',
      amount: 'Amount',
      term: 'Term',
      monthlyPayment: 'Monthly Payment',
      totalPayment: 'Total Amount',
      months: 'months'
    },
    personal: {
      title: 'Personal Information',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'your@email.com',
      phonePlaceholder: '+370 600 00000'
    },
    financial: {
      title: 'Financial Information',
      monthlyIncome: 'Monthly Income (LT)',
      employment: 'Workplace',
      incomePlaceholder: '2000',
      employmentPlaceholder: 'Company Ltd'
    },
    purpose: {
      title: 'Loan Purpose',
      label: 'What is the loan for?',
      placeholder: 'Briefly describe what you plan to use the loan for'
    },
    terms: {
      title: 'I agree to the terms:',
      items: [
        '14% annual interest rate without hidden fees',
        'Decision within 24 hours',
        'Data processing according to privacy policy',
        'Contact for additional information'
      ]
    },
    submit: 'Submit Application',
    submitting: 'Submitting application...',
    success: 'Application successfully submitted!',
    successDescription: 'We will contact you within 24 hours.',
    submitError: 'Failed to submit application. Please try again.'
  }
};