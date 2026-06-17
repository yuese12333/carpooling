/**
 * @file i18n 配置
 * @description 多语言国际化配置，支持中英文切换
 */

import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import zh from './locales/zh.json';
import en from './locales/en.json';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '简体中文', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
] as const;

export type LanguageCode = 'zh' | 'en';

// 创建 i18n 实例
const i18n = new I18n(
  { zh, en },
  {
    defaultLocale: 'zh',
    locale: 'zh',
    enableFallback: true,
    missingBehavior: 'guess',
  }
);

/**
 * 获取系统语言
 */
export function getSystemLanguage(): LanguageCode {
  const locales = getLocales();
  const systemLang = locales[0]?.languageCode || 'zh';

  // 只支持 zh 和 en，其他默认中文
  if (systemLang === 'en') return 'en';
  return 'zh';
}

/**
 * 设置当前语言
 */
export function setLanguage(lang: LanguageCode): void {
  i18n.locale = lang;
}

/**
 * 获取当前语言
 */
export function getCurrentLanguage(): LanguageCode {
  return i18n.locale as LanguageCode;
}

/**
 * 翻译函数
 * @param key - 翻译键，如 "common.confirm"
 * @param options - 插值参数
 */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

/**
 * 检查键是否存在
 */
export function has(key: string): boolean {
  return i18n.exists(key);
}

export { i18n };
