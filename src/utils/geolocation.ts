// Geographic language detection utility
let cachedCountryCode: string | null = null;
let isDetecting = false;

export const detectCountryFromIP = async (): Promise<string> => {
  // Return cached result if available
  if (cachedCountryCode) {
    return cachedCountryCode;
  }

  // Prevent multiple simultaneous requests
  if (isDetecting) {
    return 'unknown';
  }

  isDetecting = true;

  try {
    // Try ipapi.co first (free, no registration required)
    const response = await fetch('https://ipapi.co/country_code/', {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (response.ok) {
      const countryCode = await response.text();
      cachedCountryCode = countryCode.trim().toUpperCase();
      
      // Cache in localStorage for future visits
      localStorage.setItem('ltb_detected_country', cachedCountryCode);
      
      return cachedCountryCode;
    }
  } catch (error) {
    console.warn('Geolocation detection failed:', error);
  }

  isDetecting = false;
  return 'unknown';
};

export const getLanguageFromCountry = async (): Promise<string> => {
  // Check localStorage cache first
  const cachedCountry = localStorage.getItem('ltb_detected_country');
  if (cachedCountry) {
    return cachedCountry === 'LT' ? 'lt' : 'en';
  }

  const countryCode = await detectCountryFromIP();
  
  // Lithuania = Lithuanian, all others = English
  return countryCode === 'LT' ? 'lt' : 'en';
};