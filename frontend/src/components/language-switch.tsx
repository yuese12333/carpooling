/**
 * @file language-switch.tsx
 * @description 语言切换组件
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguageStore } from '@/store/language-store';
import { COLORS } from '@/pages/style';

interface LanguageSwitchProps {
  compact?: boolean;
}

export function LanguageSwitch({ compact = false }: LanguageSwitchProps) {
  const { language, setLanguage, supportedLanguages } = useLanguageStore();

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactButton}
        onPress={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      >
        <Text style={styles.compactText}>
          {language === 'zh' ? 'EN' : '中'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {supportedLanguages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            language === lang.code && styles.activeButton,
          ]}
          onPress={() => setLanguage(lang.code)}
        >
          <Text
            style={[
              styles.buttonText,
              language === lang.code && styles.activeButtonText,
            ]}
          >
            {lang.nativeName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.bgGrey,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activeButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
