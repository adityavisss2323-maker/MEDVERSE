import { en } from "./en";
import { hi } from "./hi";
import { gu } from "./gu";

export const translations = {
  en,
  hi,
  gu,
};

export function getTranslation(lang, key) {
  const dictionary = translations[lang] || translations.en;
  const keys = key.split(".");
  let val = dictionary;
  for (const k of keys) {
    if (val && val[k] !== undefined) {
      val = val[k];
    } else {
      // Fallback to English key
      let fallbackVal = translations.en;
      for (const fk of keys) {
        if (fallbackVal && fallbackVal[fk] !== undefined) {
          fallbackVal = fallbackVal[fk];
        } else {
          return key;
        }
      }
      return fallbackVal;
    }
  }
  return val;
}
