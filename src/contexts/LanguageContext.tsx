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
      amountLabel: 'Taupoma suma',
      amount: 'Įveskite sumą (LT)',
      rate: 'Palūkanų norma:',
      rateValue: 'per metus',
      results: {
        title: 'Jūsų pelnas',
        daily: 'Per dieną',
        monthly: 'Per mėnesį',
        yearly: 'Per metus'
      },
      buttons: {
        manage: 'Valdyti sąskaitą',
        register: 'Registruotis',
        login: 'Prisijungti'
      }
    },
    termDeposit: {
      badge: 'Terminuotų indėlių skaičiuoklė',
      title: 'Terminuoti indėliai',
      subtitle: 'Aukštesnės palūkanos už didesnės sumos indėlius',
      termSelection: {
        title: 'Pasirinkite terminą',
        subtitle: 'Skirtingi terminai - skirtingos palūkanos',
        oneYear: {
          title: '1 metų terminas',
          subtitle: 'Tradiciniu palūkanų normu',
          rates: {
            up10k: 'Iki 10,000 LT:',
            up100k: '10,000-100,000 LT:',
            over100k: '100,000+ LT:'
          }
        },
        sixYear: {
          title: '6 metų terminas',
          subtitle: 'Ypatingas pasiūlymas',
          rate: '100%',
          forAnyAmount: 'Bet kokiai sumai!',
          badge: 'AUKŠČIAUSIOS PALŪKANOS'
        }
      },
      form: {
        enterAmount: 'Įveskite indėlio sumą',
        enterInvestment: 'Įveskite investuojamą sumą',
        sixYearNote: 'Pasirinkite sumą, kurią norite investuoti 6 metams su 100% palūkanomis',
        depositAmount: 'Indėlio suma (LT)',
        maxAmount: 'maks.',
        accountBalance: 'Sąskaitos likutis:',
        remainingBalance: 'Liks sąskaitoje:',
        overBalance: 'Suma viršija sąskaitos likutį'
      },
      categories: {
        beginner: 'Pradedantis',
        advanced: 'Pažengęs',
        vip: 'VIP',
        vip6years: 'VIP 6 metai',
        level: 'lygis',
        yourRate: 'Jūsų palūkanų norma'
      },
      results: {
        title: 'Jūsų pelnas',
        yearlyProfit: 'Pelnas per metus',
        totalProfit: 'Bendras pelnas už',
        oneYear: '1 metus',
        sixYears: '6 metus',
        totalAmount: 'Gaunama suma:'
      },
      actions: {
        createDeposit: 'Sukurti terminuotą indėlį',
        login: 'Prisijunkite norėdami sukurti',
        register: 'Registruotis dabar',
        goToDashboard: 'Eiti į paskyrą'
      }
    },
    loans: {
      badge: 'Paskolų skaičiuoklė',
      title: 'Paskolos skaičiuoklė',
      subtitle: 'Sužinokite savo mėnesinio mokėjimo dydį su',
      interestRate: '14% metine palūkanų norma',
      form: {
        loanAmount: 'Paskolos suma:',
        loanTerm: 'Paskolos terminas:',
        months: 'mėn.',
        exactAmount: 'Tiksli suma (€)',
        exactTerm: 'Tikslus terminas (mėn.)'
      },
      results: {
        monthlyPayment: 'MOKĖSITE KAS MĖNESĮ:',
        calculating: 'Skaičiuojama...',
        checkInput: 'Patikrinkite įvesties duomenis',
        paymentNote: 'Ši suma bus mokama kiekvieną mėnesį',
        totalAmount: 'Bendra suma',
        interest: 'Palūkanos'
      },
      schedule: {
        title: 'Mokėjimo grafikas',
        subtitle: 'Išsamus kiekvieno mėnesio mokėjimo paskirstymas',
        headers: {
          month: 'Mėnuo',
          payment: 'Mokėjimas',
          principal: 'Pagrindinis kapitalas',
          interest: 'Palūkanos',
          balance: 'Likutis'
        },
        showingFirst: 'Rodomi tik pirmieji 12 mėnesių. Iš viso:',
        totalMonths: 'mėnesių'
      },
      application: {
        title: 'Patenkino skaičiavimas?',
        subtitle: 'Pateikite paraišką paskolai ir gaukite sprendimą per 24 valandas',
        button: 'Pateikti paraišką paskolai'
      },
      modal: {
        title: 'Paraiška paskolai',
        subtitle: 'Užpildykite formą ir gaukite sprendimą per 24 valandas',
        loanParams: 'Paskolos parametrai',
        amount: 'Suma',
        term: 'Terminas',
        monthlyPayment: 'Mėnesinis mokėjimas',
        totalAmount: 'Bendra suma',
        personalInfo: 'Asmens duomenys',
        fullName: 'Vardas, pavardė',
        email: 'El. pašto adresas',
        phone: 'Telefono numeris',
        financialInfo: 'Finansinė informacija',
        monthlyIncome: 'Mėnesinės pajamos (€)',
        employment: 'Darbo vieta',
        loanPurpose: 'Paskolos paskirtis',
        purposeQuestion: 'Kam reikalinga paskola?',
        purposePlaceholder: 'Trumpai aprašykite, kam planuojate panaudoti paskolą',
        terms: {
          title: 'Sutinku su sąlygomis:',
          rate: '14% metinė palūkanų norma be paslėptų mokesčių',
          decision: 'Sprendimas per 24 valandas',
          privacy: 'Duomenų tvarkymas pagal privatumo politiką',
          contact: 'Susisiekimas dėl papildomos informacijos'
        },
        submit: 'Pateikti paraišką',
        submitting: 'Pateikiama paraiška...',
        placeholders: {
          fullName: 'Jūsų vardas ir pavardė',
          email: 'jusu@elpastas.lt',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'UAB Pavyzdys'
        }
      }
    },
    faq: {
      badge: 'Dažniausiai užduodami klausimai',
      title: 'Turite klausimų?',
      subtitle: 'Štai atsakymai į dažniausiai užduodamus klausimus apie LTB Bankas paslaugas',
      questions: {
        q1: {
          question: 'Kaip veikia dienos palūkanos?',
          answer: 'Palūkanos skaičiuojamos kasdien pagal jūsų sąskaitos likutį. Vietoj to, kad palūkanos būtų mokamos kartą per metus, mes jas mokame kasdien. Tai reiškia, kad jūsų pinigai auga kiekvieną dieną, o ne tik metų pabaigoje.'
        },
        q2: {
          question: 'Ar tikrai nereikia teikti jokių ataskaičių?',
          answer: 'Taip, mums nereikia pajamų deklaracijų, darbuotojų pažymų ar kitų dokumentų. Tiesiog atidarykite sąskaitą ir pradėkite taupyti. Mes tikime, kad taupymas turi būti paprastas ir prieinamas visiems.'
        },
        q3: {
          question: 'Kiek saugūs mano pinigai?',
          answer: 'Jūsų indėliai yra apdrausti pagal ES direktyvas iki 100,000 € per klientą. Mes naudojame aukščiausio lygio šifravimo technologijas ir laikome griežtus saugumo protokolus. Jūsų duomenys yra konfidencialūs ir niekam neatskleidžiami.'
        },
        q4: {
          question: 'Ar galiu išsiimti pinigus bet kada?',
          answer: 'Taip, jūsų pinigai yra prieinami bet kada. Nėra jokių užšaldymo terminų ar baudų už ankstyvas išėmimas. Galite išsiimti visą sumą arba tik dalį - sprendžiate patys.'
        },
        q5: {
          question: 'Kokie yra mokesčiai?',
          answer: 'Mes neimame jokių mokesčių už sąskaitos tvarkymą, pervedimu ar saugojimą. Vienintelis mokestis, kurį mokate, yra standartinis valstybės pajamų mokestis nuo užvaldytų palūkanų.'
        },
        q6: {
          question: 'Kokia minimuma suma reikalinga pradėti?',
          answer: 'Minimalus indėlio dydis yra tik 100 €. Maksimalaus dydžio apribojimų nėra, tačiau indėliai viršijantys 100,000 € nėra apdrausti pagal ES direktyvas.'
        },
        q7: {
          question: 'Kaip greitai gaunu palūkanas?',
          answer: 'Palūkanos skaičiuojamos ir prijungiamos prie jūsų sąskaitos kasdien. Galite matyti, kaip jūsų balansas auga kiekvieną dieną mūsų mobilejeje aplikacijoje arba internetinėje bankininkystėje.'
        },
        q8: {
          question: 'Kas nutiks, jei bankrotuosite?',
          answer: 'LTB Bankas yra licencijuotas bankas, prižiūrimas Lietuvos banko. Mūsų veikla yra reguliuojama pagal ES direktyvas, o indėliai apdrausti iki 100,000 € per klientą. Jūsų pinigai yra saugūs.'
        }
      },
      notFound: {
        title: 'Neradote atsakymo į savo klausimą?',
        description: 'Susisiekite su mūsų ekspertų komanda - mes mielai padėsime',
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
          email: 'jusu.pastas@example.com',
          message: 'Jūsų klausimas...'
        }
      }
    },
    auth: {
      modal: {
        title: 'Banko sistema',
        login: 'Prisijungimas',
        signup: 'Registracija',
        email: 'El. paštas',
        password: 'Slaptažodis',
        name: 'Vardas Pavardė',
        confirmPassword: 'Pakartokite slaptažodį',
        loginButton: 'Prisijungti',
        signupButton: 'Registruotis',
        loading: 'Vykdoma...',
        emailPlaceholder: 'vardas@example.com',
        passwordPlaceholder: '••••••••',
        namePlaceholder: 'Vardas Pavardė',
        confirmPlaceholder: 'Pakartokite slaptažodį',
        passwordMinLength: 'Bent 6 simboliai',
        passwordMismatch: 'Slaptažodžiai nesutampa',
        accountCreation: 'Registracijos metu automatiškai bus sukurtas unikalus sąskaitos numeris',
        resendTitle: 'Nepatvirtintas el. paštas?',
        resendButton: 'Siųsti',
        resendPlaceholder: 'El. paštas'
      },
      protected: {
        loginRequired: 'Prašome prisijungti',
        loginDescription: 'Turite būti prisijungę, kad galėtumėte matyti šį turinį'
      }
    },
    forms: {
      required: '*',
      name: 'Vardas',
      email: 'El. paštas',
      phone: 'Telefonas',
      message: 'Žinutė',
      submit: 'Siųsti',
      sending: 'Siunčiama...',
      cancel: 'Atšaukti',
      success: 'Sėkmingai išsiųsta!',
      error: 'Klaida',
      placeholder: {
        name: 'Jūsų vardas',
        email: 'jusu.pastas@example.com',
        phone: '+370 XXX XXXXX',
        message: 'Jūsų žinutė...'
      }
    },
    modals: {
      registration: {
        title: 'Registracija',
        accountType: 'Sąskaitos tipas',
        personal: 'Asmeninė',
        company: 'Įmonės',
        campaign: {
          title: 'AKCIJA 50% NUOLAIDA!',
          subtitle: 'Naujiems klientams iki 2025-09-01',
          timeLeft: 'Liko:'
        },
        pricing: {
          originalPrice: 'Pradinė kaina:',
          discount: 'Nuolaida',
          finalPrice: 'Galutinė kaina:'
        },
        payment: 'Mokėti su Stripe',
        fillRequired: 'Užpildykite visus privalomatus laukus',
        paymentError: 'Nepavyko sukurti mokėjimo'
      },
      discount: {
        title: 'Prašyti nuolaidos kodo',
        subtitle: 'Užpildykite formą ir mes išsiųsime jums nuolaidos kodą per 24 valandas',
        howItWorks: 'Kaip tai veikia?',
        steps: {
          submit: 'Jūsų užklausa bus išsiųsta administratoriui',
          response: 'Per 24 val. gausite atsakymą el. paštu',
          code: 'Patvirtinus - gausite 50% nuolaidos kodą',
          validity: 'Kodas galioja 30 dienų'
        },
        submitButton: 'Siųsti užklausą'
      },
      board: {
        title: 'Tapti valdybos nariu',
        subtitle: 'Užpildykite formą ir mes su jumis susisieksime artimiausiu metu aptarti galimybes',
        warning: '⚠️ DĖMESIO: Norint tapti valdybos nariu, reikalingas įnašas – ne mažesnis kaip 100,000 litų.',
        experience: 'Patirtis ir motyvacija',
        experiencePlaceholder: 'Aprašykite savo patirtį finansų srityje, vadyboje ar susijusiose srityse, taip pat savo motyvaciją tapti valdybos nariu...',
        submitButton: 'Pateikti paraišką',
        submitting: 'Siunčiama...'
      },
      transfer: {
        title: 'Pinigų pervedimas',
        recipientAccount: 'Gavėjo sąskaitos numeris',
        recipientName: 'Gavėjo vardas, pavardė',
        amount: 'Suma (LT)',
        purpose: 'Paskirtis (neprivaloma)',
        purposePlaceholder: 'Mokėjimo paskirtis...',
        transfer: 'Pervesti',
        transferring: 'Vykdoma...',
        cancel: 'Atšaukti',
        errors: {
          positiveAmount: 'Suma turi būti teigiama',
          insufficientFunds: 'Nepakanka lėšų',
          transferFailed: 'Nepavyko įvykdyti pervedimo'
        },
        success: 'Pervedimas sėkmingas'
      }
    },
    contact: {
      badge: 'Susisiekite su mumis',
      title: 'Turime klausimų?',
      subtitle: 'Mūsų ekspertų komanda visada pasiruošusi padėti. Susisiekite su mumis bet kuriuo jums patogiu būdu.',
      form: {
        title: 'Parašykite mums'
      }
    },
    footer: {
      brand: 'LTB Bankas',
      brandDescription: 'Pirmasis pasaulyje bankas, mokantis palūkanas kasdien. Skaidru, saugu, be paslėptų mokesčių.',
      services: 'Paslaugos',
      dailyInterest: 'Dienos palūkanos',
      termDeposits: 'Terminuoti indėliai',
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
      amountLabel: 'Savings Amount',
      amount: 'Enter amount (LT)',
      rate: 'Interest rate:',
      rateValue: 'per year',
      results: {
        title: 'Your Profit',
        daily: 'Per day',
        monthly: 'Per month',
        yearly: 'Per year'
      },
      buttons: {
        manage: 'Manage Account',
        register: 'Register',
        login: 'Login'
      }
    },
    termDeposit: {
      badge: 'Term Deposit Calculator',
      title: 'Term Deposits',
      subtitle: 'Higher interest rates for larger deposits',
      termSelection: {
        title: 'Choose Term',
        subtitle: 'Different terms - different interest rates',
        oneYear: {
          title: '1 Year Term',
          subtitle: 'Traditional interest rates',
          rates: {
            up10k: 'Up to 10,000 LT:',
            up100k: '10,000-100,000 LT:',
            over100k: '100,000+ LT:'
          }
        },
        sixYear: {
          title: '6 Year Term',
          subtitle: 'Special offer',
          rate: '100%',
          forAnyAmount: 'For any amount!',
          badge: 'HIGHEST INTEREST'
        }
      },
      form: {
        enterAmount: 'Enter deposit amount',
        enterInvestment: 'Enter investment amount',
        sixYearNote: 'Choose amount to invest for 6 years with 100% interest',
        depositAmount: 'Deposit amount (LT)',
        maxAmount: 'max.',
        accountBalance: 'Account balance:',
        remainingBalance: 'Will remain in account:',
        overBalance: 'Amount exceeds account balance'
      },
      categories: {
        beginner: 'Beginner',
        advanced: 'Advanced',
        vip: 'VIP',
        vip6years: 'VIP 6 Years',
        level: 'level',
        yourRate: 'Your interest rate'
      },
      results: {
        title: 'Your Profit',
        yearlyProfit: 'Profit per year',
        totalProfit: 'Total profit for',
        oneYear: '1 year',
        sixYears: '6 years',
        totalAmount: 'Total amount:'
      },
      actions: {
        createDeposit: 'Create Term Deposit',
        login: 'Login to Create',
        register: 'Register Now',
        goToDashboard: 'Go to Dashboard'
      }
    },
    loans: {
      badge: 'Loan Calculator',
      title: 'Loan Calculator',
      subtitle: 'Find out your monthly payment with',
      interestRate: '14% annual interest rate',
      form: {
        loanAmount: 'Loan amount:',
        loanTerm: 'Loan term:',
        months: 'months',
        exactAmount: 'Exact amount (€)',
        exactTerm: 'Exact term (months)'
      },
      results: {
        monthlyPayment: 'YOU WILL PAY MONTHLY:',
        calculating: 'Calculating...',
        checkInput: 'Check input data',
        paymentNote: 'This amount will be paid monthly for',
        totalAmount: 'Total amount',
        interest: 'Interest'
      },
      schedule: {
        title: 'Payment Schedule',
        subtitle: 'Detailed breakdown of each monthly payment',
        headers: {
          month: 'Month',
          payment: 'Payment',
          principal: 'Principal',
          interest: 'Interest',
          balance: 'Balance'
        },
        showingFirst: 'Showing only first 12 months. Total:',
        totalMonths: 'months'
      },
      application: {
        title: 'Satisfied with calculation?',
        subtitle: 'Submit loan application and get decision within 24 hours',
        button: 'Submit Loan Application'
      },
      modal: {
        title: 'Loan Application',
        subtitle: 'Fill out the form and get decision within 24 hours',
        loanParams: 'Loan Parameters',
        amount: 'Amount',
        term: 'Term',
        monthlyPayment: 'Monthly payment',
        totalAmount: 'Total amount',
        personalInfo: 'Personal Information',
        fullName: 'Full name',
        email: 'Email address',
        phone: 'Phone number',
        financialInfo: 'Financial Information',
        monthlyIncome: 'Monthly income (€)',
        employment: 'Workplace',
        loanPurpose: 'Loan Purpose',
        purposeQuestion: 'What do you need the loan for?',
        purposePlaceholder: 'Briefly describe what you plan to use the loan for',
        terms: {
          title: 'I agree to the terms:',
          rate: '14% annual interest rate without hidden fees',
          decision: 'Decision within 24 hours',
          privacy: 'Data processing according to privacy policy',
          contact: 'Contact for additional information'
        },
        submit: 'Submit Application',
        submitting: 'Submitting application...',
        placeholders: {
          fullName: 'Your full name',
          email: 'your@email.com',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'Company Name'
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
      }
    },
    contact: {
      badge: 'Contact Us',
      title: 'Have Questions?',
      subtitle: 'Our expert team is always ready to help. Contact us in any way convenient for you.',
      form: {
        title: 'Write to Us'
    }
  },
    footer: {
      services: 'Services',
      information: 'Information',
      help: 'Help',
      techSupport: 'Technical Support',
      calculatorIssues: 'Calculator Issues:',
      copyright: 'All rights reserved.',
      licensed: 'Licensed by Bank of Lithuania',
      insured: 'Deposits insured up to €100,000',
      disclaimer: 'LTB Bank is a licensed credit institution supervised by the Bank of Lithuania. Deposits are insured under EU directives up to €100,000 per customer. Interest rates depend on market conditions and may change. Consult with our experts before making decisions.'
    }
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
          question: 'What\'s the minimum amount to start?',
          answer: 'The minimum deposit size is only €100. There are no maximum size restrictions, but deposits exceeding €100,000 are not insured under EU directives.'
        },
        q7: {
          question: 'How quickly do I get interest?',
          answer: 'Interest is calculated and added to your account daily. You can see your balance grow every day in our mobile app or online banking.'
        },
        q8: {
          question: 'What if you go bankrupt?',
          answer: 'LTB Bank is a licensed bank supervised by the Bank of Lithuania. Our operations are regulated according to EU directives, and deposits are insured up to €100,000 per client. Your money is safe.'
        }
      },
      notFound: {
        title: 'Didn\'t find the answer?',
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
      }
    },
    auth: {
      modal: {
        title: 'Banking System',
        login: 'Login',
        signup: 'Register',
        email: 'Email',
        password: 'Password',
        name: 'Full Name',
        confirmPassword: 'Confirm Password',
        loginButton: 'Login',
        signupButton: 'Register',
        loading: 'Processing...',
        emailPlaceholder: 'name@example.com',
        passwordPlaceholder: '••••••••',
        namePlaceholder: 'Full Name',
        confirmPlaceholder: 'Confirm Password',
        passwordMinLength: 'At least 6 characters',
        passwordMismatch: 'Passwords don\'t match',
        accountCreation: 'A unique account number will be automatically created during registration',
        resendTitle: 'Unconfirmed email?',
        resendButton: 'Send',
        resendPlaceholder: 'Email'
      },
      protected: {
        loginRequired: 'Please log in',
        loginDescription: 'You must be logged in to view this content'
      }
    },
    forms: {
      required: '*',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      submit: 'Send',
      sending: 'Sending...',
      cancel: 'Cancel',
      success: 'Successfully sent!',
      error: 'Error',
      placeholder: {
        name: 'Your name',
        email: 'your.email@example.com',
        phone: '+370 XXX XXXXX',
        message: 'Your message...'
      }
    },
    modals: {
      registration: {
        title: 'Registration',
        accountType: 'Account Type',
        personal: 'Personal',
        company: 'Company',
        campaign: {
          title: '50% DISCOUNT CAMPAIGN!',
          subtitle: 'For new clients until 2025-09-01',
          timeLeft: 'Time left:'
        },
        pricing: {
          originalPrice: 'Original price:',
          discount: 'Discount',
          finalPrice: 'Final price:'
        },
        payment: 'Pay with Stripe',
        fillRequired: 'Fill in all required fields',
        paymentError: 'Failed to create payment'
      },
      discount: {
        title: 'Request Discount Code',
        subtitle: 'Fill out the form and we\'ll send you a discount code within 24 hours',
        howItWorks: 'How it works?',
        steps: {
          submit: 'Your request will be sent to administrator',
          response: 'You\'ll receive response via email within 24 hours',
          code: 'Upon approval - you\'ll receive 50% discount code',
          validity: 'Code is valid for 30 days'
        },
        submitButton: 'Send Request'
      },
      board: {
        title: 'Become Board Member',
        subtitle: 'Fill out the form and we\'ll contact you soon to discuss opportunities',
        warning: '⚠️ ATTENTION: To become a board member, a contribution is required - no less than 100,000 litas.',
        experience: 'Experience and motivation',
        experiencePlaceholder: 'Describe your experience in finance, management or related fields, as well as your motivation to become a board member...',
        submitButton: 'Submit Application',
        submitting: 'Submitting...'
      },
      transfer: {
        title: 'Money Transfer',
        recipientAccount: 'Recipient\'s account number',
        recipientName: 'Recipient\'s name',
        amount: 'Amount (LT)',
        purpose: 'Purpose (optional)',
        purposePlaceholder: 'Payment purpose...',
        transfer: 'Transfer',
        transferring: 'Processing...',
        cancel: 'Cancel',
        errors: {
          positiveAmount: 'Amount must be positive',
          insufficientFunds: 'Insufficient funds',
          transferFailed: 'Failed to complete transfer'
        },
        success: 'Transfer successful'
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
        title: 'Безопасность',
        description: 'Ваши деньги защищены самыми современными решениями безопасности и страхованием.'
      },
      profitability: {
        title: 'Прибыльность',
        description: 'Мы предлагаем конкурентную годовую процентную ставку 8% с ежедневными выплатами процентов.'
      },
      experience: {
        title: 'Опыт',
        description: 'У нас многолетний опыт в сфере финансов и тысячи довольных клиентов.'
      }
    },
    hero: {
      title: 'Сберегайте разумно',
      subtitle: 'с ежедневными процентами',
      description: 'Первый в мире банк, выплачивающий проценты ежедневно. Прозрачно, безопасно, без скрытых комиссий – так выглядит современное сбережение.',
      ctaPrimary: 'Начать сберегать сейчас',
      ctaSecondary: 'Узнать больше',
      newSolutions: 'Инновационные решения для сбережений',
      features: {
        daily: {
          title: 'Ежедневные проценты',
          description: 'Получайте проценты каждый день, а не раз в году'
        },
        security: {
          title: '100% безопасность',
          description: 'Ваши деньги защищены банковской лицензией и страховкой'
        },
        noFees: {
          title: 'Без комиссий',
          description: 'Никаких скрытых комиссий или ежемесячных тарифов'
        }
      }
    },
    services: {
      badge: 'Наши услуги',
      title: 'Почему стоит выбрать LTB Банк?',
      subtitle: 'Мы предлагаем инновационные решения, которые помогут вам сберегать более эффективно и безопасно, чем когда-либо прежде.',
      items: {
        dailyInterest: {
          title: 'Ежедневные проценты',
          description: 'Получайте проценты каждый день, а не только в конце года. Ваши деньги работают каждый день.',
          badge: 'Самая популярная'
        },
        noReports: {
          title: 'Никаких отчётов',
          description: 'Никто не просит декларации или объяснения доходов. Просто сберегайте и получайте проценты.',
          badge: 'Просто'
        },
        confidentiality: {
          title: 'Конфиденциальность',
          description: 'Ваша финансовая информация строго конфиденциальна. Мы никому не раскрываем данные.',
          badge: 'Безопасно'
        },
        transparent: {
          title: 'Прозрачный расчёт',
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
          description: 'Получите кредит с прозрачной годовой процентной ставкой 14% без скрытых комиссий.',
          badge: 'Новое'
        }
      },
      cta: {
        title: 'Начните уже сегодня',
        description: 'Присоединяйтесь к тысячам клиентов, которые уже зарабатывают с LTB Банк',
        button: 'Зарегистрироваться сейчас'
      }
    },
    howItWorks: {
      badge: 'Простой процесс',
      title: 'Как это работает?',
      subtitle: 'Начать сберегать с LTB Банк просто и быстро. Вот как это работает.',
      steps: {
        register: {
          title: 'Зарегистрируйтесь',
          description: 'Создайте аккаунт за 3 минуты. Никаких сложных документов или отчётов не требуется.'
        },
        deposit: {
          title: 'Внесите деньги',
          description: 'Внесите деньги на свой счёт из любого банка мира, внесение безопасное и быстрое.'
        },
        earn: {
          title: 'Получайте проценты',
          description: 'Ваши деньги начнут работать сразу. Проценты рассчитываются и выплачиваются ежедневно.'
        },
        withdraw: {
          title: 'Пользуйтесь деньгами',
          description: 'Деньги доступны в любое время. Можете снять всю сумму или только часть - как вам удобно.'
        }
      },
      cta: {
        title: 'Готовы начать сберегать?',
        description: 'Присоединяйтесь к тысячам клиентов, которые уже зарабатывают с LTB Банк',
        buttonPrimary: 'Зарегистрироваться сейчас',
        buttonSecondary: 'Читать далее'
      }
    },
    calculator: {
      badge: 'Калькулятор процентов',
      title: 'Рассчитайте свою прибыль',
      subtitle: 'Узнайте, сколько вы заработаете с нашими ежедневными процентами',
      amountLabel: 'Сумма накоплений',
      amount: 'Введите сумму (LT)',
      rate: 'Процентная ставка:',
      rateValue: 'в год',
      results: {
        title: 'Ваша прибыль',
        daily: 'В день',
        monthly: 'В месяц',
        yearly: 'В год'
      },
      buttons: {
        manage: 'Управлять счётом',
        register: 'Регистрация',
        login: 'Войти'
      }
    },
    termDeposit: {
      badge: 'Калькулятор срочных депозитов',
      title: 'Срочные депозиты',
      subtitle: 'Более высокие процентные ставки для больших депозитов',
      termSelection: {
        title: 'Выберите срок',
        subtitle: 'Разные сроки - разные проценты',
        oneYear: {
          title: 'Срок 1 год',
          subtitle: 'Традиционные процентные ставки',
          rates: {
            up10k: 'До 10,000 LT:',
            up100k: '10,000-100,000 LT:',
            over100k: '100,000+ LT:'
          }
        },
        sixYear: {
          title: 'Срок 6 лет',
          subtitle: 'Особое предложение',
          rate: '100%',
          forAnyAmount: 'Для любой суммы!',
          badge: 'САМЫЕ ВЫСОКИЕ ПРОЦЕНТЫ'
        }
      },
      form: {
        enterAmount: 'Введите сумму депозита',
        enterInvestment: 'Введите инвестируемую сумму',
        sixYearNote: 'Выберите сумму, которую хотите инвестировать на 6 лет под 100% годовых',
        depositAmount: 'Сумма депозита (LT)',
        maxAmount: 'макс.',
        accountBalance: 'Баланс счёта:',
        remainingBalance: 'Останется на счёте:',
        overBalance: 'Сумма превышает баланс счёта'
      },
      categories: {
        beginner: 'Начинающий',
        advanced: 'Продвинутый',
        vip: 'VIP',
        vip6years: 'VIP 6 лет',
        level: 'уровень',
        yourRate: 'Ваша процентная ставка'
      },
      results: {
        title: 'Ваша прибыль',
        yearlyProfit: 'Прибыль в год',
        totalProfit: 'Общая прибыль за',
        oneYear: '1 год',
        sixYears: '6 лет',
        totalAmount: 'Получаемая сумма:'
      },
      actions: {
        createDeposit: 'Создать срочный депозит',
        login: 'Войдите, чтобы создать',
        register: 'Зарегистрироваться сейчас',
        goToDashboard: 'Перейти в аккаунт'
      }
    },
    loans: {
      badge: 'Калькулятор кредитов',
      title: 'Калькулятор кредитов',
      subtitle: 'Узнайте размер ежемесячного платежа с',
      interestRate: '14% годовой процентной ставкой',
      form: {
        loanAmount: 'Сумма кредита:',
        loanTerm: 'Срок кредита:',
        months: 'мес.',
        exactAmount: 'Точная сумма (€)',
        exactTerm: 'Точный срок (мес.)'
      },
      results: {
        monthlyPayment: 'ВЫ БУДЕТЕ ПЛАТИТЬ ЕЖЕМЕСЯЧНО:',
        calculating: 'Рассчитывается...',
        checkInput: 'Проверьте входные данные',
        paymentNote: 'Эта сумма будет выплачиваться ежемесячно в течение',
        totalAmount: 'Общая сумма',
        interest: 'Проценты'
      },
      schedule: {
        title: 'График платежей',
        subtitle: 'Подробная разбивка каждого ежемесячного платежа',
        headers: {
          month: 'Месяц',
          payment: 'Платёж',
          principal: 'Основной долг',
          interest: 'Проценты',
          balance: 'Остаток'
        },
        showingFirst: 'Показаны только первые 12 месяцев. Всего:',
        totalMonths: 'месяцев'
      },
      application: {
        title: 'Довольны расчётом?',
        subtitle: 'Подайте заявку на кредит и получите решение в течение 24 часов',
        button: 'Подать заявку на кредит'
      },
      modal: {
        title: 'Заявка на кредит',
        subtitle: 'Заполните форму и получите решение в течение 24 часов',
        loanParams: 'Параметры кредита',
        amount: 'Сумма',
        term: 'Срок',
        monthlyPayment: 'Ежемесячный платёж',
        totalAmount: 'Общая сумма',
        personalInfo: 'Личные данные',
        fullName: 'Полное имя',
        email: 'Адрес электронной почты',
        phone: 'Номер телефона',
        financialInfo: 'Финансовая информация',
        monthlyIncome: 'Ежемесячный доход (€)',
        employment: 'Место работы',
        loanPurpose: 'Цель кредита',
        purposeQuestion: 'Для чего вам нужен кредит?',
        purposePlaceholder: 'Кратко опишите, на что планируете использовать кредит',
        terms: {
          title: 'Соглашаюсь с условиями:',
          rate: '14% годовая процентная ставка без скрытых комиссий',
          decision: 'Решение в течение 24 часов',
          privacy: 'Обработка данных согласно политике конфиденциальности',
          contact: 'Связь для получения дополнительной информации'
        },
        submit: 'Подать заявку',
        submitting: 'Подача заявки...',
        placeholders: {
          fullName: 'Ваше полное имя',
          email: 'ваш@email.com',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'Название компании'
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
      }
    },
    contact: {
      badge: 'Свяжитесь с нами',
      title: 'Есть вопросы?',
      subtitle: 'Наша команда экспертов всегда готова помочь. Свяжитесь с нами любым удобным для вас способом.',
      form: {
        title: 'Напишите нам'
      }
    },
    footer: {
      services: 'Услуги',
      information: 'Информация',
      help: 'Помощь',
      techSupport: 'Техническая поддержка',
      calculatorIssues: 'Проблемы с калькуляторами:',
      copyright: 'Все права защищены.',
      licensed: 'Лицензирован Банком Литвы',
      insured: 'Депозиты застрахованы до €100,000',
      disclaimer: 'LTB Банк является лицензированным кредитным учреждением, надзор осуществляет Банк Литвы. Депозиты застрахованы согласно директивам ЕС до €100,000 на клиента. Размер процентов зависит от рыночных условий и может изменяться. Перед принятием решений консультируйтесь с нашими экспертами.'
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
      title: 'Rechnertyp wählen',
      daily: 'Tägliche Zinsen',
      term: 'Festgeld',
      loans: 'Kredite'
    },
    about: {
      title: 'LTB Bank - Ihr vertrauensvoller Partner',
      subtitle: 'Wir sind ein innovativer Anbieter von Finanzlösungen, der Kunden dabei hilft, Geld sicher und profitabel zu sparen.',
      security: {
        title: 'Sicherheit',
        description: 'Ihr Geld ist durch modernste Sicherheitslösungen und Versicherungen geschützt.'
      },
      profitability: {
        title: 'Rentabilität',
        description: 'Wir bieten einen wettbewerbsfähigen Jahreszinssatz von 8% mit täglichen Zinszahlungen.'
      },
      experience: {
        title: 'Erfahrung',
        description: 'Wir haben jahrelange Erfahrung im Finanzbereich und Tausende zufriedene Kunden.'
      }
    },
    hero: {
      title: 'Sparen Sie klug',
      subtitle: 'mit täglichen Zinsen',
      description: 'Die weltweit erste Bank, die täglich Zinsen zahlt. Transparent, sicher, ohne versteckte Gebühren – so sieht modernes Sparen aus.',
      ctaPrimary: 'Jetzt sparen starten',
      ctaSecondary: 'Mehr erfahren',
      newSolutions: 'Innovative Sparlösungen',
      features: {
        daily: {
          title: 'Tägliche Zinsen',
          description: 'Erhalten Sie täglich Zinsen, nicht nur einmal im Jahr'
        },
        security: {
          title: '100% Sicherheit',
          description: 'Ihr Geld ist durch Banklizenz und Versicherung geschützt'
        },
        noFees: {
          title: 'Keine Gebühren',
          description: 'Keine versteckten Gebühren oder monatlichen Tarife'
        }
      }
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
          description: 'Niemand verlangt Erklärungen oder Einkommensnachweise. Einfach sparen und Zinsen erhalten.',
          badge: 'Einfach'
        },
        confidentiality: {
          title: 'Vertraulichkeit',
          description: 'Ihre Finanzinformationen sind streng vertraulich. Wir geben keine Daten an Dritte weiter.',
          badge: 'Sicher'
        },
        transparent: {
          title: 'Transparente Berechnung',
          description: 'Sie wissen immer, wie viel Sie verdienen werden. Keine versteckten Gebühren oder komplexen Bedingungen.',
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
          description: 'Erhalten Sie einen Kredit mit transparentem 14% Jahreszinssatz ohne versteckte Gebühren.',
          badge: 'Neu'
        }
      },
      cta: {
        title: 'Heute beginnen',
        description: 'Schließen Sie sich Tausenden von Kunden an, die bereits mit LTB Bank verdienen',
        button: 'Jetzt registrieren'
      }
    },
    howItWorks: {
      badge: 'Einfacher Prozess',
      title: 'Wie funktioniert es?',
      subtitle: 'Mit LTB Bank zu sparen ist einfach und schnell. So funktioniert es.',
      steps: {
        register: {
          title: 'Registrieren',
          description: 'Erstellen Sie ein Konto in 3 Minuten. Keine komplexen Dokumente oder Berichte erforderlich.'
        },
        deposit: {
          title: 'Geld einzahlen',
          description: 'Zahlen Sie Geld von jeder Bank weltweit auf Ihr Konto ein, sicher und schnell.'
        },
        earn: {
          title: 'Zinsen verdienen',
          description: 'Ihr Geld beginnt sofort zu arbeiten. Zinsen werden täglich berechnet und gezahlt.'
        },
        withdraw: {
          title: 'Geld verwenden',
          description: 'Geld ist jederzeit verfügbar. Sie können alles oder nur einen Teil abheben - ganz nach Ihrem Bedarf.'
        }
      },
      cta: {
        title: 'Bereit, mit dem Sparen zu beginnen?',
        description: 'Schließen Sie sich Tausenden von Kunden an, die bereits mit LTB Bank verdienen',
        buttonPrimary: 'Jetzt registrieren',
        buttonSecondary: 'Weiterlesen'
      }
    },
    calculator: {
      badge: 'Zinsrechner',
      title: 'Berechnen Sie Ihren Gewinn',
      subtitle: 'Finden Sie heraus, wie viel Sie mit unseren täglichen Zinsen verdienen',
      amountLabel: 'Sparbetrag',
      amount: 'Betrag eingeben (LT)',
      rate: 'Zinssatz:',
      rateValue: 'pro Jahr',
      results: {
        title: 'Ihr Gewinn',
        daily: 'Pro Tag',
        monthly: 'Pro Monat',
        yearly: 'Pro Jahr'
      },
      buttons: {
        manage: 'Konto verwalten',
        register: 'Registrieren',
        login: 'Anmelden'
      }
    },
    termDeposit: {
      badge: 'Festgeld-Rechner',
      title: 'Festgeld',
      subtitle: 'Höhere Zinssätze für größere Einlagen',
      termSelection: {
        title: 'Laufzeit wählen',
        subtitle: 'Verschiedene Laufzeiten - verschiedene Zinssätze',
        oneYear: {
          title: '1 Jahr Laufzeit',
          subtitle: 'Traditionelle Zinssätze',
          rates: {
            up10k: 'Bis 10.000 LT:',
            up100k: '10.000-100.000 LT:',
            over100k: '100.000+ LT:'
          }
        },
        sixYear: {
          title: '6 Jahre Laufzeit',
          subtitle: 'Sonderangebot',
          rate: '100%',
          forAnyAmount: 'Für jeden Betrag!',
          badge: 'HÖCHSTE ZINSEN'
        }
      },
      form: {
        enterAmount: 'Einlagenbetrag eingeben',
        enterInvestment: 'Investitionsbetrag eingeben',
        sixYearNote: 'Wählen Sie den Betrag, den Sie 6 Jahre lang zu 100% Zinsen investieren möchten',
        depositAmount: 'Einlagenbetrag (LT)',
        maxAmount: 'max.',
        accountBalance: 'Kontostand:',
        remainingBalance: 'Verbleibt auf dem Konto:',
        overBalance: 'Betrag übersteigt Kontostand'
      },
      categories: {
        beginner: 'Anfänger',
        advanced: 'Fortgeschritten',
        vip: 'VIP',
        vip6years: 'VIP 6 Jahre',
        level: 'Stufe',
        yourRate: 'Ihr Zinssatz'
      },
      results: {
        title: 'Ihr Gewinn',
        yearlyProfit: 'Gewinn pro Jahr',
        totalProfit: 'Gesamtgewinn für',
        oneYear: '1 Jahr',
        sixYears: '6 Jahre',
        totalAmount: 'Erhaltener Betrag:'
      },
      actions: {
        createDeposit: 'Festgeld erstellen',
        login: 'Anmelden zum Erstellen',
        register: 'Jetzt registrieren',
        goToDashboard: 'Zum Konto gehen'
      }
    },
    loans: {
      badge: 'Kreditrechner',
      title: 'Kreditrechner',
      subtitle: 'Ermitteln Sie Ihre monatliche Rate mit',
      interestRate: '14% Jahreszinssatz',
      form: {
        loanAmount: 'Kreditsumme:',
        loanTerm: 'Kreditlaufzeit:',
        months: 'Monate',
        exactAmount: 'Genauer Betrag (€)',
        exactTerm: 'Genaue Laufzeit (Monate)'
      },
      results: {
        monthlyPayment: 'SIE ZAHLEN MONATLICH:',
        calculating: 'Wird berechnet...',
        checkInput: 'Eingabedaten prüfen',
        paymentNote: 'Dieser Betrag wird monatlich für',
        totalAmount: 'Gesamtbetrag',
        interest: 'Zinsen'
      },
      schedule: {
        title: 'Tilgungsplan',
        subtitle: 'Detaillierte Aufschlüsselung jeder monatlichen Zahlung',
        headers: {
          month: 'Monat',
          payment: 'Zahlung',
          principal: 'Tilgung',
          interest: 'Zinsen',
          balance: 'Restschuld'
        },
        showingFirst: 'Zeigt nur die ersten 12 Monate. Insgesamt:',
        totalMonths: 'Monate'
      },
      application: {
        title: 'Zufrieden mit der Berechnung?',
        subtitle: 'Stellen Sie einen Kreditantrag und erhalten Sie innerhalb von 24 Stunden eine Entscheidung',
        button: 'Kreditantrag stellen'
      },
      modal: {
        title: 'Kreditantrag',
        subtitle: 'Füllen Sie das Formular aus und erhalten Sie innerhalb von 24 Stunden eine Entscheidung',
        loanParams: 'Kreditparameter',
        amount: 'Betrag',
        term: 'Laufzeit',
        monthlyPayment: 'Monatliche Rate',
        totalAmount: 'Gesamtbetrag',
        personalInfo: 'Persönliche Daten',
        fullName: 'Vollständiger Name',
        email: 'E-Mail-Adresse',
        phone: 'Telefonnummer',
        financialInfo: 'Finanzielle Informationen',
        monthlyIncome: 'Monatliches Einkommen (€)',
        employment: 'Arbeitsplatz',
        loanPurpose: 'Kreditzweck',
        purposeQuestion: 'Wofür benötigen Sie den Kredit?',
        purposePlaceholder: 'Beschreiben Sie kurz, wofür Sie den Kredit verwenden möchten',
        terms: {
          title: 'Ich stimme den Bedingungen zu:',
          rate: '14% Jahreszinssatz ohne versteckte Gebühren',
          decision: 'Entscheidung innerhalb von 24 Stunden',
          privacy: 'Datenverarbeitung gemäß Datenschutzrichtlinie',
          contact: 'Kontakt für zusätzliche Informationen'
        },
        submit: 'Antrag stellen',
        submitting: 'Antrag wird gestellt...',
        placeholders: {
          fullName: 'Ihr vollständiger Name',
          email: 'ihre@email.com',
          phone: '+370 600 00000',
          monthlyIncome: '2000',
          employment: 'Firmenname'
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
          email: 'ihre.email@beispiel.com',
          message: 'Ihre Frage...'
        }
      }
    },
    contact: {
      badge: 'Kontaktieren Sie uns',
      title: 'Haben Sie Fragen?',
      subtitle: 'Unser Expertenteam ist immer bereit zu helfen. Kontaktieren Sie uns auf eine für Sie bequeme Weise.',
      form: {
        title: 'Schreiben Sie uns'
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
      insured: 'Einlagen bis zu €100.000 versichert',
      disclaimer: 'LTB Bank ist ein lizenziertes Kreditinstitut unter Aufsicht der Bank von Litauen. Einlagen sind gemäß EU-Richtlinien bis zu €100.000 pro Kunde versichert. Zinssätze hängen von Marktbedingungen ab und können sich ändern. Konsultieren Sie unsere Experten vor Entscheidungen.'
    }
  }
});

