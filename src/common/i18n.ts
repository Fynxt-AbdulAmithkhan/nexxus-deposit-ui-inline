import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';

/**
 * Minimal i18n setup for the copied CRM screens, which label every field through
 * `t(...)`. Only the `fees`, `transactionLimits` and `common` namespaces used by those
 * screens are bundled (lifted from the CRM's en translations).
 */
i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
});

export default i18n;
