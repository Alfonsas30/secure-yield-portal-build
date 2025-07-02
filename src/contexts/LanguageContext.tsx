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
          title: 'Įmokėkite pinigus',
          description: 'Perveskite norimą sumą į savo sąskaitą'
        },
        earn: {
          title: 'Uždirbkite',
          description: 'Stebėkite, kaip jūsų pinigai auga kiekvieną dieną'
        }
      }
    },
    calculator: {
      title: 'Palūkanų skaičiuoklė',
      subtitle: 'Sužinokite, kiek uždirbsite su dienos palūkanomis',
      amount: 'Suma (€)',
      result: {
        daily: 'Dienos pajamos',
        monthly: 'Mėnesio pajamos',
        yearly: 'Metų pajamos'
      },
      note: 'Skaičiavimas atliekamas su 12% metine palūkanų norma'
    },
    termDeposits: {
      title: 'Terminuotųjų indėlių skaičiuoklė',
      subtitle: 'Apskaičiuokite savo indėlio pelningumą',
      form: {
        amount: 'Indėlio suma',
        term: 'Indėlio terminas',
        exactAmount: 'Tiksli suma (€)',
        exactTerm: 'Tikslus terminas (mėn.)',
        months: 'mėn.'
      },
      results: {
        monthlyInterest: 'Mėnesio palūkanos',
        totalInterest: 'Bendros palūkanos',
        finalAmount: 'Galutinė suma',
        interestRate: 'Palūkanų norma'
      },
      cta: {
        title: 'Norite sukurti terminuotąjį indėlį?',
        subtitle: 'Fiksuokite palūkanų normą šiandien ir užtikrinkite stabilų pelningumą',
        button: 'Sudaryti sutartį'
      }
    },
    loans: {
      title: 'Paskolų skaičiuoklė',
      subtitle: 'Apskaičiuokite mėnesio įmoką ir bendras sąnaudas. Palūkanų norma',
      interestRate: '14% metinių',
      form: {
        loanAmount: 'Paskolos suma',
        loanTerm: 'Paskolos terminas',
        exactAmount: 'Tiksli suma (€)',
        exactTerm: 'Tikslus terminas (mėn.)',
        months: 'mėn.'
      },
      results: {
        monthlyPayment: 'Mėnesio įmoka',
        totalAmount: 'Bendra suma',
        interest: 'Palūkanos',
        paymentNote: 'Mėnesio įmoka',
        calculating: 'Skaičiuojama...',
        checkInput: 'Patikrinkite duomenis'
      },
      schedule: {
        title: 'Mokėjimų grafikas',
        subtitle: 'Pirmųjų 12 mėnesių mokėjimų detalus planas',
        headers: {
          month: 'Mėnuo',
          payment: 'Įmoka',
          principal: 'Pagrindinė dalis',
          interest: 'Palūkanos',
          balance: 'Likutis'
        },
        showingFirst: 'Rodomi pirmieji 12 iš',
        totalMonths: 'mėnesių'
      },
      application: {
        title: 'Paruošta pateikti paraišką?',
        subtitle: 'Užpildykite paraišką ir gaukite sprendimą per 24 valandas',
        button: 'Pateikti paraišką'
      }
    },
    contact: {
      badge: 'Susisiekite su mumis',
      title: 'Turite klausimų?',
      subtitle: 'Mūsų ekspertų komanda visada pasiruošusi padėti. Susisiekite su mumis bet kuriuo jums patogiu būdu.',
      form: {
        title: 'Parašykite mums',
        name: 'Vardas',
        email: 'El. paštas',
        message: 'Žinutė',
        send: 'Siųsti',
        cancel: 'Atšaukti',
        sending: 'Siunčiama...',
        placeholder: {
          name: 'Jūsų vardas',
          email: 'jusu.elpastas@example.com',
          message: 'Jūsų klausimas...'
        }
      }
    },
    faq: {
      badge: 'Dažniausiai užduodami klausimai',
      title: 'Turite klausimų?',
      subtitle: 'Štai atsakymai į dažniausiai užduodamus klausimus apie LTB Bankas paslaugas',
      notFound: {
        title: 'Neradote atsakymo į savo klausimą?',
        description: 'Susisiekite su mūsų ekspertų komanda - mielai padėsime',
        button: 'Susisiekti'
      },
      form: {
        name: 'Vardas',
        email: 'El. paštas',
        message: 'Žinutė',
        send: 'Siųsti',
        cancel: 'Atšaukti',
        sending: 'Siunčiama...',
        placeholder: {
          name: 'Jūsų vardas',
          email: 'jusu.elpastas@example.com',
          message: 'Jūsų klausimas...'
        }
      },
      questions: {
        q1: {
          question: 'Kaip veikia dienos palūkanos?',
          answer: 'Palūkanos skaičiuojamos kasdien pagal jūsų sąskaitos likutį. Vietoj to, kad palūkanos būtų mokamos kartą per metus, mes jas mokame kasdien. Tai reiškia, kad jūsų pinigai auga kiekvieną dieną, o ne tik metų pabaigoje.'
        },
        q2: {
          question: 'Ar tikrai nereikia pateikti jokių pažymų?',
          answer: 'Taip, mums nereikia pajamų deklaracijų, darbo pažymų ar kitų dokumentų. Tiesiog atidarykite sąskaitą ir pradėkite taupyti. Tikime, kad taupymas turi būti paprastas ir prieinamas visiems.'
        },
        q3: {
          question: 'Kiek saugūs mano pinigai?',
          answer: 'Jūsų indėliai apdrausti pagal ES direktyvas iki 100 000 € vienam klientui. Naudojame aukščiausio lygio šifravimo technologijas ir laikomės griežtų saugumo protokolų. Jūsų duomenys konfidencialūs ir niekam neatskleisti.'
        },
        q4: {
          question: 'Ar galiu bet kada išsiimti pinigus?',
          answer: 'Taip, jūsų pinigai prieinami bet kada. Nėra jokių užšaldymo periodų ar baudų už anksčiau laiko išėmimą. Galite išsiimti visą sumą ar tik dalį - sprendžiate patys.'
        },
        q5: {
          question: 'Kokie mokesčiai?',
          answer: 'Mes neimsime jokių mokesčių už sąskaitos tvarkymą, pavedimus ar saugojimą. Vienintelis mokestis, kurį mokate - tai įprastas valstybės pajamų mokestis nuo uždirbtos palūkanų.'
        },
        q6: {
          question: 'Kaip greitai galiu pradėti taupyti?',
          answer: 'Sąskaitą galite atidaryti per kelias minutes. Po registracijos iš karto galite pradėti pervesti pinigus ir uždirbti palūkanas. Palūkanos pradedamos skaičiuoti nuo pat pirmos dienos.'
        },
        q7: {
          question: 'Ar yra minimalus indėlio dydis?',
          answer: 'Minimalus indėlio dydis yra tik 10 €. Maksimalus - 100 000 € (indėlių draudimo limitas). Galite pradėti su bet kokia suma ir papildyti sąskaitą bet kada.'
        },
        q8: {
          question: 'Kaip kontroliuojama banko veikla?',
          answer: 'LTB Bankas yra licencijuota kredito įstaiga, kurią kontroliuoja Lietuvos bankas. Laikemės visų ES bankų reguliavimo reikalavimų ir reguliariai teikiame ataskaitas reguliuotojui.'
        }
      }
    },
    footer: {
      services: 'Paslaugos',
      loans: 'Paskolos',
      information: 'Informacija',
      about: 'Apie mus',
      howItWorks: 'Kaip veikia',
      privacy: 'Privatumo politika',
      terms: 'Naudojimosi sąlygos',
      help: 'Pagalba',
      faq: 'DUK',
      contact: 'Kontaktai',
      techSupport: 'Techninė pagalba',
      calculatorIssues: 'Skaičiuoklių problemos:',
      email: 'info@ltbbankas.lt',
      phone: '+370 700 12345',
      copyright: 'Visos teisės saugomos.',
      licensed: 'Licencijuotas Lietuvos banko',
      insured: 'Indėliai apdrausti iki 100 000 €',
      disclaimer: 'LTB Bankas yra licencijuota kredito įstaiga, kurią prižiūri Lietuvos bankas. Indėliai apdrausti pagal ES direktyvas iki 100 000 € vienam klientui. Palūkanų normos priklauso nuo rinkos sąlygų ir gali keistis. Konsultuokitės su mūsų ekspertais prieš priimdami sprendimus.'
    },
    auth: {
      login: 'Prisijungti',
      register: 'Registruotis',
      logout: 'Atsijungti',
      email: 'El. paštas',
      password: 'Slaptažodis',
      confirmPassword: 'Patvirtinkite slaptažodį',
      forgotPassword: 'Pamiršote slaptažodį?',
      noAccount: 'Neturite paskyros?',
      hasAccount: 'Jau turite paskyrą?',
      signUp: 'Registruotis',
      signIn: 'Prisijungti'
    },
    forms: {
      required: 'Privalomas laukas',
      invalidEmail: 'Neteisingas el. pašto formatas',
      submit: 'Pateikti',
      cancel: 'Atšaukti',
      save: 'Išsaugoti',
      loading: 'Kraunama...',
      success: 'Sėkmingai išsaugota',
      error: 'Įvyko klaida'
    },
    modals: {
      close: 'Uždaryti',
      confirm: 'Patvirtinti',
      loanApplication: {
        title: 'Paraiška paskolai',
        personalInfo: 'Asmeninė informacija',
        loanDetails: 'Paskolos duomenys',
        submit: 'Pateikti paraišką',
        submitting: 'Pateikiama...',
        fields: {
          name: 'Vardas, pavardė',
          email: 'El. pašto adresas',
          phone: 'Telefono numeris',
          monthlyIncome: 'Mėnesio pajamos (€)',
          employment: 'Darbovietė',
          loanPurpose: 'Paskolos paskirtis'
        },
        placeholders: {
          name: 'Vardas Pavardė',
          email: 'jusu@elpastas.lt',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'UAB Pavyzdys'
        }
      }
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
      title: 'Choose Calculator Type',
      daily: 'Daily Interest',
      term: 'Term Deposits',
      loans: 'Loans'
    },
    about: {
      title: 'LTB Bank - Your Trusted Partner',
      subtitle: 'We are an innovative financial solutions provider that helps clients save money safely and profitably.',
      security: {
        title: 'Your Security',
        description: 'We use the highest level encryption technologies and strict security protocols.',
        insurance: 'Deposits insured up to €100,000'
      },
      innovation: {
        title: 'Innovation',
        description: 'First in Lithuania to introduce daily interest system - your money grows every day.',
        benefit: 'Daily Interest'
      },
      transparency: {
        title: 'Transparency',
        description: 'No hidden fees or complex conditions. Everything is clear and understandable.',
        guarantee: 'No Hidden Fees'
      }
    },
    hero: {
      badge: 'Bank for the Future',
      title: 'Your money grows every day',
      description: 'The first bank in Lithuania that pays interest daily. No complex conditions, no hidden fees. Just open an account and start saving.',
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
        description: 'Fast and convenient loans without complex procedures.',
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
          title: 'Deposit Money',
          description: 'Transfer the desired amount to your account'
        },
        earn: {
          title: 'Earn',
          description: 'Watch your money grow every day'
        }
      }
    },
    calculator: {
      title: 'Interest Calculator',
      subtitle: 'Find out how much you will earn with daily interest',
      amount: 'Amount (€)',
      result: {
        daily: 'Daily Income',
        monthly: 'Monthly Income',
        yearly: 'Yearly Income'
      },
      note: 'Calculation is performed with 12% annual interest rate'
    },
    termDeposits: {
      title: 'Term Deposit Calculator',
      subtitle: 'Calculate your deposit profitability',
      form: {
        amount: 'Deposit Amount',
        term: 'Deposit Term',
        exactAmount: 'Exact Amount (€)',
        exactTerm: 'Exact Term (months)',
        months: 'months'
      },
      results: {
        monthlyInterest: 'Monthly Interest',
        totalInterest: 'Total Interest',
        finalAmount: 'Final Amount',
        interestRate: 'Interest Rate'
      },
      cta: {
        title: 'Want to create a term deposit?',
        subtitle: 'Lock in the interest rate today and ensure stable profitability',
        button: 'Create Contract'
      }
    },
    loans: {
      title: 'Loan Calculator',
      subtitle: 'Calculate monthly payment and total costs. Interest rate',
      interestRate: '14% annual',
      form: {
        loanAmount: 'Loan Amount',
        loanTerm: 'Loan Term',
        exactAmount: 'Exact Amount (€)',
        exactTerm: 'Exact Term (months)',
        months: 'months'
      },
      results: {
        monthlyPayment: 'Monthly Payment',
        totalAmount: 'Total Amount',
        interest: 'Interest',
        paymentNote: 'Monthly payment for',
        calculating: 'Calculating...',
        checkInput: 'Check input data'
      },
      schedule: {
        title: 'Payment Schedule',
        subtitle: 'Detailed plan for the first 12 months of payments',
        headers: {
          month: 'Month',
          payment: 'Payment',
          principal: 'Principal',
          interest: 'Interest',
          balance: 'Balance'
        },
        showingFirst: 'Showing first 12 of',
        totalMonths: 'total months'
      },
      application: {
        title: 'Ready to submit application?',
        subtitle: 'Fill out the application and get a decision within 24 hours',
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
        email: 'Email',
        message: 'Message',
        send: 'Send',
        cancel: 'Cancel',
        sending: 'Sending...',
        placeholder: {
          name: 'Your name',
          email: 'your.email@example.com',
          message: 'Your question...'
        }
      }
    },
    faq: {
      badge: 'Frequently Asked Questions',
      title: 'Have Questions?',
      subtitle: 'Here are answers to the most frequently asked questions about LTB Bank services',
      notFound: {
        title: 'Didn\'t find answer to your question?',
        description: 'Contact our expert team - we\'re happy to help',
        button: 'Contact Us'
      },
      form: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send',
        cancel: 'Cancel',
        sending: 'Sending...',
        placeholder: {
          name: 'Your name',
          email: 'your.email@example.com',
          message: 'Your question...'
        }
      },
      questions: {
        q1: {
          question: 'How do daily interest payments work?',
          answer: 'Interest is calculated daily based on your account balance. Instead of paying interest once a year, we pay it daily. This means your money grows every day, not just at year-end.'
        },
        q2: {
          question: 'Do I really need to provide any reports?',
          answer: 'No, we don\'t need income declarations, employment certificates, or other documents. Just open an account and start saving. We believe saving should be simple and accessible to everyone.'
        },
        q3: {
          question: 'How safe is my money?',
          answer: 'Your deposits are insured according to EU directives up to €100,000 per client. We use the highest level encryption technologies and maintain strict security protocols. Your data is confidential and not disclosed to anyone.'
        },
        q4: {
          question: 'Can I withdraw money anytime?',
          answer: 'Yes, your money is available anytime. There are no freeze periods or penalties for early withdrawal. You can withdraw the full amount or just part - you decide.'
        },
        q5: {
          question: 'What are the fees?',
          answer: 'We don\'t charge any fees for account management, transfers, or storage. The only fee you pay is the standard state income tax on earned interest.'
        },
        q6: {
          question: 'How quickly can I start saving?',
          answer: 'You can open an account in just a few minutes. After registration, you can immediately start transferring money and earning interest. Interest starts calculating from the very first day.'
        },
        q7: {
          question: 'Is there a minimum deposit size?',
          answer: 'The minimum deposit size is only €10. Maximum - €100,000 (deposit insurance limit). You can start with any amount and top up your account anytime.'
        },
        q8: {
          question: 'How is the bank\'s activity controlled?',
          answer: 'LTB Bank is a licensed credit institution supervised by the Bank of Lithuania. We comply with all EU banking regulation requirements and regularly report to the regulator.'
        }
      }
    },
    footer: {
      services: 'Services',
      loans: 'Loans',
      information: 'Information',
      about: 'About',
      howItWorks: 'How It Works',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      help: 'Help',
      faq: 'FAQ',
      contact: 'Contact',
      techSupport: 'Technical Support',
      calculatorIssues: 'Calculator Issues:',
      email: 'info@ltbbank.com',
      phone: '+370 700 12345',
      copyright: 'All rights reserved.',
      licensed: 'Licensed by Bank of Lithuania',
      insured: 'Deposits insured up to €100,000',
      disclaimer: 'LTB Bank is a licensed credit institution supervised by the Bank of Lithuania. Deposits are insured under EU directives up to €100,000 per customer. Interest rates depend on market conditions and may change. Consult with our experts before making decisions.'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In'
    },
    forms: {
      required: 'Required field',
      invalidEmail: 'Invalid email format',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      success: 'Successfully saved',
      error: 'An error occurred'
    },
    modals: {
      close: 'Close',
      confirm: 'Confirm',
      loanApplication: {
        title: 'Loan Application',
        personalInfo: 'Personal Information',
        loanDetails: 'Loan Details',
        submit: 'Submit Application',
        submitting: 'Submitting...',
        fields: {
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
          monthlyIncome: 'Monthly Income (€)',
          employment: 'Employment',
          loanPurpose: 'Loan Purpose'
        },
        placeholders: {
          name: 'John Doe',
          email: 'your@email.com',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'Company Name'
        }
      }
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
      subtitle: 'Мы являемся инновационным поставщиком финансовых решений, который помогает клиентам безопасно и выгодно сберегать деньги.',
      security: {
        title: 'Ваша безопасность',
        description: 'Мы используем технологии шифрования высочайшего уровня и строгие протоколы безопасности.',
        insurance: 'Депозиты застрахованы до €100,000'
      },
      innovation: {
        title: 'Инновации',
        description: 'Первые в Литве внедрили систему ежедневных процентов - ваши деньги растут каждый день.',
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
      description: 'Первый банк в Литве, который выплачивает проценты ежедневно. Никаких сложных условий, никаких скрытых комиссий. Просто откройте счёт и начните сберегать.',
      cta: 'Рассчитать проценты',
      features: {
        daily: 'Ежедневные проценты',
        noFees: 'Без комиссий',
        safe: 'Безопасно и надёжно'
      }
    },
    services: {
      badge: 'Наши услуги',
      title: 'Финансовые решения для любой ситуации',
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
      subtitle: 'Вы можете начать сберегать всего за несколько минут',
      steps: {
        register: {
          title: 'Зарегистрируйтесь',
          description: 'Заполните простую форму регистрации'
        },
        deposit: {
          title: 'Внесите деньги',
          description: 'Переведите желаемую сумму на свой счёт'
        },
        earn: {
          title: 'Зарабатывайте',
          description: 'Наблюдайте, как ваши деньги растут каждый день'
        }
      }
    },
    calculator: {
      title: 'Калькулятор процентов',
      subtitle: 'Узнайте, сколько вы заработаете с ежедневными процентами',
      amount: 'Сумма (€)',
      result: {
        daily: 'Ежедневный доход',
        monthly: 'Месячный доход',
        yearly: 'Годовой доход'
      },
      note: 'Расчёт выполняется с годовой процентной ставкой 12%'
    },
    termDeposits: {
      title: 'Калькулятор срочных депозитов',
      subtitle: 'Рассчитайте доходность вашего депозита',
      form: {
        amount: 'Сумма депозита',
        term: 'Срок депозита',
        exactAmount: 'Точная сумма (€)',
        exactTerm: 'Точный срок (мес.)',
        months: 'мес.'
      },
      results: {
        monthlyInterest: 'Месячные проценты',
        totalInterest: 'Общие проценты',
        finalAmount: 'Итоговая сумма',
        interestRate: 'Процентная ставка'
      },
      cta: {
        title: 'Хотите создать срочный депозит?',
        subtitle: 'Зафиксируйте процентную ставку сегодня и обеспечьте стабильную доходность',
        button: 'Заключить договор'
      }
    },
    loans: {
      title: 'Калькулятор кредитов',
      subtitle: 'Рассчитайте ежемесячный платёж и общие расходы. Процентная ставка',
      interestRate: '14% годовых',
      form: {
        loanAmount: 'Сумма кредита',
        loanTerm: 'Срок кредита',
        exactAmount: 'Точная сумма (€)',
        exactTerm: 'Точный срок (мес.)',
        months: 'мес.'
      },
      results: {
        monthlyPayment: 'Ежемесячный платёж',
        totalAmount: 'Общая сумма',
        interest: 'Проценты',
        paymentNote: 'Ежемесячный платёж на',
        calculating: 'Рассчитывается...',
        checkInput: 'Проверьте данные'
      },
      schedule: {
        title: 'График платежей',
        subtitle: 'Подробный план первых 12 месяцев платежей',
        headers: {
          month: 'Месяц',
          payment: 'Платёж',
          principal: 'Основная часть',
          interest: 'Проценты',
          balance: 'Остаток'
        },
        showingFirst: 'Показаны первые 12 из',
        totalMonths: 'общих месяцев'
      },
      application: {
        title: 'Готовы подать заявку?',
        subtitle: 'Заполните заявку и получите решение в течение 24 часов',
        button: 'Подать заявку'
      }
    },
    contact: {
      badge: 'Свяжитесь с нами',
      title: 'Есть вопросы?',
      subtitle: 'Наша команда экспертов всегда готова помочь. Свяжитесь с нами любым удобным для вас способом.',
      form: {
        title: 'Напишите нам',
        name: 'Имя',
        email: 'Email',
        message: 'Сообщение',
        send: 'Отправить',
        cancel: 'Отменить',
        sending: 'Отправляется...',
        placeholder: {
          name: 'Ваше имя',
          email: 'ваш.email@example.com',
          message: 'Ваш вопрос...'
        }
      }
    },
    faq: {
      badge: 'Часто задаваемые вопросы',
      title: 'Есть вопросы?',
      subtitle: 'Вот ответы на самые частые вопросы об услугах LTB Банк',
      notFound: {
        title: 'Не нашли ответ на свой вопрос?',
        description: 'Свяжитесь с нашей командой экспертов - мы будем рады помочь',
        button: 'Связаться с нами'
      },
      form: {
        name: 'Имя',
        email: 'Email',
        message: 'Сообщение',
        send: 'Отправить',
        cancel: 'Отменить',
        sending: 'Отправляется...',
        placeholder: {
          name: 'Ваше имя',
          email: 'ваш.email@example.com',
          message: 'Ваш вопрос...'
        }
      },
      questions: {
        q1: {
          question: 'Как работают ежедневные выплаты процентов?',
          answer: 'Проценты рассчитываются ежедневно на основе остатка на вашем счёте. Вместо выплаты процентов один раз в год, мы выплачиваем их ежедневно. Это означает, что ваши деньги растут каждый день, а не только в конце года.'
        },
        q2: {
          question: 'Действительно ли не нужно предоставлять никаких справок?',
          answer: 'Нет, нам не нужны декларации о доходах, справки с места работы или другие документы. Просто откройте счёт и начните сберегать. Мы считаем, что сбережения должны быть простыми и доступными всем.'
        },
        q3: {
          question: 'Насколько безопасны мои деньги?',
          answer: 'Ваши депозиты застрахованы согласно директивам ЕС до €100,000 на одного клиента. Мы используем технологии шифрования высочайшего уровня и соблюдаем строгие протоколы безопасности. Ваши данные конфиденциальны и никому не раскрываются.'
        },
        q4: {
          question: 'Могу ли я снять деньги в любое время?',
          answer: 'Да, ваши деньги доступны в любое время. Нет никаких периодов заморозки или штрафов за досрочное снятие. Вы можете снять всю сумму или только часть - решаете вы.'
        },
        q5: {
          question: 'Какие комиссии?',
          answer: 'Мы не взимаем никаких комиссий за ведение счёта, переводы или хранение. Единственная комиссия, которую вы платите - это стандартный государственный подоходный налог с заработанных процентов.'
        },
        q6: {
          question: 'Как быстро я могу начать сберегать?',
          answer: 'Вы можете открыть счёт всего за несколько минут. После регистрации можете сразу начать переводить деньги и зарабатывать проценты. Проценты начинают рассчитываться с самого первого дня.'
        },
        q7: {
          question: 'Есть ли минимальный размер депозита?',
          answer: 'Минимальный размер депозита составляет всего €10. Максимальный - €100,000 (лимит страхования депозитов). Вы можете начать с любой суммы и пополнять счёт в любое время.'
        },
        q8: {
          question: 'Как контролируется деятельность банка?',
          answer: 'LTB Банк является лицензированным кредитным учреждением под надзором Банка Литвы. Мы соблюдаем все требования банковского регулирования ЕС и регулярно отчитываемся перед регулятором.'
        }
      }
    },
    footer: {
      services: 'Услуги',
      loans: 'Кредиты',
      information: 'Информация',
      about: 'О нас',
      howItWorks: 'Как это работает',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      help: 'Помощь',
      faq: 'FAQ',
      contact: 'Контакты',
      techSupport: 'Техническая поддержка',
      calculatorIssues: 'Проблемы с калькуляторами:',
      email: 'info@ltbbank.ru',
      phone: '+370 700 12345',
      copyright: 'Все права защищены.',
      licensed: 'Лицензирован Банком Литвы',
      insured: 'Депозиты застрахованы до €100,000',
      disclaimer: 'LTB Банк является лицензированным кредитным учреждением под надзором Банка Литвы. Депозиты застрахованы согласно директивам ЕС до €100,000 на одного клиента. Процентные ставки зависят от рыночных условий и могут изменяться. Консультируйтесь с нашими экспертами перед принятием решений.'
    },
    auth: {
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      hasAccount: 'Уже есть аккаунт?',
      signUp: 'Зарегистрироваться',
      signIn: 'Войти'
    },
    forms: {
      required: 'Обязательное поле',
      invalidEmail: 'Неверный формат email',
      submit: 'Отправить',
      cancel: 'Отменить',
      save: 'Сохранить',
      loading: 'Загрузка...',
      success: 'Успешно сохранено',
      error: 'Произошла ошибка'
    },
    modals: {
      close: 'Закрыть',
      confirm: 'Подтвердить',
      loanApplication: {
        title: 'Заявка на кредит',
        personalInfo: 'Личная информация',
        loanDetails: 'Детали кредита',
        submit: 'Подать заявку',
        submitting: 'Подача заявки...',
        fields: {
          name: 'ФИО',
          email: 'Email адрес',
          phone: 'Номер телефона',
          monthlyIncome: 'Ежемесячный доход (€)',
          employment: 'Место работы',
          loanPurpose: 'Цель кредита'
        },
        placeholders: {
          name: 'Иван Иванов',
          email: 'ваш@email.com',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'Название компании'
        }
      }
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
      title: 'Rechner-Typ wählen',
      daily: 'Tägliche Zinsen',
      term: 'Termineinlagen',
      loans: 'Kredite'
    },
    about: {
      title: 'LTB Bank - Ihr vertrauensvoller Partner',
      subtitle: 'Wir sind ein innovativer Anbieter von Finanzlösungen, der Kunden dabei hilft, Geld sicher und profitabel zu sparen.',
      security: {
        title: 'Ihre Sicherheit',
        description: 'Wir verwenden Verschlüsselungstechnologien höchster Stufe und strenge Sicherheitsprotokolle.',
        insurance: 'Einlagen bis zu €100.000 versichert'
      },
      innovation: {
        title: 'Innovation',
        description: 'Als erste in Litauen haben wir das System der täglichen Zinsen eingeführt - Ihr Geld wächst jeden Tag.',
        benefit: 'Tägliche Zinsen'
      },
      transparency: {
        title: 'Transparenz',
        description: 'Keine versteckten Gebühren oder komplexen Bedingungen. Alles ist klar und verständlich.',
        guarantee: 'Keine versteckten Gebühren'
      }
    },
    hero: {
      badge: 'Bank der Zukunft',
      title: 'Ihr Geld wächst jeden Tag',
      description: 'Die erste Bank in Litauen, die täglich Zinsen zahlt. Keine komplexen Bedingungen, keine versteckten Gebühren. Einfach ein Konto eröffnen und mit dem Sparen beginnen.',
      cta: 'Zinsen berechnen',
      features: {
        daily: 'Tägliche Zinsen',
        noFees: 'Keine Gebühren',
        safe: 'Sicher und zuverlässig'
      }
    },
    services: {
      badge: 'Unsere Dienstleistungen',
      title: 'Finanzlösungen für jede Situation',
      subtitle: 'Wir bieten eine breite Palette von Finanzdienstleistungen, die auf Ihre Bedürfnisse zugeschnitten sind',
      daily: {
        title: 'Tägliche Zinsen',
        description: 'Ihr Geld wächst jeden Tag. Zinsen werden täglich berechnet und ausgezahlt.',
        rate: 'Bis zu 12% jährlich',
        cta: 'Zinsen berechnen'
      },
      term: {
        title: 'Termineinlagen',
        description: 'Feste Zinsen für die gesamte Laufzeit. Garantierte Rentabilität.',
        rate: 'Bis zu 15% jährlich',
        cta: 'Einlage berechnen'
      },
      loans: {
        title: 'Kredite',
        description: 'Schnelle und bequeme Kredite ohne komplexe Verfahren.',
        rate: 'Ab 14% jährlich',
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
          description: 'Überweisen Sie den gewünschten Betrag auf Ihr Konto'
        },
        earn: {
          title: 'Verdienen',
          description: 'Beobachten Sie, wie Ihr Geld jeden Tag wächst'
        }
      }
    },
    calculator: {
      title: 'Zinsrechner',
      subtitle: 'Finden Sie heraus, wie viel Sie mit täglichen Zinsen verdienen werden',
      amount: 'Betrag (€)',
      result: {
        daily: 'Tägliches Einkommen',
        monthly: 'Monatliches Einkommen',
        yearly: 'Jährliches Einkommen'
      },
      note: 'Berechnung erfolgt mit 12% jährlichem Zinssatz'
    },
    termDeposits: {
      title: 'Termineinlagen-Rechner',
      subtitle: 'Berechnen Sie die Rentabilität Ihrer Einlage',
      form: {
        amount: 'Einlagenbetrag',
        term: 'Einlagenlaufzeit',
        exactAmount: 'Genauer Betrag (€)',
        exactTerm: 'Genaue Laufzeit (Monate)',
        months: 'Monate'
      },
      results: {
        monthlyInterest: 'Monatliche Zinsen',
        totalInterest: 'Gesamtzinsen',
        finalAmount: 'Endbetrag',
        interestRate: 'Zinssatz'
      },
      cta: {
        title: 'Möchten Sie eine Termineinlage erstellen?',
        subtitle: 'Sichern Sie sich heute den Zinssatz und gewährleisten Sie stabile Rentabilität',
        button: 'Vertrag erstellen'
      }
    },
    loans: {
      title: 'Kreditrechner',
      subtitle: 'Berechnen Sie monatliche Zahlung und Gesamtkosten. Zinssatz',
      interestRate: '14% jährlich',
      form: {
        loanAmount: 'Kreditbetrag',
        loanTerm: 'Kreditlaufzeit',
        exactAmount: 'Genauer Betrag (€)',
        exactTerm: 'Genaue Laufzeit (Monate)',
        months: 'Monate'
      },
      results: {
        monthlyPayment: 'Monatliche Zahlung',
        totalAmount: 'Gesamtbetrag',
        interest: 'Zinsen',
        paymentNote: 'Monatliche Zahlung für',
        calculating: 'Berechnung...',
        checkInput: 'Eingabedaten prüfen'
      },
      schedule: {
        title: 'Zahlungsplan',
        subtitle: 'Detaillierter Plan für die ersten 12 Monate der Zahlungen',
        headers: {
          month: 'Monat',
          payment: 'Zahlung',
          principal: 'Hauptbetrag',
          interest: 'Zinsen',
          balance: 'Saldo'
        },
        showingFirst: 'Zeigt erste 12 von',
        totalMonths: 'Gesamtmonaten'
      },
      application: {
        title: 'Bereit, Antrag zu stellen?',
        subtitle: 'Füllen Sie den Antrag aus und erhalten Sie eine Entscheidung innerhalb von 24 Stunden',
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
        email: 'E-Mail',
        message: 'Nachricht',
        send: 'Senden',
        cancel: 'Abbrechen',
        sending: 'Wird gesendet...',
        placeholder: {
          name: 'Ihr Name',
          email: 'ihre.email@example.com',
          message: 'Ihre Frage...'
        }
      }
    },
    faq: {
      badge: 'Häufig gestellte Fragen',
      title: 'Haben Sie Fragen?',
      subtitle: 'Hier sind Antworten auf die häufigsten Fragen zu LTB Bank Dienstleistungen',
      notFound: {
        title: 'Antwort auf Ihre Frage nicht gefunden?',
        description: 'Kontaktieren Sie unser Expertenteam - wir helfen gerne',
        button: 'Kontaktieren Sie uns'
      },
      form: {
        name: 'Name',
        email: 'E-Mail',
        message: 'Nachricht',
        send: 'Senden',
        cancel: 'Abbrechen',
        sending: 'Wird gesendet...',
        placeholder: {
          name: 'Ihr Name',
          email: 'ihre.email@example.com',
          message: 'Ihre Frage...'
        }
      },
      questions: {
        q1: {
          question: 'Wie funktionieren tägliche Zinszahlungen?',
          answer: 'Zinsen werden täglich basierend auf Ihrem Kontostand berechnet. Anstatt Zinsen einmal im Jahr zu zahlen, zahlen wir sie täglich. Das bedeutet, dass Ihr Geld jeden Tag wächst, nicht nur am Jahresende.'
        },
        q2: {
          question: 'Muss ich wirklich keine Bescheinigungen vorlegen?',
          answer: 'Nein, wir benötigen keine Einkommenserklärungen, Arbeitsbescheinigungen oder andere Dokumente. Eröffnen Sie einfach ein Konto und beginnen Sie zu sparen. Wir glauben, dass Sparen einfach und für jeden zugänglich sein sollte.'
        },
        q3: {
          question: 'Wie sicher ist mein Geld?',
          answer: 'Ihre Einlagen sind gemäß EU-Richtlinien bis zu €100.000 pro Kunde versichert. Wir verwenden Verschlüsselungstechnologien höchster Stufe und befolgen strenge Sicherheitsprotokolle. Ihre Daten sind vertraulich und werden niemandem offengelegt.'
        },
        q4: {
          question: 'Kann ich jederzeit Geld abheben?',
          answer: 'Ja, Ihr Geld ist jederzeit verfügbar. Es gibt keine Sperrfristen oder Strafen für vorzeitige Abhebungen. Sie können den ganzen Betrag oder nur einen Teil abheben - Sie entscheiden.'
        },
        q5: {
          question: 'Welche Gebühren fallen an?',
          answer: 'Wir erheben keine Gebühren für Kontoführung, Überweisungen oder Aufbewahrung. Die einzige Gebühr, die Sie zahlen, ist die standardmäßige staatliche Einkommensteuer auf verdiente Zinsen.'
        },
        q6: {
          question: 'Wie schnell kann ich mit dem Sparen beginnen?',
          answer: 'Sie können ein Konto in nur wenigen Minuten eröffnen. Nach der Registrierung können Sie sofort Geld überweisen und Zinsen verdienen. Die Zinsen werden ab dem ersten Tag berechnet.'
        },
        q7: {
          question: 'Gibt es eine Mindesteinlagenhöhe?',
          answer: 'Die Mindesteinlagenhöhe beträgt nur €10. Maximum - €100.000 (Einlagenversicherungsgrenze). Sie können mit jedem Betrag beginnen und Ihr Konto jederzeit aufstocken.'
        },
        q8: {
          question: 'Wie wird die Banktätigkeit kontrolliert?',
          answer: 'LTB Bank ist ein lizenziertes Kreditinstitut unter Aufsicht der Bank von Litauen. Wir erfüllen alle EU-Bankenregulierungsanforderungen und berichten regelmäßig an die Aufsichtsbehörde.'
        }
      }
    },
    footer: {
      services: 'Dienstleistungen',
      loans: 'Kredite',
      information: 'Information',
      about: 'Über uns',
      howItWorks: 'Wie es funktioniert',
      privacy: 'Datenschutzrichtlinie',
      terms: 'Nutzungsbedingungen',
      help: 'Hilfe',
      faq: 'FAQ',
      contact: 'Kontakt',
      techSupport: 'Technischer Support',
      calculatorIssues: 'Rechner-Probleme:',
      email: 'info@ltbbank.de',
      phone: '+370 700 12345',
      copyright: 'Alle Rechte vorbehalten.',
      licensed: 'Lizenziert von der Bank von Litauen',
      insured: 'Einlagen bis zu €100.000 versichert',
      disclaimer: 'LTB Bank ist ein lizenziertes Kreditinstitut unter Aufsicht der Bank von Litauen. Einlagen sind gemäß EU-Richtlinien bis zu €100.000 pro Kunde versichert. Zinssätze hängen von Marktbedingungen ab und können sich ändern. Konsultieren Sie unsere Experten vor Entscheidungen.'
    },
    auth: {
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Haben Sie kein Konto?',
      hasAccount: 'Haben Sie bereits ein Konto?',
      signUp: 'Registrieren',
      signIn: 'Anmelden'
    },
    forms: {
      required: 'Pflichtfeld',
      invalidEmail: 'Ungültiges E-Mail-Format',
      submit: 'Absenden',
      cancel: 'Abbrechen',
      save: 'Speichern',
      loading: 'Wird geladen...',
      success: 'Erfolgreich gespeichert',
      error: 'Ein Fehler ist aufgetreten'
    },
    modals: {
      close: 'Schließen',
      confirm: 'Bestätigen',
      loanApplication: {
        title: 'Kreditantrag',
        personalInfo: 'Persönliche Informationen',
        loanDetails: 'Kreditdetails',
        submit: 'Antrag stellen',
        submitting: 'Wird eingereicht...',
        fields: {
          name: 'Vollständiger Name',
          email: 'E-Mail-Adresse',
          phone: 'Telefonnummer',
          monthlyIncome: 'Monatliches Einkommen (€)',
          employment: 'Beschäftigung',
          loanPurpose: 'Kreditzweck'
        },
        placeholders: {
          name: 'Max Mustermann',
          email: 'ihre@email.com',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'Firmenname'
        }
      }
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