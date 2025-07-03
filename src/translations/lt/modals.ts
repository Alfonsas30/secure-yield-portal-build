export const modals = {
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
    warning: '⚠️ DĖMESIO: Norint tapti valdybos nariu, reikalingas įnašas – ne mažesnis kaip 100,000 €.',
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
      monthlyIncome: 'Mėnesinės pajamos (LT)',
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
};