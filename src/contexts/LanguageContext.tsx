import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'lt' | 'en' | 'ru' | 'de';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('de')) return 'de';
  return 'lt'; // default to Lithuanian
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ltb-language');
    if (saved && ['lt', 'en', 'ru', 'de'].includes(saved)) {
      return saved as Language;
    }
    return detectBrowserLanguage();
  });

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('ltb-language', language);
  };

  const t = (key: string): string => {
    const translations = getTranslations();
    const keys = key.split('.');
    let result: any = translations[currentLanguage];
    
    for (const k of keys) {
      result = result?.[k];
    }
    
    return result || key;
  };

  useEffect(() => {
    localStorage.setItem('ltb-language', currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const getTranslations = () => ({
  lt: {
    nav: {
      home: 'Pradžia',
      services: 'Paslaugos',
      howItWorks: 'Kaip veikia',
      about: 'Apie mus',
      contact: 'Kontaktai',
      login: 'Prisijungti',
      register: 'Registruotis',
      dashboard: 'Mano paskyra',
      logout: 'Atsijungti'
    },
    calculators: {
      title: 'Pasirinkite skaičiuoklės tipą',
      daily: 'Dienos palūkanos',
      term: 'Terminuoti indėliai',
      loans: 'Paskolos'
    },
    about: {
      title: 'LTB Bankas - Jūsų patikimas partneris',
      subtitle: 'Esame inovatyvus finansų sprendimų teikėjas, kuris padeda klientams saugiai ir pelningai taupyti pinigus.',
      security: {
        title: 'Saugumas',
        description: 'Jūsų pinigai apsaugoti moderniausiais saugumo sprendimais ir draudimu.'
      },
      profitability: {
        title: 'Pelningumo',
        description: 'Siūlome konkurencingą 8% metinę palūkanų normą su kasdieniu palūkanų mokėjimu.'
      },
      experience: {
        title: 'Patirtis',
        description: 'Turime daugelio metų patirtį finansų srityje ir tūkstančių patenkintų klientų.'
      }
    },
    hero: {
      title: 'Taupyk protingai',
      subtitle: 'su dienos palūkanomis',
      description: 'Pirmasis pasaulyje bankas, mokantis palūkanas kasdien. Skaidru, saugu, be paslėptų mokesčių – taip atrodo šiuolaikinis taupymas.',
      ctaPrimary: 'Pradėti taupyti dabar',
      ctaSecondary: 'Sužinoti daugiau',
      newSolutions: 'Naujoviški taupymo sprendimai',
      features: {
        daily: {
          title: 'Dienos palūkanos',
          description: 'Gaukite palūkanas kiekvieną dieną, ne kartą per metus'
        },
        security: {
          title: '100% saugumas',
          description: 'Jūsų pinigai apsaugoti bankine licencija ir draudimu'
        },
        noFees: {
          title: 'Jokių mokesčių',
          description: 'Nėra slepiamų mokesčių ar mėnesinių tarifų'
        }
      }
    },
    services: {
      badge: 'Mūsų paslaugos',
      title: 'Kodėl rinktis LTB Bankas?',
      subtitle: 'Siūlome inovatyvius sprendimus, kurie padės jums taupyti efektyviau ir saugiau nei bet kada anksčiau.',
      items: {
        dailyInterest: {
          title: 'Dienos palūkanos',
          description: 'Gaukite palūkanas kasdien, o ne tik metų pabaigoje. Jūsų pinigai dirba kiekvieną dieną.',
          badge: 'Populiariausia'
        },
        noReports: {
          title: 'Jokių ataskaičių',
          description: 'Niekas neprašys deklaracijų ar pajamų paaiškinimų. Tiesiog taupykite ir gaukite palūkanas.',
          badge: 'Paprasta'
        },
        confidentiality: {
          title: 'Konfidencialumas',
          description: 'Jūsų finansinė informacija yra griežtai konfidenciali. Niekam neatskleidžiame duomenų.',
          badge: 'Saugus'
        },
        transparent: {
          title: 'Skaidrus skaičiavimas',
          description: 'Visada žinote, kiek uždirbsite. Jokių slepiamų mokesčių ar sudėtingų sąlygų.',
          badge: 'Aiškus'
        },
        fastAccess: {
          title: 'Greitas priėjimas',
          description: 'Pinigai prieinami bet kada. Nėra užšaldymo periodų ar išėmimo apribojimų.',
          badge: 'Greitas'
        },
        competitive: {
          title: 'Konkurencingos palūkanos',
          description: 'Siūlome vieną iš aukščiausių palūkanų normų rinkoje - iki 8% per metus.',
          badge: 'Pelningas'
        },
        loans: {
          title: 'Paskolos 14% palūkanomis',
          description: 'Gaukite paskolą su skaidria 14% metine palūkanų norma be jokių paslėptų mokesčių.',
          badge: 'Naujas'
        }
      },
      cta: {
        title: 'Pradėkite jau šiandien',
        description: 'Prisijunkite prie tūkstančių klientų, kurie jau uždirba su LTB Bankas',
        button: 'Registruotis dabar'
      }
    },
    howItWorks: {
      badge: 'Paprastas procesas',
      title: 'Kaip tai veikia?',
      subtitle: 'Pradėti taupyti su LTB Bankas yra paprasta ir greita. Štai kaip tai veikia.',
      steps: {
        register: {
          title: 'Registruokitės',
          description: 'Sukurkite paskyrą per 3 minutes. Jokių sudėtingų dokumentų ar ataskaičių nereikia.'
        },
        deposit: {
          title: 'Įneškite pinigus',
          description: 'Įneškite pinigus į savo sąskaitą iš betkurio pasaulio banko, įnešimas saugus ir greitas.'
        },
        earn: {
          title: 'Gaukite palūkanas',
          description: 'Jūsų pinigai pradės dirbti iš karto. Palūkanos skaičiuojamos ir mokai kasdien.'
        },
        withdraw: {
          title: 'Naudokitės pinigais',
          description: 'Pinigai prieinami bet kada. Galite išsiimti visą sumą ar tik dalį - kaip jums patogu.'
        }
      },
      cta: {
        title: 'Pasiruošę pradėti taupyti?',
        description: 'Prisijunkite prie tūkstančių klientų, kurie jau uždirba su LTB Bankas',
        buttonPrimary: 'Registruotis dabar',
        buttonSecondary: 'Skaityti daugiau'
      }
    },
    calculator: {
      badge: 'Palūkanų skaičiuoklė',
      title: 'Apskaičiuokite savo pelną',
      subtitle: 'Sužinokite, kiek uždirbsite su mūsų dienos palūkanomis',
      form: {
        amountLabel: 'Taupoma suma (LT)',
        amountPlaceholder: '10000',
        rateLabel: 'Palūkanų norma:',
        rateValue: 'per metus'
      },
      results: {
        title: 'Jūsų pelnas',
        daily: 'Per dieną',
        monthly: 'Per mėnesį',
        yearly: 'Per metus',
        manageDashboard: 'Valdyti sąskaitą',
        register: 'Registruotis',
        login: 'Prisijungti'
      }
    },
    faq: {
      badge: 'Dažniausiai užduodami klausimai',
      title: 'Turite klausimų?',
      subtitle: 'Štai atsakymai į dažniausiai užduodamus klausimus apie LTB Bankas paslaugas',
      questions: {
        dailyInterest: {
          question: 'Kaip veikia dienos palūkanos?',
          answer: 'Palūkanos skaičiuojamos kasdien pagal jūsų sąskaitos likutį. Vietoj to, kad palūkanos būtų mokamos kartą per metus, mes jas mokame kasdien. Tai reiškia, kad jūsų pinigai auga kiekvieną dieną, o ne tik metų pabaigoje.'
        },
        noReports: {
          question: 'Ar tikrai nereikia teikti jokių ataskaičių?',
          answer: 'Taip, mums nereikia pajamų deklaracijų, darbuotojų pažymų ar kitų dokumentų. Tiesiog atidarykite sąskaitą ir pradėkite taupyti. Mes tikime, kad taupymas turi būti paprastas ir prieinamas visiems.'
        },
        security: {
          question: 'Kiek saugūs mano pinigai?',
          answer: 'Jūsų indėliai yra apdrausti pagal ES direktyvas iki 100,000 € per klientą. Mes naudojame aukščiausio lygio šifravimo technologijas ir laikome griežtus saugumo protokolus. Jūsų duomenys yra konfidencialūs ir niekam neatskleidžiami.'
        },
        withdrawal: {
          question: 'Ar galiu išsiimti pinigus bet kada?',
          answer: 'Taip, jūsų pinigai yra prieinami bet kada. Nėra jokių užšaldymo terminų ar baudų už ankstyvas išėmimas. Galite išsiimti visą sumą arba tik dalį - sprendžiate patys.'
        },
        fees: {
          question: 'Kokie yra mokesčiai?',
          answer: 'Mes neimame jokių mokesčių už sąskaitos tvarkymą, pervedimu ar saugojimą. Vienintelis mokestis, kurį mokate, yra standartinis valstybės pajamų mokestis nuo užvaldytų palūkanų.'
        },
        minimum: {
          question: 'Kokia minimuma suma reikalinga pradėti?',
          answer: 'Minimalus indėlio dydis yra tik 100 €. Maksimalaus dydžio apribojimų nėra, tačiau indėliai viršijantys 100,000 € nėra apdrausti pagal ES direktyvas.'
        },
        speed: {
          question: 'Kaip greitai gaunu palūkanas?',
          answer: 'Palūkanos skaičiuojamos ir prijungiamos prie jūsų sąskaitos kasdien. Galite matyti, kaip jūsų balansas auga kiekvieną dieną mūsų mobilejeje aplikacijoje arba internetinėje bankininkystėje.'
        },
        bankruptcy: {
          question: 'Kas nutiks, jei bankrotuosite?',
          answer: 'LTB Bankas yra licencijuotas bankas, prižiūrimas Lietuvos banko. Mūsų veikla yra reguliuojama pagal ES direktyvas, o indėliai apdrausti iki 100,000 € per klientą. Jūsų pinigai yra saugūs.'
        }
      },
      contact: {
        title: 'Neradote atsakymo į savo klausimą?',
        subtitle: 'Susisiekite su mūsų ekspertų komanda - mes mielai padėsime',
        button: 'Susisiekti',
        form: {
          name: 'Vardas',
          email: 'El. paštas',
          message: 'Žinutė',
          send: 'Siųsti',
          cancel: 'Atšaukti',
          sending: 'Siunčiama...',
          namePlaceholder: 'Jūsų vardas',
          emailPlaceholder: 'jusu.pastas@example.com',
          messagePlaceholder: 'Jūsų klausimas...'
        }
      }
    },
    contact: {
      badge: 'Susisiekite su mumis',
      title: 'Turime klausimų?',
      subtitle: 'Mūsų ekspertų komanda visada pasiruošusi padėti. Susisiekite su mumis bet kuriuo jums patogiu būdu.',
      form: {
        title: 'Parašykite mums',
        name: 'Vardas',
        phone: 'Telefonas',
        email: 'El. paštas',
        message: 'Žinutė',
        send: 'Siųsti žinutę',
        sending: 'Siunčiama...',
        namePlaceholder: 'Jūsų vardas',
        phonePlaceholder: '+370 XXX XXXXX',
        emailPlaceholder: 'jusu.paštas@example.com',
        messagePlaceholder: 'Parašykite savo klausimą arba komentarą...'
      },
      newsletter: {
        title: 'Prenumeruoti naujienas',
        description: 'Gaukite naujausią informaciją apie palūkanų pokyčius, naujas paslaugas ir finansų patarimus',
        email: 'El. pašto adresas',
        name: 'Vardas (neprivaloma)',
        consent: 'Sutinku, kad mano duomenys būtų tvarkomi naujienlaiškio siuntimui',
        subscribe: 'Prenumeruoti',
        subscribing: 'Prenumeruojama...',
        emailPlaceholder: 'jusu.pastas@example.com',
        namePlaceholder: 'Jūsų vardas'
      }
    },
    footer: {
      services: 'Paslaugos',
      information: 'Informacija',
      help: 'Pagalba',
      techSupport: 'Techninė pagalba',
      calculatorIssues: 'Skaičiuoklių problemos:',
      copyright: 'Visos teisės saugomos.',
      licensed: 'Licencijuotas Lietuvos banko',
      insured: 'Indėliai apdrausti iki 100,000 €',
      disclaimer: 'LTB Bankas yra licencijuotas kredito institucijos bankas, prižiūrimas Lietuvos banko. Indėliai apdrausti pagal ES direktyvas iki 100,000 € per klientą. Palūkanų dydis priklauso nuo rinkos sąlygų ir gali keistis. Prieš priimant sprendimus konsultuokitės su mūsų ekspertais.'
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
        title: 'Security',
        description: 'Your money is protected by the most modern security solutions and insurance.'
      },
      profitability: {
        title: 'Profitability',
        description: 'We offer a competitive 8% annual interest rate with daily interest payments.'
      },
      experience: {
        title: 'Experience',
        description: 'We have years of experience in finance and thousands of satisfied customers.'
      }
    },
    hero: {
      title: 'Save smartly',
      subtitle: 'with daily interest',
      description: 'World\'s first bank paying daily interest. Transparent, secure, no hidden fees – this is modern saving.',
      ctaPrimary: 'Start Saving Now',
      ctaSecondary: 'Learn More',
      newSolutions: 'Innovative Saving Solutions',
      features: {
        daily: {
          title: 'Daily Interest',
          description: 'Get interest every day, not once a year'
        },
        security: {
          title: '100% Security',
          description: 'Your money is protected by banking license and insurance'
        },
        noFees: {
          title: 'No Fees',
          description: 'No hidden fees or monthly charges'
        }
      }
    },
    services: {
      badge: 'Our Services',
      title: 'Why Choose LTB Bank?',
      subtitle: 'We offer innovative solutions that help you save more efficiently and safely than ever before.',
      items: {
        dailyInterest: {
          title: 'Daily Interest',
          description: 'Get interest every day, not just at year-end. Your money works every day.',
          badge: 'Most Popular'
        },
        noReports: {
          title: 'No Reports',
          description: 'No one asks for declarations or income explanations. Just save and get interest.',
          badge: 'Simple'
        },
        confidentiality: {
          title: 'Confidentiality',
          description: 'Your financial information is strictly confidential. We don\'t disclose data to anyone.',
          badge: 'Secure'
        },
        transparent: {
          title: 'Transparent Calculation',
          description: 'You always know how much you\'ll earn. No hidden fees or complex conditions.',
          badge: 'Clear'
        },
        fastAccess: {
          title: 'Fast Access',
          description: 'Money available anytime. No freeze periods or withdrawal restrictions.',
          badge: 'Fast'
        },
        competitive: {
          title: 'Competitive Interest',
          description: 'We offer one of the highest interest rates in the market - up to 8% per year.',
          badge: 'Profitable'
        },
        loans: {
          title: 'Loans at 14% Interest',
          description: 'Get a loan with transparent 14% annual interest rate without any hidden fees.',
          badge: 'New'
        }
      },
      cta: {
        title: 'Start Today',
        description: 'Join thousands of clients already earning with LTB Bank',
        button: 'Register Now'
      }
    },
    howItWorks: {
      badge: 'Simple Process',
      title: 'How It Works?',
      subtitle: 'Starting to save with LTB Bank is simple and fast. Here\'s how it works.',
      steps: {
        register: {
          title: 'Register',
          description: 'Create an account in 3 minutes. No complex documents or reports needed.'
        },
        deposit: {
          title: 'Deposit Money',
          description: 'Deposit money to your account from any bank worldwide, safe and fast deposit.'
        },
        earn: {
          title: 'Earn Interest',
          description: 'Your money starts working immediately. Interest calculated and paid daily.'
        },
        withdraw: {
          title: 'Use Your Money',
          description: 'Money available anytime. You can withdraw all or part - as convenient for you.'
        }
      },
      cta: {
        title: 'Ready to Start Saving?',
        description: 'Join thousands of clients already earning with LTB Bank',
        buttonPrimary: 'Register Now',
        buttonSecondary: 'Read More'
      }
    },
    calculator: {
      badge: 'Interest Calculator',
      title: 'Calculate Your Profit',
      subtitle: 'Find out how much you\'ll earn with our daily interest',
      form: {
        amountLabel: 'Savings Amount (LT)',
        amountPlaceholder: '10000',
        rateLabel: 'Interest Rate:',
        rateValue: 'per year'
      },
      results: {
        title: 'Your Profit',
        daily: 'Per Day',
        monthly: 'Per Month',
        yearly: 'Per Year',
        manageDashboard: 'Manage Account',
        register: 'Register',
        login: 'Login'
      }
    },
    faq: {
      badge: 'Frequently Asked Questions',
      title: 'Have Questions?',
      subtitle: 'Here are answers to the most frequently asked questions about LTB Bank services',
      questions: {
        dailyInterest: {
          question: 'How do daily interest payments work?',
          answer: 'Interest is calculated daily based on your account balance. Instead of paying interest once a year, we pay it daily. This means your money grows every day, not just at year-end.'
        },
        noReports: {
          question: 'Do I really not need to provide any reports?',
          answer: 'Yes, we don\'t need income declarations, employment certificates or other documents. Just open an account and start saving. We believe saving should be simple and accessible to everyone.'
        },
        security: {
          question: 'How safe is my money?',
          answer: 'Your deposits are insured under EU directives up to €100,000 per customer. We use highest-level encryption technologies and maintain strict security protocols. Your data is confidential and not disclosed to anyone.'
        },
        withdrawal: {
          question: 'Can I withdraw money anytime?',
          answer: 'Yes, your money is available anytime. There are no freeze periods or penalties for early withdrawals. You can withdraw all or part - you decide.'
        },
        fees: {
          question: 'What are the fees?',
          answer: 'We don\'t charge any fees for account management, transfers or storage. The only fee you pay is the standard state income tax on earned interest.'
        },
        minimum: {
          question: 'What\'s the minimum amount needed to start?',
          answer: 'The minimum deposit is just 100 €. There are no maximum limits, but deposits exceeding €100,000 are not insured under EU directives.'
        },
        speed: {
          question: 'How quickly do I get interest?',
          answer: 'Interest is calculated and added to your account daily. You can see your balance grow every day in our mobile app or online banking.'
        },
        bankruptcy: {
          question: 'What happens if you go bankrupt?',
          answer: 'LTB Bank is a licensed bank supervised by the Bank of Lithuania. Our operations are regulated under EU directives, and deposits are insured up to €100,000 per customer. Your money is safe.'
        }
      },
      contact: {
        title: 'Didn\'t find the answer to your question?',
        subtitle: 'Contact our expert team - we\'re happy to help',
        button: 'Contact Us',
        form: {
          name: 'Name',
          email: 'Email',
          message: 'Message',
          send: 'Send',
          cancel: 'Cancel',
          sending: 'Sending...',
          namePlaceholder: 'Your name',
          emailPlaceholder: 'your.email@example.com',
          messagePlaceholder: 'Your question...'
        }
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
        send: 'Send Message',
        sending: 'Sending...',
        namePlaceholder: 'Your name',
        phonePlaceholder: '+370 XXX XXXXX',
        emailPlaceholder: 'your.email@example.com',
        messagePlaceholder: 'Write your question or comment...'
      },
      newsletter: {
        title: 'Subscribe to Newsletter',
        description: 'Get the latest information about interest rate changes, new services and financial advice',
        email: 'Email Address',
        name: 'Name (optional)',
        consent: 'I agree that my data will be processed for newsletter delivery',
        subscribe: 'Subscribe',
        subscribing: 'Subscribing...',
        emailPlaceholder: 'your.email@example.com',
        namePlaceholder: 'Your name'
      }
    },
    footer: {
      services: 'Services',
      information: 'Information',
      help: 'Help',
      techSupport: 'Technical Support',
      calculatorIssues: 'Calculator issues:',
      copyright: 'All rights reserved.',
      licensed: 'Licensed by Bank of Lithuania',
      insured: 'Deposits insured up to €100,000',
      disclaimer: 'LTB Bank is a licensed credit institution supervised by the Bank of Lithuania. Deposits are insured under EU directives up to €100,000 per customer. Interest rates depend on market conditions and may change. Consult our experts before making decisions.'
    }
  },
  ru: {
    nav: {
      home: 'Главная',
      services: 'Услуги',
      howItWorks: 'Как работает',
      about: 'О нас',
      contact: 'Контакты',
      login: 'Войти',
      register: 'Регистрация',
      dashboard: 'Мой счет',
      logout: 'Выйти'
    },
    hero: {
      title: 'Первый банк в мире, выплачивающий проценты ежедневно',
      subtitle: 'Получайте 8% годовых с ежедневными выплатами процентов. Прозрачно, безопасно, без скрытых комиссий.',
      cta: 'Начать накопления',
      learnMore: 'Узнать больше'
    },
    services: {
      badge: 'Наши услуги',
      title: 'Почему выбрать LTB Банк?',
      subtitle: 'Мы предлагаем инновационные решения, которые помогут вам сберегать более эффективно и безопасно, чем когда-либо прежде.',
      items: {
        dailyInterest: {
          title: 'Ежедневные проценты',
          description: 'Получайте проценты каждый день, а не только в конце года. Ваши деньги работают каждый день.',
          badge: 'Самая популярная'
        },
        noReports: {
          title: 'Никаких отчетов',
          description: 'Никто не будет просить декларации или объяснения доходов. Просто сберегайте и получайте проценты.',
          badge: 'Просто'
        },
        confidentiality: {
          title: 'Конфиденциальность',
          description: 'Ваша финансовая информация строго конфиденциальна. Мы никому не раскрываем данные.',
          badge: 'Безопасно'
        },
        transparent: {
          title: 'Прозрачный расчет',
          description: 'Вы всегда знаете, сколько заработаете. Никаких скрытых комиссий или сложных условий.',
          badge: 'Ясно'
        },
        fastAccess: {
          title: 'Быстрый доступ',
          description: 'Деньги доступны в любое время. Нет периодов заморозки или ограничений на снятие.',
          badge: 'Быстро'
        },
        competitive: {
          title: 'Конкурентные проценты',
          description: 'Мы предлагаем одну из самых высоких процентных ставок на рынке - до 8% в год.',
          badge: 'Выгодно'
        },
        loans: {
          title: 'Кредиты под 14% годовых',
          description: 'Получите кредит с прозрачной ставкой 14% годовых без скрытых комиссий.',
          badge: 'Новинка'
        }
      },
      cta: {
        title: 'Начните уже сегодня',
        description: 'Присоединяйтесь к тысячам клиентов, которые уже зарабатывают с LTB Банк',
        button: 'Зарегистрироваться сейчас'
      }
    },
    calculators: {
      title: 'Выберите тип калькулятора',
      daily: 'Ежедневные проценты',
      term: 'Срочные вклады',
      loans: 'Кредиты'
    },
    about: {
      title: 'LTB Банк - Ваш надежный партнер',
      subtitle: 'Мы инновационный поставщик финансовых решений, который помогает клиентам безопасно и выгодно сберегать деньги.',
      security: {
        title: 'Безопасность',
        description: 'Ваши деньги защищены самыми современными решениями безопасности и страхованием.'
      },
      profitability: {
        title: 'Доходность',
        description: 'Мы предлагаем конкурентоспособную ставку 8% годовых с ежедневными выплатами процентов.'
      },
      experience: {
        title: 'Опыт',
        description: 'У нас многолетний опыт в сфере финансов и тысячи довольных клиентов.'
      }
    },
    footer: {
      services: 'Услуги',
      information: 'Информация',
      help: 'Помощь',
      techSupport: 'Техническая поддержка',
      calculatorIssues: 'Проблемы с калькулятором:',
      copyright: 'Все права защищены.',
      licensed: 'Лицензирован Банком Литвы',
      insured: 'Депозиты застрахованы до €100,000',
      disclaimer: 'LTB Банк является лицензированным кредитным учреждением под надзором Банка Литвы. Депозиты застрахованы согласно директивам ЕС до €100,000 на клиента. Процентные ставки зависят от рыночных условий и могут изменяться. Консультируйтесь с нашими экспертами перед принятием решений.'
    }
  },
  de: {
    nav: {
      home: 'Startseite',
      services: 'Dienstleistungen',
      howItWorks: 'So funktioniert es',
      about: 'Über uns',
      contact: 'Kontakt',
      login: 'Anmelden',
      register: 'Registrieren',
      dashboard: 'Mein Konto',
      logout: 'Abmelden'
    },
    hero: {
      title: 'Weltweit erste Bank mit täglicher Zinszahlung',
      subtitle: 'Erhalten Sie 8% Jahreszins mit täglichen Zinszahlungen. Transparent, sicher, ohne versteckte Gebühren.',
      cta: 'Sparen beginnen',
      learnMore: 'Mehr erfahren'
    },
    services: {
      badge: 'Unsere Dienstleistungen',
      title: 'Warum LTB Bank wählen?',
      subtitle: 'Wir bieten innovative Lösungen, die Ihnen helfen, effizienter und sicherer zu sparen als je zuvor.',
      items: {
        dailyInterest: {
          title: 'Tägliche Zinsen',
          description: 'Erhalten Sie täglich Zinsen, nicht nur am Jahresende. Ihr Geld arbeitet jeden Tag.',
          badge: 'Beliebteste'
        },
        noReports: {
          title: 'Keine Berichte',
          description: 'Niemand verlangt Steuererklärungen oder Einkommensnachweise. Sparen Sie einfach und erhalten Sie Zinsen.',
          badge: 'Einfach'
        },
        confidentiality: {
          title: 'Vertraulichkeit',
          description: 'Ihre Finanzinformationen sind streng vertraulich. Wir geben keine Daten an Dritte weiter.',
          badge: 'Sicher'
        },
        transparent: {
          title: 'Transparente Berechnung',
          description: 'Sie wissen immer, wie viel Sie verdienen werden. Keine versteckten Gebühren oder komplexe Bedingungen.',
          badge: 'Klar'
        },
        fastAccess: {
          title: 'Schneller Zugang',
          description: 'Geld ist jederzeit verfügbar. Keine Sperrfristen oder Abhebungsbeschränkungen.',
          badge: 'Schnell'
        },
        competitive: {
          title: 'Wettbewerbsfähige Zinsen',
          description: 'Wir bieten einen der höchsten Zinssätze am Markt - bis zu 8% pro Jahr.',
          badge: 'Profitabel'
        },
        loans: {
          title: 'Kredite zu 14% Zinsen',
          description: 'Erhalten Sie einen Kredit mit transparenten 14% Jahreszinsen ohne versteckte Gebühren.',
          badge: 'Neu'
        }
      },
      cta: {
        title: 'Starten Sie noch heute',
        description: 'Schließen Sie sich Tausenden von Kunden an, die bereits mit LTB Bank verdienen',
        button: 'Jetzt registrieren'
      }
    },
    calculators: {
      title: 'Rechner-Typ wählen',
      daily: 'Tägliche Zinsen',
      term: 'Festgeld',
      loans: 'Kredite'
    },
    about: {
      title: 'LTB Bank - Ihr vertrauensvoller Partner',
      subtitle: 'Wir sind ein innovativer Anbieter von Finanzlösungen, der Kunden hilft, sicher und profitabel zu sparen.',
      security: {
        title: 'Sicherheit',
        description: 'Ihr Geld ist durch modernste Sicherheitslösungen und Versicherung geschützt.'
      },
      profitability: {
        title: 'Rentabilität',
        description: 'Wir bieten einen wettbewerbsfähigen Zinssatz von 8% pro Jahr mit täglichen Zinszahlungen.'
      },
      experience: {
        title: 'Erfahrung',
        description: 'Wir haben jahrelange Erfahrung im Finanzbereich und Tausende zufriedene Kunden.'
      }
    },
    footer: {
      services: 'Dienstleistungen',
      information: 'Information',
      help: 'Hilfe',
      techSupport: 'Technischer Support',
      calculatorIssues: 'Rechner-Probleme:',
      copyright: 'Alle Rechte vorbehalten.',
      licensed: 'Lizenziert von der Bank von Litauen',
      insured: 'Einlagen bis zu €100,000 versichert',
      disclaimer: 'LTB Bank ist ein lizenziertes Kreditinstitut unter Aufsicht der Bank von Litauen. Einlagen sind nach EU-Richtlinien bis zu €100,000 pro Kunde versichert. Zinssätze hängen von Marktbedingungen ab und können sich ändern. Konsultieren Sie unsere Experten vor Entscheidungen.'
    }
  }
});