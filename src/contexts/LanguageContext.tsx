import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  lt: {
    nav: {
      home: 'Pradžia',
      services: 'Paslaugos',
      howItWorks: 'Kaip veikia',
      about: 'Apie mus',
      contact: 'Kontaktai',
      login: 'Prisijungti',
      register: 'Registruotis',
      dashboard: 'Mano sąskaita',
      logout: 'Atsijungti'
    },
    calculators: {
      title: 'Pasirinkite skaičiuoklės tipą',
      daily: 'Dienos palūkanos',
      term: 'Terminuotieji indėliai',
      loans: 'Paskolos'
    },
    about: {
      title: 'LTB Bankas - Jūsų patikimas partneris',
      subtitle: 'Esame inovatyvus finansinių sprendimų teikėjas, kuris padeda klientams saugiai ir pelnyngai taupyti pinigus.',
      security: {
        title: 'Jūsų saugumas',
        description: 'Naudojame aukščiausio lygio šifravimo technologijas ir griežtus saugumo protokolus.',
        insurance: 'Indėliai apdrausti iki 100 000 €'
      },
      innovation: {
        title: 'Inovacijos',
        description: 'Pirmieji Lietuvoje įvedėme dienos palūkanų sistemą - jūsų pinigai auga kiekvieną dieną.',
        benefit: 'Dienos palūkanos'
      },
      transparency: {
        title: 'Skaidrumas',
        description: 'Jokių paslėptų mokesčių ar sudėtingų sąlygų. Viskas aišku ir suprantama.',
        guarantee: 'Be paslėptų mokesčių'
      }
    },
    hero: {
      badge: 'Bankas ateičiai',
      title: 'Jūsų pinigai auga kiekvieną dieną',
      description: 'Pirmasis bankas Lietuvoje, kuris moka palūkanas kasdien. Jokių sudėtingų sąlygų, jokių paslėptų mokesčių. Tiesiog atidarykite sąskaitą ir pradėkite taupyti.',
      cta: 'Apskaičiuokite palūkanas',
      features: {
        daily: 'Dienos palūkanos',
        noFees: 'Be mokesčių',
        safe: 'Saugu ir patikima'
      }
    },
    services: {
      badge: 'Mūsų paslaugos',
      title: 'Finansiniai sprendimai kiekvienai situacijai',
      subtitle: 'Siūlome platų finansinių paslaugų spektrą, pritaikytą jūsų poreikiams',
      daily: {
        title: 'Dienos palūkanos',
        description: 'Jūsų pinigai auga kiekvieną dieną. Palūkanos skaičiuojamos ir mokamos kasdien.',
        rate: 'Iki 12% metinių',
        cta: 'Skaičiuoti palūkanas'
      },
      term: {
        title: 'Terminuotieji indėliai',
        description: 'Fiksuotos palūkanos visam terminui. Garantuotas pelningumas.',
        rate: 'Iki 15% metinių',
        cta: 'Apskaičiuoti indėlį'
      },
      loans: {
        title: 'Paskolos',
        description: 'Greitos ir patogios paskolos be sudėtingų procedūrų.',
        rate: 'Nuo 14% metinių',
        cta: 'Apskaičiuoti paskolą'
      }
    },
    howItWorks: {
      badge: 'Kaip veikia',
      title: 'Paprastas procesas',
      subtitle: 'Pradėti taupyti galite vos per kelias minutes',
      steps: {
        register: {
          title: 'Registruokitės',
          description: 'Užpildykite paprastą registracijos formą'
        },
        deposit: {
          title: 'Įnešite lėšas',
          description: 'Perveskite pinigus į savo naują sąskaitą'
        },
        earn: {
          title: 'Uždirbkite',
          description: 'Palūkanos skaičiuojamos ir mokamos kiekvieną dieną'
        }
      }
    },
    daily: {
      title: 'Dienos palūkanų skaičiuoklė',
      subtitle: 'Apskaičiuokite, kiek galite uždirbti su dienos palūkanomis',
      inputs: {
        amount: 'Suma (€)',
        rate: 'Palūkanų norma (%)',
        days: 'Dienų skaičius'
      },
      results: {
        dailyInterest: 'Dienos palūkanos',
        totalEarned: 'Iš viso uždirbta',
        finalAmount: 'Galutinė suma'
      },
      example: 'Pavyzdys: 1000 € su 12% palūkanomis per 30 dienų'
    },
    term: {
      title: 'Terminuotų indėlių skaičiuoklė',
      subtitle: 'Apskaičiuokite savo pelną su terminuotaisiais indėliais',
      inputs: {
        amount: 'Indėlio suma (€)',
        rate: 'Palūkanų norma (%)',
        term: 'Terminas (mėnesiai)'
      },
      results: {
        monthlyInterest: 'Mėnesinės palūkanos',
        totalInterest: 'Bendros palūkanos',
        finalAmount: 'Galutinė suma'
      },
      cta: {
        title: 'Norite sukurti terminuotą indėlį?',
        subtitle: 'Susisiekite su mumis ir gaukite geriausias sąlygas',
        button: 'Sukurti indėlį'
      }
    },
    loans: {
      title: 'Paskolų skaičiuoklė',
      subtitle: 'Apskaičiuokite mėnesinius mokėjimus ir bendrą paskolos kainą',
      inputs: {
        amount: 'Paskolos suma (€)',
        rate: 'Palūkanų norma (%)',
        term: 'Terminas (mėnesiai)'
      },
      results: {
        monthlyPayment: 'Mėnesinis mokėjimas',
        totalPayment: 'Iš viso mokėsite',
        totalInterest: 'Bendros palūkanos'
      },
      schedule: {
        title: 'Mokėjimų grafikas',
        month: 'Mėnuo',
        payment: 'Mokėjimas',
        principal: 'Pagrindinė suma',
        interest: 'Palūkanos',
        balance: 'Likutis'
      },
      application: {
        title: 'Norite gauti šią paskolą?',
        subtitle: 'Pateikite paraišką ir gaukite sprendimą per 24 valandas',
        button: 'Pateikti paraišką'
      }
    },
    contact: {
      badge: 'Susisiekite su mumis',
      title: 'Turite klausimų?',
      subtitle: 'Mūsų ekspertų komanda visada pasiruošusi padėti. Susisiekite su mumis bet kuriuo jums patogiu būdu.',
      form: {
        title: 'Rašyti mums',
        name: 'Vardas',
        phone: 'Telefonas',
        email: 'El. paštas',
        message: 'Žinutė',
        namePlaceholder: 'Jūsų vardas',
        phonePlaceholder: '+370 XXX XXXXX',
        emailPlaceholder: 'jusu.paštas@example.com',
        messagePlaceholder: 'Parašykite savo klausimą arba komentarą...',
        submit: 'Siųsti žinutę',
        submitting: 'Siunčiama...',
        success: 'Žinutė išsiųsta!',
        successDescription: 'Mes susisieksime su jumis per 24 valandas.',
        error: 'Klaida',
        errorDescription: 'Nepavyko išsiųsti žinutės. Pabandykite dar kartą.'
      },
      newsletter: {
        title: 'Prenumeruoti naujienas',
        description: 'Gaukite naujausią informaciją apie palūkanų pokyčius, naujas paslaugas ir finansų patarimus',
        email: 'El. pašto adresas',
        name: 'Vardas (neprivaloma)',
        emailPlaceholder: 'jusu.pastas@example.com',
        namePlaceholder: 'Jūsų vardas',
        consent: 'Sutinku, kad mano duomenys būtų tvarkomi naujienlaiškio siuntimui',
        submit: 'Prenumeruoti',
        submitting: 'Prenumeruojama...',
        success: 'Sėkmingai prenumeruojate!',
        successDescription: 'Ačiū! Netrukus gausite patvirtinimo laišką',
        alreadySubscribed: 'El. paštas jau prenumeruoja',
        alreadySubscribedDescription: 'Šis el. pašto adresas jau prenumeruoja mūsų naujienas',
        subscriptionError: 'Nepavyko prenumeruoti. Pabandykite dar kartą',
        validationError: 'Prašome užpildyti el. pašto lauką ir sutikti su duomenų tvarkymu'
      }
    },
    faq: {
      badge: 'Dažnai užduodami klausimai',
      title: 'DUK',
      subtitle: 'Čia rasite atsakymus į dažniausiai užduodamus klausimus apie LTB banko paslaugas',
      notFound: {
        title: 'Neradote atsakymo į savo klausimą?',
        description: 'Susisiekite su mūsų ekspertų komanda - mielai padėsime',
        button: 'Susisiekti su mumis'
      }
    },
    footer: {
      bank: 'LTB Bankas',
      description: 'Inovatyvus bankas, kuris keičia taupymo kultūrą Lietuvoje.',
      services: 'Paslaugos',
      company: 'Įmonė',
      support: 'Pagalba',
      legal: 'Teisinė informacija',
      about: 'Apie mus',
      careers: 'Karjera',
      blog: 'Tinklaraštis',
      news: 'Naujienos',
      privacy: 'Privatumo politika',
      terms: 'Naudojimosi sąlygos',
      help: 'Pagalba',
      faq: 'DUK',
      contact: 'Kontaktai',
      techSupport: 'Techninė pagalba',
      calculatorIssues: 'Skaičiuoklių problemos:',
      email: 'info@ltbbankas.lt',
      rights: 'Visos teisės saugomos',
      license: 'Licencijuojama LB'
    },
    auth: {
      title: 'Banko sistema',
      login: 'Prisijungimas',
      signup: 'Registracija',
      email: 'El. paštas',
      password: 'Slaptažodis',
      confirmPassword: 'Pakartokite slaptažodį',
      displayName: 'Vardas Pavardė',
      emailPlaceholder: 'vardas@example.com',
      passwordPlaceholder: '••••••••',
      confirmPasswordPlaceholder: 'Pakartokite slaptažodį',
      displayNamePlaceholder: 'Vardas Pavardė',
      loginButton: 'Prisijungti',
      signupButton: 'Registruotis',
      passwordMismatch: 'Slaptažodžiai nesutampa',
      signupNote: 'Registracijos metu automatiškai bus sukurtas unikalus sąskaitos numeris',
      resendConfirmation: 'Nepatvirtintas el. paštas?',
      resendButton: 'Siųsti',
      resendPlaceholder: 'El. paštas',
      minPasswordLength: 'Bent 6 simboliai'
    },
    modals: {
      registration: {
        title: 'Registracija',
        accountType: 'Sąskaitos tipas',
        personal: 'Asmeninė',
        company: 'Įmonės',
        name: 'Vardas Pavardė',
        email: 'El. paštas',
        phone: 'Telefono numeris',
        namePlaceholder: 'Įveskite vardą ir pavardę',
        emailPlaceholder: 'vardas@example.com',
        phonePlaceholder: '+370...',
        originalPrice: 'Pradinė kaina:',
        discount: 'Nuolaida',
        finalPrice: 'Galutinė kaina:',
        payButton: 'Mokėti su Stripe',
        campaignBanner: 'AKCIJA 50% NUOLAIDA!',
        campaignDescription: 'Naujiems klientams iki 2025-09-01',
        timeLeft: 'Liko:',
        validationError: 'Užpildykite visus privalomaus laukus',
        paymentError: 'Nepavyko sukurti mokėjimo'
      },
      discount: {
        title: 'Prašyti nuolaidos kodo',
        description: 'Užpildykite formą ir mes išsiųsime jums nuolaidos kodą per 24 valandas',
        accountType: 'Sąskaitos tipas',
        personal: 'Asmeninė',
        company: 'Įmonės',
        name: 'Vardas Pavardė',
        email: 'El. paštas',
        namePlaceholder: 'Įveskite vardą ir pavardę',
        emailPlaceholder: 'vardas@example.com',
        submitButton: 'Siųsti užklausą',
        howItWorks: 'Kaip tai veikia?',
        howItWorksList: [
          'Jūsų užklausa bus išsiųsta administratoriui',
          'Per 24 val. gausite atsakymą el. paštu',
          'Patvirtinus - gausite 50% nuolaidos kodą',
          'Kodas galioja 30 dienų'
        ],
        validationError: 'Užpildykite visus laukus',
        success: 'Sėkmė!',
        successDescription: 'Jūsų nuolaidų užklausa sėkmingai išsiųsta. Susisieksime su jumis per 24 valandas.',
        submitError: 'Nepavyko išsiųsti užklausos. Bandykite dar kartą.'
      },
      board: {
        title: 'Tapti valdybos nariu',
        description: 'Užpildykite formą ir mes su jumis susisieksime artimiausiu metu aptarti galimybes.',
        warning: '⚠️ DĖMESIO: Norint tapti valdybos nariu, reikalingas įnašas – ne mažesnis kaip 100,000 litų.',
        name: 'Vardas ir pavardė',
        email: 'El. paštas',
        phone: 'Telefono numeris',
        experience: 'Patirtis ir motyvacija',
        namePlaceholder: 'Įveskite vardą ir pavardę',
        emailPlaceholder: 'Įveskite el. paštą',
        phonePlaceholder: 'Įveskite telefono numerį',
        experiencePlaceholder: 'Aprašykite savo patirtį finansų srityje, vadyboje ar susijusiose srityse, taip pat savo motyvaciją tapti valdybos nariu...',
        cancel: 'Atšaukti',
        submit: 'Pateikti paraišką',
        submitting: 'Siunčiama...',
        success: 'Paraiška sėkmingai pateikta!',
        successDescription: 'Mes su jumis susisieksime artimiausiu metu.',
        submitError: 'Nepavyko pateikti paraiškos. Bandykite dar kartą.'
      },
      loan: {
        title: 'Paraiška paskolai',
        description: 'Užpildykite formą ir gaukite sprendimą per 24 valandas',
        summary: {
          title: 'Paskolos parametrai',
          amount: 'Suma',
          term: 'Terminas',
          monthlyPayment: 'Mėnesinis mokėjimas',
          totalPayment: 'Bendra suma',
          months: 'mėn.'
        },
        personal: {
          title: 'Asmens duomenys',
          name: 'Vardas, pavardė',
          email: 'El. pašto adresas',
          phone: 'Telefono numeris',
          namePlaceholder: 'Jūsų vardas ir pavardė',
          emailPlaceholder: 'jusu@elpastas.lt',
          phonePlaceholder: '+370 600 00000'
        },
        financial: {
          title: 'Finansinė informacija',
          monthlyIncome: 'Mėnesinės pajamos (€)',
          employment: 'Darbo vieta',
          incomePlaceholder: '2000',
          employmentPlaceholder: 'UAB Pavyzdys'
        },
        purpose: {
          title: 'Paskolos paskirtis',
          label: 'Kam reikalinga paskola?',
          placeholder: 'Trumpai aprašykite, kam planuojate panaudoti paskolą'
        },
        terms: {
          title: 'Sutinku su sąlygomis:',
          items: [
            '14% metinė palūkanų norma be paslėptų mokesčių',
            'Sprendimas per 24 valandas',
            'Duomenų tvarkymas pagal privatumo politiką',
            'Susisiekimas dėl papildomos informacijos'
          ]
        },
        submit: 'Pateikti paraišką',
        submitting: 'Pateikiama paraiška...',
        success: 'Paraiška sėkmingai pateikta!',
        successDescription: 'Susisieksime su jumis per 24 valandas.',
        submitError: 'Nepavyko pateikti paraiškos. Pabandykite dar kartą.'
      }
    },
    banking: {
      transfer: {
        title: 'Pinigų pervedimas',
        toAccount: 'Gavėjo sąskaitos numeris',
        toName: 'Gavėjo vardas, pavardė',
        amount: 'Suma (LT)',
        description: 'Paskirtis (neprivaloma)',
        toAccountPlaceholder: 'LT############',
        toNamePlaceholder: 'Vardas Pavardė',
        amountPlaceholder: '0.00',
        descriptionPlaceholder: 'Mokėjimo paskirtis...',
        submit: 'Pervesti',
        submitting: 'Vykdoma...',
        cancel: 'Atšaukti',
        success: 'Pervedimas sėkmingas',
        successDescription: 'Pervedėte {amount} LT į sąskaitą {account}',
        insufficientFunds: 'Nepakanka lėšų',
        transferError: 'Nepavyko įvykdyti pervedimo',
        positiveAmountError: 'Suma turi būti teigiama'
      }
    },
    forms: {
      required: '*',
      loading: 'Kraunama...',
      error: 'Klaida',
      success: 'Sėkmė',
      cancel: 'Atšaukti',
      submit: 'Pateikti',
      save: 'Išsaugoti'
    }
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      howItWorks: 'How It Works',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      dashboard: 'My Account',
      logout: 'Logout'
    },
    calculators: {
      title: 'Choose calculator type',
      daily: 'Daily Interest',
      term: 'Term Deposits',
      loans: 'Loans'
    },
    about: {
      title: 'LTB Bank - Your Trusted Partner',
      subtitle: 'We are an innovative financial solutions provider that helps clients save money safely and profitably.',
      security: {
        title: 'Your Security',
        description: 'We use the highest level of encryption technologies and strict security protocols.',
        insurance: 'Deposits insured up to €100,000'
      },
      innovation: {
        title: 'Innovation',
        description: 'First in Lithuania to introduce daily interest system - your money grows every day.',
        benefit: 'Daily Interest'
      },
      transparency: {
        title: 'Transparency',
        description: 'No hidden fees or complicated conditions. Everything is clear and understandable.',
        guarantee: 'No Hidden Fees'
      }
    },
    hero: {
      badge: 'Bank of the Future',
      title: 'Your money grows every day',
      description: 'The first bank in Lithuania that pays interest daily. No complicated conditions, no hidden fees. Just open an account and start saving.',
      cta: 'Calculate Interest',
      features: {
        daily: 'Daily Interest',
        noFees: 'No Fees',
        safe: 'Safe and Reliable'
      }
    },
    services: {
      badge: 'Our Services',
      title: 'Financial solutions for every situation',
      subtitle: 'We offer a wide range of financial services tailored to your needs',
      daily: {
        title: 'Daily Interest',
        description: 'Your money grows every day. Interest is calculated and paid daily.',
        rate: 'Up to 12% annual',
        cta: 'Calculate Interest'
      },
      term: {
        title: 'Term Deposits',
        description: 'Fixed interest for the entire term. Guaranteed profitability.',
        rate: 'Up to 15% annual',
        cta: 'Calculate Deposit'
      },
      loans: {
        title: 'Loans',
        description: 'Fast and convenient loans without complicated procedures.',
        rate: 'From 14% annual',
        cta: 'Calculate Loan'
      }
    },
    howItWorks: {
      badge: 'How It Works',
      title: 'Simple Process',
      subtitle: 'You can start saving in just a few minutes',
      steps: {
        register: {
          title: 'Register',
          description: 'Fill out a simple registration form'
        },
        deposit: {
          title: 'Deposit Funds',
          description: 'Transfer money to your new account'
        },
        earn: {
          title: 'Earn',
          description: 'Interest is calculated and paid every day'
        }
      }
    },
    daily: {
      title: 'Daily Interest Calculator',
      subtitle: 'Calculate how much you can earn with daily interest',
      inputs: {
        amount: 'Amount (€)',
        rate: 'Interest Rate (%)',
        days: 'Number of Days'
      },
      results: {
        dailyInterest: 'Daily Interest',
        totalEarned: 'Total Earned',
        finalAmount: 'Final Amount'
      },
      example: 'Example: €1000 at 12% interest for 30 days'
    },
    term: {
      title: 'Term Deposits Calculator',
      subtitle: 'Calculate your profit with term deposits',
      inputs: {
        amount: 'Deposit Amount (€)',
        rate: 'Interest Rate (%)',
        term: 'Term (months)'
      },
      results: {
        monthlyInterest: 'Monthly Interest',
        totalInterest: 'Total Interest',
        finalAmount: 'Final Amount'
      },
      cta: {
        title: 'Want to create a term deposit?',
        subtitle: 'Contact us and get the best conditions',
        button: 'Create Deposit'
      }
    },
    loans: {
      title: 'Loan Calculator',
      subtitle: 'Calculate monthly payments and total loan cost',
      inputs: {
        amount: 'Loan Amount (€)',
        rate: 'Interest Rate (%)',
        term: 'Term (months)'
      },
      results: {
        monthlyPayment: 'Monthly Payment',
        totalPayment: 'Total Payment',
        totalInterest: 'Total Interest'
      },
      schedule: {
        title: 'Payment Schedule',
        month: 'Month',
        payment: 'Payment',
        principal: 'Principal',
        interest: 'Interest',
        balance: 'Balance'
      },
      application: {
        title: 'Want to get this loan?',
        subtitle: 'Submit an application and get a decision within 24 hours',
        button: 'Submit Application'
      }
    },
    contact: {
      badge: 'Contact Us',
      title: 'Have Questions?',
      subtitle: 'Our expert team is always ready to help. Contact us in any way convenient for you.',
      form: {
        title: 'Write to Us',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        message: 'Message',
        namePlaceholder: 'Your name',
        phonePlaceholder: '+370 XXX XXXXX',
        emailPlaceholder: 'your.email@example.com',
        messagePlaceholder: 'Write your question or comment...',
        submit: 'Send Message',
        submitting: 'Sending...',
        success: 'Message sent!',
        successDescription: 'We will contact you within 24 hours.',
        error: 'Error',
        errorDescription: 'Failed to send message. Please try again.'
      },
      newsletter: {
        title: 'Subscribe to Newsletter',
        description: 'Get the latest information about interest rate changes, new services and financial advice',
        email: 'Email address',
        name: 'Name (optional)',
        emailPlaceholder: 'your.email@example.com',
        namePlaceholder: 'Your name',
        consent: 'I agree that my data will be processed for newsletter delivery',
        submit: 'Subscribe',
        submitting: 'Subscribing...',
        success: 'Successfully subscribed!',
        successDescription: 'Thank you! You will receive a confirmation email shortly',
        alreadySubscribed: 'Email already subscribed',
        alreadySubscribedDescription: 'This email address is already subscribed to our newsletter',
        subscriptionError: 'Failed to subscribe. Please try again',
        validationError: 'Please fill in the email field and agree to data processing'
      }
    },
    faq: {
      badge: 'Frequently Asked Questions',
      title: 'FAQ',
      subtitle: 'Here are answers to the most frequently asked questions about LTB Bank services',
      notFound: {
        title: 'Didn\'t find answer to your question?',
        description: 'Contact our expert team - we\'re happy to help',
        button: 'Contact Us'
      }
    },
    footer: {
      bank: 'LTB Bank',
      description: 'An innovative bank that is changing the savings culture in Lithuania.',
      services: 'Services',
      company: 'Company',
      support: 'Support',
      legal: 'Legal Information',
      about: 'About Us',
      careers: 'Careers',
      blog: 'Blog',
      news: 'News',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      help: 'Help',
      faq: 'FAQ',
      contact: 'Contact',
      techSupport: 'Technical Support',
      calculatorIssues: 'Calculator Issues:',
      email: 'info@ltbbank.com',
      rights: 'All rights reserved',
      license: 'Licensed by LB'
    },
    auth: {
      title: 'Banking System',
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      displayName: 'Full Name',
      emailPlaceholder: 'name@example.com',
      passwordPlaceholder: '••••••••',
      confirmPasswordPlaceholder: 'Confirm password',
      displayNamePlaceholder: 'Full Name',
      loginButton: 'Sign In',
      signupButton: 'Sign Up',
      passwordMismatch: 'Passwords do not match',
      signupNote: 'A unique account number will be automatically created during registration',
      resendConfirmation: 'Unconfirmed email?',
      resendButton: 'Send',
      resendPlaceholder: 'Email',
      minPasswordLength: 'At least 6 characters'
    },
    modals: {
      registration: {
        title: 'Registration',
        accountType: 'Account Type',
        personal: 'Personal',
        company: 'Business',
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        namePlaceholder: 'Enter your full name',
        emailPlaceholder: 'name@example.com',
        phonePlaceholder: '+370...',
        originalPrice: 'Original price:',
        discount: 'Discount',
        finalPrice: 'Final price:',
        payButton: 'Pay with Stripe',
        campaignBanner: 'SPECIAL OFFER 50% DISCOUNT!',
        campaignDescription: 'For new customers until 2025-09-01',
        timeLeft: 'Time left:',
        validationError: 'Please fill in all required fields',
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
        namePlaceholder: 'Enter your full name',
        emailPlaceholder: 'name@example.com',
        submitButton: 'Send Request',
        howItWorks: 'How does it work?',
        howItWorksList: [
          'Your request will be sent to the administrator',
          'You will receive a response via email within 24 hours',
          'Upon approval - you will receive a 50% discount code',
          'The code is valid for 30 days'
        ],
        validationError: 'Please fill in all fields',
        success: 'Success!',
        successDescription: 'Your discount request has been successfully sent. We will contact you within 24 hours.',
        submitError: 'Failed to send request. Please try again.'
      },
      board: {
        title: 'Become a Board Member',
        description: 'Fill out the form and we will contact you soon to discuss opportunities.',
        warning: '⚠️ ATTENTION: To become a board member, a contribution of at least 100,000 litas is required.',
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        experience: 'Experience and Motivation',
        namePlaceholder: 'Enter your full name',
        emailPlaceholder: 'Enter your email',
        phonePlaceholder: 'Enter your phone number',
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
          totalPayment: 'Total Payment',
          months: 'mo.'
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
          monthlyIncome: 'Monthly Income (€)',
          employment: 'Employer',
          incomePlaceholder: '2000',
          employmentPlaceholder: 'Company Ltd'
        },
        purpose: {
          title: 'Loan Purpose',
          label: 'What do you need the loan for?',
          placeholder: 'Briefly describe how you plan to use the loan'
        },
        terms: {
          title: 'I agree to the terms:',
          items: [
            '14% annual interest rate with no hidden fees',
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
    },
    banking: {
      transfer: {
        title: 'Money Transfer',
        toAccount: 'Recipient Account Number',
        toName: 'Recipient Name',
        amount: 'Amount (LT)',
        description: 'Purpose (optional)',
        toAccountPlaceholder: 'LT############',
        toNamePlaceholder: 'Full Name',
        amountPlaceholder: '0.00',
        descriptionPlaceholder: 'Payment purpose...',
        submit: 'Transfer',
        submitting: 'Processing...',
        cancel: 'Cancel',
        success: 'Transfer successful',
        successDescription: 'You transferred {amount} LT to account {account}',
        insufficientFunds: 'Insufficient funds',
        transferError: 'Failed to process transfer',
        positiveAmountError: 'Amount must be positive'
      }
    },
    forms: {
      required: '*',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      submit: 'Submit',
      save: 'Save'
    }
  },
  ru: {
    nav: {
      home: 'Главная',
      services: 'Услуги',
      howItWorks: 'Как это работает',
      about: 'О нас',
      contact: 'Контакты',
      login: 'Войти',
      register: 'Регистрация',
      dashboard: 'Мой счёт',
      logout: 'Выйти'
    },
    calculators: {
      title: 'Выберите тип калькулятора',
      daily: 'Ежедневные проценты',
      term: 'Срочные депозиты',
      loans: 'Кредиты'
    },
    about: {
      title: 'LTB Банк - Ваш надёжный партнёр',
      subtitle: 'Мы - инновационный поставщик финансовых решений, который помогает клиентам безопасно и выгодно сберегать деньги.',
      security: {
        title: 'Ваша безопасность',
        description: 'Мы используем технологии шифрования высшего уровня и строгие протоколы безопасности.',
        insurance: 'Депозиты застрахованы до 100 000 €'
      },
      innovation: {
        title: 'Инновации',
        description: 'Первыми в Литве внедрили систему ежедневных процентов - ваши деньги растут каждый день.',
        benefit: 'Ежедневные проценты'
      },
      transparency: {
        title: 'Прозрачность',
        description: 'Никаких скрытых комиссий или сложных условий. Всё ясно и понятно.',
        guarantee: 'Без скрытых комиссий'
      }
    },
    hero: {
      badge: 'Банк будущего',
      title: 'Ваши деньги растут каждый день',
      description: 'Первый банк в Литве, который платит проценты ежедневно. Никаких сложных условий, никаких скрытых комиссий. Просто откройте счёт и начните копить.',
      cta: 'Рассчитать проценты',
      features: {
        daily: 'Ежедневные проценты',
        noFees: 'Без комиссий',
        safe: 'Безопасно и надёжно'
      }
    },
    services: {
      badge: 'Наши услуги',
      title: 'Финансовые решения для каждой ситуации',
      subtitle: 'Мы предлагаем широкий спектр финансовых услуг, адаптированных под ваши потребности',
      daily: {
        title: 'Ежедневные проценты',
        description: 'Ваши деньги растут каждый день. Проценты рассчитываются и выплачиваются ежедневно.',
        rate: 'До 12% годовых',
        cta: 'Рассчитать проценты'
      },
      term: {
        title: 'Срочные депозиты',
        description: 'Фиксированные проценты на весь срок. Гарантированная доходность.',
        rate: 'До 15% годовых',
        cta: 'Рассчитать депозит'
      },
      loans: {
        title: 'Кредиты',
        description: 'Быстрые и удобные кредиты без сложных процедур.',
        rate: 'От 14% годовых',
        cta: 'Рассчитать кредит'
      }
    },
    howItWorks: {
      badge: 'Как это работает',
      title: 'Простой процесс',
      subtitle: 'Вы можете начать копить всего за несколько минут',
      steps: {
        register: {
          title: 'Зарегистрируйтесь',
          description: 'Заполните простую форму регистрации'
        },
        deposit: {
          title: 'Внесите средства',
          description: 'Переведите деньги на ваш новый счёт'
        },
        earn: {
          title: 'Зарабатывайте',
          description: 'Проценты рассчитываются и выплачиваются каждый день'
        }
      }
    },
    daily: {
      title: 'Калькулятор ежедневных процентов',
      subtitle: 'Рассчитайте, сколько вы можете заработать с ежедневными процентами',
      inputs: {
        amount: 'Сумма (€)',
        rate: 'Процентная ставка (%)',
        days: 'Количество дней'
      },
      results: {
        dailyInterest: 'Ежедневные проценты',
        totalEarned: 'Всего заработано',
        finalAmount: 'Итоговая сумма'
      },
      example: 'Пример: 1000 € под 12% в течение 30 дней'
    },
    term: {
      title: 'Калькулятор срочных депозитов',
      subtitle: 'Рассчитайте вашу прибыль со срочными депозитами',
      inputs: {
        amount: 'Сумма депозита (€)',
        rate: 'Процентная ставка (%)',
        term: 'Срок (месяцы)'
      },
      results: {
        monthlyInterest: 'Ежемесячные проценты',
        totalInterest: 'Общие проценты',
        finalAmount: 'Итоговая сумма'
      },
      cta: {
        title: 'Хотите создать срочный депозит?',
        subtitle: 'Свяжитесь с нами и получите лучшие условия',
        button: 'Создать депозит'
      }
    },
    loans: {
      title: 'Калькулятор кредитов',
      subtitle: 'Рассчитайте ежемесячные платежи и общую стоимость кредита',
      inputs: {
        amount: 'Сумма кредита (€)',
        rate: 'Процентная ставка (%)',
        term: 'Срок (месяцы)'
      },
      results: {
        monthlyPayment: 'Ежемесячный платёж',
        totalPayment: 'Общий платёж',
        totalInterest: 'Общие проценты'
      },
      schedule: {
        title: 'График платежей',
        month: 'Месяц',
        payment: 'Платёж',
        principal: 'Основной долг',
        interest: 'Проценты',
        balance: 'Остаток'
      },
      application: {
        title: 'Хотите получить этот кредит?',
        subtitle: 'Подайте заявку и получите решение в течение 24 часов',
        button: 'Подать заявку'
      }
    },
    contact: {
      badge: 'Свяжитесь с нами',
      title: 'Есть вопросы?',
      subtitle: 'Наша команда экспертов всегда готова помочь. Свяжитесь с нами любым удобным для вас способом.',
      form: {
        title: 'Написать нам',
        name: 'Имя',
        phone: 'Телефон',
        email: 'Email',
        message: 'Сообщение',
        namePlaceholder: 'Ваше имя',
        phonePlaceholder: '+370 XXX XXXXX',
        emailPlaceholder: 'your.email@example.com',
        messagePlaceholder: 'Напишите ваш вопрос или комментарий...',
        submit: 'Отправить сообщение',
        submitting: 'Отправка...',
        success: 'Сообщение отправлено!',
        successDescription: 'Мы свяжемся с вами в течение 24 часов.',
        error: 'Ошибка',
        errorDescription: 'Не удалось отправить сообщение. Попробуйте ещё раз.'
      },
      newsletter: {
        title: 'Подписаться на новости',
        description: 'Получайте последнюю информацию об изменениях процентных ставок, новых услугах и финансовых советах',
        email: 'Email адрес',
        name: 'Имя (необязательно)',
        emailPlaceholder: 'your.email@example.com',
        namePlaceholder: 'Ваше имя',
        consent: 'Я согласен на обработку моих данных для рассылки новостей',
        submit: 'Подписаться',
        submitting: 'Подписка...',
        success: 'Успешно подписались!',
        successDescription: 'Спасибо! Вскоре вы получите письмо с подтверждением',
        alreadySubscribed: 'Email уже подписан',
        alreadySubscribedDescription: 'Этот email адрес уже подписан на нашу рассылку',
        subscriptionError: 'Не удалось подписаться. Попробуйте ещё раз',
        validationError: 'Пожалуйста, заполните поле email и согласитесь на обработку данных'
      }
    },
    faq: {
      badge: 'Часто задаваемые вопросы',
      title: 'FAQ',
      subtitle: 'Здесь вы найдёте ответы на самые часто задаваемые вопросы об услугах LTB Банка',
      notFound: {
        title: 'Не нашли ответ на свой вопрос?',
        description: 'Свяжитесь с нашей командой экспертов - мы будем рады помочь',
        button: 'Связаться с нами'
      }
    },
    footer: {
      bank: 'LTB Банк',
      description: 'Инновационный банк, который меняет культуру сбережений в Литве.',
      services: 'Услуги',
      company: 'Компания',
      support: 'Поддержка',
      legal: 'Правовая информация',
      about: 'О нас',
      careers: 'Карьера',
      blog: 'Блог',
      news: 'Новости',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      help: 'Помощь',
      faq: 'FAQ',
      contact: 'Контакты',
      techSupport: 'Техническая поддержка',
      calculatorIssues: 'Проблемы с калькуляторами:',
      email: 'info@ltbbank.ru',
      rights: 'Все права защищены',
      license: 'Лицензировано LB'
    },
    auth: {
      title: 'Банковская система',
      login: 'Вход',
      signup: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      displayName: 'Полное имя',
      emailPlaceholder: 'name@example.com',
      passwordPlaceholder: '••••••••',
      confirmPasswordPlaceholder: 'Подтвердите пароль',
      displayNamePlaceholder: 'Полное имя',
      loginButton: 'Войти',
      signupButton: 'Зарегистрироваться',
      passwordMismatch: 'Пароли не совпадают',
      signupNote: 'Уникальный номер счёта будет автоматически создан при регистрации',
      resendConfirmation: 'Неподтверждённый email?',
      resendButton: 'Отправить',
      resendPlaceholder: 'Email',
      minPasswordLength: 'Минимум 6 символов'
    },
    modals: {
      registration: {
        title: 'Регистрация',
        accountType: 'Тип счёта',
        personal: 'Личный',
        company: 'Корпоративный',
        name: 'Полное имя',
        email: 'Email',
        phone: 'Номер телефона',
        namePlaceholder: 'Введите полное имя',
        emailPlaceholder: 'name@example.com',
        phonePlaceholder: '+370...',
        originalPrice: 'Первоначальная цена:',
        discount: 'Скидка',
        finalPrice: 'Итоговая цена:',
        payButton: 'Оплатить через Stripe',
        campaignBanner: 'АКЦИЯ СКИДКА 50%!',
        campaignDescription: 'Для новых клиентов до 2025-09-01',
        timeLeft: 'Осталось:',
        validationError: 'Пожалуйста, заполните все обязательные поля',
        paymentError: 'Не удалось создать платёж'
      },
      discount: {
        title: 'Запросить код скидки',
        description: 'Заполните форму и мы отправим вам код скидки в течение 24 часов',
        accountType: 'Тип счёта',
        personal: 'Личный',
        company: 'Корпоративный',
        name: 'Полное имя',
        email: 'Email',
        namePlaceholder: 'Введите полное имя',
        emailPlaceholder: 'name@example.com',
        submitButton: 'Отправить запрос',
        howItWorks: 'Как это работает?',
        howItWorksList: [
          'Ваш запрос будет отправлен администратору',
          'В течение 24 часов вы получите ответ по email',
          'После подтверждения - получите код скидки 50%',
          'Код действителен 30 дней'
        ],
        validationError: 'Пожалуйста, заполните все поля',
        success: 'Успешно!',
        successDescription: 'Ваш запрос на скидку успешно отправлен. Мы свяжемся с вами в течение 24 часов.',
        submitError: 'Не удалось отправить запрос. Попробуйте ещё раз.'
      },
      board: {
        title: 'Стать членом правления',
        description: 'Заполните форму и мы свяжемся с вами в ближайшее время для обсуждения возможностей.',
        warning: '⚠️ ВНИМАНИЕ: Для того чтобы стать членом правления, требуется взнос не менее 100,000 литов.',
        name: 'Полное имя',
        email: 'Email',
        phone: 'Номер телефона',
        experience: 'Опыт и мотивация',
        namePlaceholder: 'Введите полное имя',
        emailPlaceholder: 'Введите ваш email',
        phonePlaceholder: 'Введите номер телефона',
        experiencePlaceholder: 'Опишите ваш опыт в сфере финансов, управления или смежных областях, а также вашу мотивацию стать членом правления...',
        cancel: 'Отменить',
        submit: 'Подать заявку',
        submitting: 'Отправка...',
        success: 'Заявка успешно подана!',
        successDescription: 'Мы свяжемся с вами в ближайшее время.',
        submitError: 'Не удалось подать заявку. Попробуйте ещё раз.'
      },
      loan: {
        title: 'Заявка на кредит',
        description: 'Заполните форму и получите решение в течение 24 часов',
        summary: {
          title: 'Параметры кредита',
          amount: 'Сумма',
          term: 'Срок',
          monthlyPayment: 'Ежемесячный платёж',
          totalPayment: 'Общий платёж',
          months: 'мес.'
        },
        personal: {
          title: 'Личные данные',
          name: 'Полное имя',
          email: 'Email адрес',
          phone: 'Номер телефона',
          namePlaceholder: 'Ваше полное имя',
          emailPlaceholder: 'your@email.com',
          phonePlaceholder: '+370 600 00000'
        },
        financial: {
          title: 'Финансовая информация',
          monthlyIncome: 'Ежемесячный доход (€)',
          employment: 'Работодатель',
          incomePlaceholder: '2000',
          employmentPlaceholder: 'ООО Пример'
        },
        purpose: {
          title: 'Цель кредита',
          label: 'Для чего вам нужен кредит?',
          placeholder: 'Кратко опишите, как планируете использовать кредит'
        },
        terms: {
          title: 'Я согласен с условиями:',
          items: [
            '14% годовая процентная ставка без скрытых комиссий',
            'Решение в течение 24 часов',
            'Обработка данных согласно политике конфиденциальности',
            'Связь для получения дополнительной информации'
          ]
        },
        submit: 'Подать заявку',
        submitting: 'Подача заявки...',
        success: 'Заявка успешно подана!',
        successDescription: 'Мы свяжемся с вами в течение 24 часов.',
        submitError: 'Не удалось подать заявку. Попробуйте ещё раз.'
      }
    },
    banking: {
      transfer: {
        title: 'Денежный перевод',
        toAccount: 'Номер счёта получателя',
        toName: 'Имя получателя',
        amount: 'Сумма (LT)',
        description: 'Назначение (необязательно)',
        toAccountPlaceholder: 'LT############',
        toNamePlaceholder: 'Полное имя',
        amountPlaceholder: '0.00',
        descriptionPlaceholder: 'Назначение платежа...',
        submit: 'Перевести',
        submitting: 'Обработка...',
        cancel: 'Отменить',
        success: 'Перевод успешен',
        successDescription: 'Вы перевели {amount} LT на счёт {account}',
        insufficientFunds: 'Недостаточно средств',
        transferError: 'Не удалось выполнить перевод',
        positiveAmountError: 'Сумма должна быть положительной'
      }
    },
    forms: {
      required: '*',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отменить',
      submit: 'Отправить',
      save: 'Сохранить'
    }
  },
  de: {
    nav: {
      home: 'Startseite',
      services: 'Dienstleistungen',
      howItWorks: 'Wie es funktioniert',
      about: 'Über uns',
      contact: 'Kontakt',
      login: 'Anmelden',
      register: 'Registrieren',
      dashboard: 'Mein Konto',
      logout: 'Abmelden'
    },
    calculators: {
      title: 'Wählen Sie den Rechnertyp',
      daily: 'Tageszinsen',
      term: 'Festgeld',
      loans: 'Kredite'
    },
    about: {
      title: 'LTB Bank - Ihr vertrauensvoller Partner',
      subtitle: 'Wir sind ein innovativer Anbieter von Finanzlösungen, der Kunden dabei hilft, sicher und profitabel Geld zu sparen.',
      security: {
        title: 'Ihre Sicherheit',
        description: 'Wir verwenden Verschlüsselungstechnologien höchster Stufe und strenge Sicherheitsprotokolle.',
        insurance: 'Einlagen bis zu 100.000 € versichert'
      },
      innovation: {
        title: 'Innovation',
        description: 'Als erste in Litauen haben wir das Tageszinssystem eingeführt - Ihr Geld wächst jeden Tag.',
        benefit: 'Tageszinsen'
      },
      transparency: {
        title: 'Transparenz',
        description: 'Keine versteckten Gebühren oder komplizierten Bedingungen. Alles ist klar und verständlich.',
        guarantee: 'Keine versteckten Gebühren'
      }
    },
    hero: {
      badge: 'Bank der Zukunft',
      title: 'Ihr Geld wächst jeden Tag',
      description: 'Die erste Bank in Litauen, die täglich Zinsen zahlt. Keine komplizierten Bedingungen, keine versteckten Gebühren. Einfach ein Konto eröffnen und sparen.',
      cta: 'Zinsen berechnen',
      features: {
        daily: 'Tageszinsen',
        noFees: 'Keine Gebühren',
        safe: 'Sicher und zuverlässig'
      }
    },
    services: {
      badge: 'Unsere Dienstleistungen',
      title: 'Finanzlösungen für jede Situation',
      subtitle: 'Wir bieten eine breite Palette von Finanzdienstleistungen, die auf Ihre Bedürfnisse zugeschnitten sind',
      daily: {
        title: 'Tageszinsen',
        description: 'Ihr Geld wächst jeden Tag. Zinsen werden täglich berechnet und ausgezahlt.',
        rate: 'Bis zu 12% p.a.',
        cta: 'Zinsen berechnen'
      },
      term: {
        title: 'Festgeld',
        description: 'Feste Zinsen für die gesamte Laufzeit. Garantierte Rentabilität.',
        rate: 'Bis zu 15% p.a.',
        cta: 'Festgeld berechnen'
      },
      loans: {
        title: 'Kredite',
        description: 'Schnelle und bequeme Kredite ohne komplizierte Verfahren.',
        rate: 'Ab 14% p.a.',
        cta: 'Kredit berechnen'
      }
    },
    howItWorks: {
      badge: 'Wie es funktioniert',
      title: 'Einfacher Prozess',
      subtitle: 'Sie können in nur wenigen Minuten mit dem Sparen beginnen',
      steps: {
        register: {
          title: 'Registrieren',
          description: 'Füllen Sie ein einfaches Registrierungsformular aus'
        },
        deposit: {
          title: 'Geld einzahlen',
          description: 'Überweisen Sie Geld auf Ihr neues Konto'
        },
        earn: {
          title: 'Verdienen',
          description: 'Zinsen werden täglich berechnet und ausgezahlt'
        }
      }
    },
    daily: {
      title: 'Tageszinsenrechner',
      subtitle: 'Berechnen Sie, wie viel Sie mit Tageszinsen verdienen können',
      inputs: {
        amount: 'Betrag (€)',
        rate: 'Zinssatz (%)',
        days: 'Anzahl der Tage'
      },
      results: {
        dailyInterest: 'Tageszinsen',
        totalEarned: 'Insgesamt verdient',
        finalAmount: 'Endbetrag'
      },
      example: 'Beispiel: 1000 € bei 12% Zinsen für 30 Tage'
    },
    term: {
      title: 'Festgeldrechner',
      subtitle: 'Berechnen Sie Ihren Gewinn mit Festgeld',
      inputs: {
        amount: 'Einlagebetrag (€)',
        rate: 'Zinssatz (%)',
        term: 'Laufzeit (Monate)'
      },
      results: {
        monthlyInterest: 'Monatliche Zinsen',
        totalInterest: 'Gesamtzinsen',
        finalAmount: 'Endbetrag'
      },
      cta: {
        title: 'Möchten Sie ein Festgeld anlegen?',
        subtitle: 'Kontaktieren Sie uns und erhalten Sie die besten Konditionen',
        button: 'Festgeld anlegen'
      }
    },
    loans: {
      title: 'Kreditrechner',
      subtitle: 'Berechnen Sie monatliche Raten und Gesamtkreditkosten',
      inputs: {
        amount: 'Kreditsumme (€)',
        rate: 'Zinssatz (%)',
        term: 'Laufzeit (Monate)'
      },
      results: {
        monthlyPayment: 'Monatliche Rate',
        totalPayment: 'Gesamtzahlung',
        totalInterest: 'Gesamtzinsen'
      },
      schedule: {
        title: 'Zahlungsplan',
        month: 'Monat',
        payment: 'Zahlung',
        principal: 'Tilgung',
        interest: 'Zinsen',
        balance: 'Restschuld'
      },
      application: {
        title: 'Möchten Sie diesen Kredit erhalten?',
        subtitle: 'Stellen Sie einen Antrag und erhalten Sie eine Entscheidung innerhalb von 24 Stunden',
        button: 'Antrag stellen'
      }
    },
    contact: {
      badge: 'Kontaktieren Sie uns',
      title: 'Haben Sie Fragen?',
      subtitle: 'Unser Expertenteam ist immer bereit zu helfen. Kontaktieren Sie uns auf jede für Sie bequeme Weise.',
      form: {
        title: 'Schreiben Sie uns',
        name: 'Name',
        phone: 'Telefon',
        email: 'E-Mail',
        message: 'Nachricht',
        namePlaceholder: 'Ihr Name',
        phonePlaceholder: '+370 XXX XXXXX',
        emailPlaceholder: 'ihre.email@example.com',
        messagePlaceholder: 'Schreiben Sie Ihre Frage oder Ihren Kommentar...',
        submit: 'Nachricht senden',
        submitting: 'Senden...',
        success: 'Nachricht gesendet!',
        successDescription: 'Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
        error: 'Fehler',
        errorDescription: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
      },
      newsletter: {
        title: 'Newsletter abonnieren',
        description: 'Erhalten Sie die neuesten Informationen über Zinsänderungen, neue Dienstleistungen und Finanzberatung',
        email: 'E-Mail-Adresse',
        name: 'Name (optional)',
        emailPlaceholder: 'ihre.email@example.com',
        namePlaceholder: 'Ihr Name',
        consent: 'Ich stimme zu, dass meine Daten für den Newsletter-Versand verarbeitet werden',
        submit: 'Abonnieren',
        submitting: 'Abonnieren...',
        success: 'Erfolgreich abonniert!',
        successDescription: 'Danke! Sie erhalten in Kürze eine Bestätigungs-E-Mail',
        alreadySubscribed: 'E-Mail bereits abonniert',
        alreadySubscribedDescription: 'Diese E-Mail-Adresse hat unseren Newsletter bereits abonniert',
        subscriptionError: 'Abonnement fehlgeschlagen. Bitte versuchen Sie es erneut',
        validationError: 'Bitte füllen Sie das E-Mail-Feld aus und stimmen Sie der Datenverarbeitung zu'
      }
    },
    faq: {
      badge: 'Häufig gestellte Fragen',
      title: 'FAQ',
      subtitle: 'Hier finden Sie Antworten auf die häufigsten Fragen zu den Dienstleistungen der LTB Bank',
      notFound: {
        title: 'Keine Antwort auf Ihre Frage gefunden?',
        description: 'Kontaktieren Sie unser Expertenteam - wir helfen gerne',
        button: 'Kontaktieren Sie uns'
      }
    },
    footer: {
      bank: 'LTB Bank',
      description: 'Eine innovative Bank, die die Sparkultur in Litauen verändert.',
      services: 'Dienstleistungen',
      company: 'Unternehmen',
      support: 'Support',
      legal: 'Rechtliche Informationen',
      about: 'Über uns',
      careers: 'Karriere',
      blog: 'Blog',
      news: 'Nachrichten',
      privacy: 'Datenschutzrichtlinie',
      terms: 'Nutzungsbedingungen',
      help: 'Hilfe',
      faq: 'FAQ',
      contact: 'Kontakt',
      techSupport: 'Technischer Support',
      calculatorIssues: 'Rechner-Probleme:',
      email: 'info@ltbbank.de',
      rights: 'Alle Rechte vorbehalten',
      license: 'Lizenziert von LB'
    },
    auth: {
      title: 'Banksystem',
      login: 'Anmeldung',
      signup: 'Registrierung',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      displayName: 'Vollständiger Name',
      emailPlaceholder: 'name@example.com',
      passwordPlaceholder: '••••••••',
      confirmPasswordPlaceholder: 'Passwort bestätigen',
      displayNamePlaceholder: 'Vollständiger Name',
      loginButton: 'Anmelden',
      signupButton: 'Registrieren',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      signupNote: 'Eine eindeutige Kontonummer wird bei der Registrierung automatisch erstellt',
      resendConfirmation: 'Unbestätigte E-Mail?',
      resendButton: 'Senden',
      resendPlaceholder: 'E-Mail',
      minPasswordLength: 'Mindestens 6 Zeichen'
    },
    modals: {
      registration: {
        title: 'Registrierung',
        accountType: 'Kontotyp',
        personal: 'Privat',
        company: 'Geschäftlich',
        name: 'Vollständiger Name',
        email: 'E-Mail',
        phone: 'Telefonnummer',
        namePlaceholder: 'Geben Sie Ihren vollständigen Namen ein',
        emailPlaceholder: 'name@example.com',
        phonePlaceholder: '+370...',
        originalPrice: 'Ursprünglicher Preis:',
        discount: 'Rabatt',
        finalPrice: 'Endpreis:',
        payButton: 'Mit Stripe bezahlen',
        campaignBanner: 'AKTION 50% RABATT!',
        campaignDescription: 'Für Neukunden bis 2025-09-01',
        timeLeft: 'Verbleibende Zeit:',
        validationError: 'Bitte füllen Sie alle Pflichtfelder aus',
        paymentError: 'Zahlung konnte nicht erstellt werden'
      },
      discount: {
        title: 'Rabattcode anfordern',
        description: 'Füllen Sie das Formular aus und wir senden Ihnen innerhalb von 24 Stunden einen Rabattcode',
        accountType: 'Kontotyp',
        personal: 'Privat',
        company: 'Geschäftlich',
        name: 'Vollständiger Name',
        email: 'E-Mail',
        namePlaceholder: 'Geben Sie Ihren vollständigen Namen ein',
        emailPlaceholder: 'name@example.com',
        submitButton: 'Anfrage senden',
        howItWorks: 'Wie funktioniert es?',
        howItWorksList: [
          'Ihre Anfrage wird an den Administrator gesendet',
          'Innerhalb von 24 Stunden erhalten Sie eine Antwort per E-Mail',
          'Nach Bestätigung - erhalten Sie einen 50% Rabattcode',
          'Der Code ist 30 Tage gültig'
        ],
        validationError: 'Bitte füllen Sie alle Felder aus',
        success: 'Erfolgreich!',
        successDescription: 'Ihre Rabattanfrage wurde erfolgreich gesendet. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
        submitError: 'Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
      },
      board: {
        title: 'Vorstandsmitglied werden',
        description: 'Füllen Sie das Formular aus und wir werden uns bald mit Ihnen in Verbindung setzen, um Möglichkeiten zu besprechen.',
        warning: '⚠️ ACHTUNG: Um Vorstandsmitglied zu werden, ist ein Beitrag von mindestens 100.000 Litas erforderlich.',
        name: 'Vollständiger Name',
        email: 'E-Mail',
        phone: 'Telefonnummer',
        experience: 'Erfahrung und Motivation',
        namePlaceholder: 'Geben Sie Ihren vollständigen Namen ein',
        emailPlaceholder: 'Geben Sie Ihre E-Mail ein',
        phonePlaceholder: 'Geben Sie Ihre Telefonnummer ein',
        experiencePlaceholder: 'Beschreiben Sie Ihre Erfahrung in Finanzen, Management oder verwandten Bereichen sowie Ihre Motivation, Vorstandsmitglied zu werden...',
        cancel: 'Abbrechen',
        submit: 'Antrag einreichen',
        submitting: 'Senden...',
        success: 'Antrag erfolgreich eingereicht!',
        successDescription: 'Wir werden uns bald bei Ihnen melden.',
        submitError: 'Antrag konnte nicht eingereicht werden. Bitte versuchen Sie es erneut.'
      },
      loan: {
        title: 'Kreditantrag',
        description: 'Füllen Sie das Formular aus und erhalten Sie eine Entscheidung innerhalb von 24 Stunden',
        summary: {
          title: 'Kreditparameter',
          amount: 'Betrag',
          term: 'Laufzeit',
          monthlyPayment: 'Monatliche Rate',
          totalPayment: 'Gesamtzahlung',
          months: 'Mon.'
        },
        personal: {
          title: 'Persönliche Informationen',
          name: 'Vollständiger Name',
          email: 'E-Mail-Adresse',
          phone: 'Telefonnummer',
          namePlaceholder: 'Ihr vollständiger Name',
          emailPlaceholder: 'ihre@email.com',
          phonePlaceholder: '+370 600 00000'
        },
        financial: {
          title: 'Finanzielle Informationen',
          monthlyIncome: 'Monatliches Einkommen (€)',
          employment: 'Arbeitgeber',
          incomePlaceholder: '2000',
          employmentPlaceholder: 'Firma GmbH'
        },
        purpose: {
          title: 'Kreditzweck',
          label: 'Wofür benötigen Sie den Kredit?',
          placeholder: 'Beschreiben Sie kurz, wie Sie den Kredit verwenden möchten'
        },
        terms: {
          title: 'Ich stimme den Bedingungen zu:',
          items: [
            '14% jährlicher Zinssatz ohne versteckte Gebühren',
            'Entscheidung innerhalb von 24 Stunden',
            'Datenverarbeitung gemäß Datenschutzrichtlinie',
            'Kontakt für zusätzliche Informationen'
          ]
        },
        submit: 'Antrag einreichen',
        submitting: 'Antrag wird eingereicht...',
        success: 'Antrag erfolgreich eingereicht!',
        successDescription: 'Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
        submitError: 'Antrag konnte nicht eingereicht werden. Bitte versuchen Sie es erneut.'
      }
    },
    banking: {
      transfer: {
        title: 'Geldtransfer',
        toAccount: 'Empfänger-Kontonummer',
        toName: 'Empfängername',
        amount: 'Betrag (LT)',
        description: 'Verwendungszweck (optional)',
        toAccountPlaceholder: 'LT############',
        toNamePlaceholder: 'Vollständiger Name',
        amountPlaceholder: '0.00',
        descriptionPlaceholder: 'Zahlungszweck...',
        submit: 'Überweisen',
        submitting: 'Verarbeitung...',
        cancel: 'Abbrechen',
        success: 'Transfer erfolgreich',
        successDescription: 'Sie haben {amount} LT auf das Konto {account} überwiesen',
        insufficientFunds: 'Unzureichende Mittel',
        transferError: 'Transfer konnte nicht verarbeitet werden',
        positiveAmountError: 'Betrag muss positiv sein'
      }
    },
    forms: {
      required: '*',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolgreich',
      cancel: 'Abbrechen',
      submit: 'Einreichen',
      save: 'Speichern'
    }
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState('lt');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Lithuanian if key not found
        value = translations.lt;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};