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
    hero: {
      title: 'Pirmasis bankas pasaulyje, mokantis palūkanas kasdien',
      subtitle: 'Gaukite 8% metinę palūkanų normą su kasdieniu palūkanų mokėjimu. Skaidru, saugu, be paslėptų mokesčių.',
      cta: 'Pradėti taupyti',
      learnMore: 'Sužinoti daugiau'
    },
    services: {
      title: 'Mūsų paslaugos',
      dailyInterest: {
        title: 'Kasdienės palūkanos',
        description: 'Gaukite palūkanas kiekvieną dieną, o ne kartą per metus'
      },
      highReturn: {
        title: 'Aukšta grąža',
        description: '8% metinė palūkanų norma - viena iš aukščiausių rinkoje'
      },
      security: {
        title: 'Saugumas',
        description: 'Jūsų pinigai apsaugoti iki 100,000 € pagal ES direktyvas'
      }
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
    hero: {
      title: 'World\'s first bank paying daily interest',
      subtitle: 'Get 8% annual interest rate with daily interest payments. Transparent, secure, no hidden fees.',
      cta: 'Start Saving',
      learnMore: 'Learn More'
    },
    services: {
      title: 'Our Services',
      dailyInterest: {
        title: 'Daily Interest',
        description: 'Receive interest every day, not once a year'
      },
      highReturn: {
        title: 'High Returns',
        description: '8% annual interest rate - one of the highest in the market'
      },
      security: {
        title: 'Security',
        description: 'Your money is protected up to €100,000 under EU directives'
      }
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
      title: 'Наши услуги',
      dailyInterest: {
        title: 'Ежедневные проценты',
        description: 'Получайте проценты каждый день, а не раз в год'
      },
      highReturn: {
        title: 'Высокая доходность',
        description: '8% годовых - одна из самых высоких на рынке'
      },
      security: {
        title: 'Безопасность',
        description: 'Ваши деньги защищены до €100,000 согласно директивам ЕС'
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
      title: 'Unsere Dienstleistungen',
      dailyInterest: {
        title: 'Tägliche Zinsen',
        description: 'Erhalten Sie Zinsen jeden Tag, nicht einmal im Jahr'
      },
      highReturn: {
        title: 'Hohe Rendite',
        description: '8% Jahreszins - einer der höchsten am Markt'
      },
      security: {
        title: 'Sicherheit',
        description: 'Ihr Geld ist bis zu €100,000 nach EU-Richtlinien geschützt'
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