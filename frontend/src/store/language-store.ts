/**
 * @file language-store.ts
 * @description 语言设置全局状态管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage, getSystemLanguage, LanguageCode, SUPPORTED_LANGUAGES } from '@/i18n';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  getLanguageName: (lang?: LanguageCode) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: getSystemLanguage(),
      supportedLanguages: SUPPORTED_LANGUAGES,

      setLanguage: (lang: LanguageCode) => {
        setLanguage(lang);
        set({ language: lang });
      },

      toggleLanguage: () => {
        const current = get().language;
        const newLang: LanguageCode = current === 'zh' ? 'en' : 'zh';
        setLanguage(newLang);
        set({ language: newLang });
      },

      getLanguageName: (lang?: LanguageCode) => {
        const code = lang || get().language;
        const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
        return found?.nativeName || code;
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // 恢复存储后，同步 i18n 实例的语言设置
        if (state?.language) {
          setLanguage(state.language);
        }
      },
    }
  )
);
