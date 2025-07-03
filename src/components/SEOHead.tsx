import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noIndex?: boolean;
}

export function SEOHead({ 
  title, 
  description, 
  keywords, 
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  type = "website",
  noIndex = false
}: SEOHeadProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLanguage = i18n.language;
  
  const baseUrl = "https://ltb-bankas.lovable.app";
  const currentUrl = `${baseUrl}${location.pathname}${location.search}`;
  
  // Dynamic meta content based on current language and page
  const metaTitle = title || t('seo.defaultTitle');
  const metaDescription = description || t('seo.defaultDescription');
  const metaKeywords = keywords || t('seo.defaultKeywords');
  
  useEffect(() => {
    // Update document title
    document.title = metaTitle;
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', metaDescription);
    }
    
    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', metaKeywords);
    }
    
    // Update robots meta
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
      robotsMeta.setAttribute('content', robotsContent);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    }
    
    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', metaTitle);
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', metaDescription);
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentUrl);
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);
    
    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', type);
    
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      const locale = currentLanguage === 'lt' ? 'lt_LT' : 'en_US';
      ogLocale.setAttribute('content', locale);
    }
    
    // Update Twitter meta tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', metaTitle);
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', metaDescription);
    
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', currentUrl);
    
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', image);
    
    // Update language attribute on html element
    document.documentElement.lang = currentLanguage;
    
    // Update hreflang links
    const updateHreflang = () => {
      const existingHreflang = document.querySelectorAll('link[rel="alternate"]');
      existingHreflang.forEach(link => link.remove());
      
      const head = document.head;
      
      // Add hreflang for Lithuanian
      const ltLink = document.createElement('link');
      ltLink.rel = 'alternate';
      ltLink.hreflang = 'lt';
      ltLink.href = `${baseUrl}${location.pathname}`;
      head.appendChild(ltLink);
      
      // Add hreflang for English
      const enLink = document.createElement('link');
      enLink.rel = 'alternate';
      enLink.hreflang = 'en';
      enLink.href = `${baseUrl}${location.pathname}?lang=en`;
      head.appendChild(enLink);
      
      // Add default hreflang
      const defaultLink = document.createElement('link');
      defaultLink.rel = 'alternate';
      defaultLink.hreflang = 'x-default';
      defaultLink.href = `${baseUrl}${location.pathname}`;
      head.appendChild(defaultLink);
    };
    
    updateHreflang();
    
  }, [metaTitle, metaDescription, metaKeywords, currentUrl, image, type, noIndex, currentLanguage, location.pathname]);
  
  return null; // This component doesn't render anything
}