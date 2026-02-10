import { Injectable, signal } from '@angular/core';

export interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = signal<string>('es');
  private translations = signal<Translations>({});

  constructor() {
    this.loadLanguage(this.getCurrentLanguage());
  }

  getCurrentLanguage(): string {
    const saved = localStorage.getItem('language');
    return saved || 'es';
  }

  setLanguage(lang: string): void {
    this.currentLang.set(lang);
    localStorage.setItem('language', lang);
    this.loadLanguage(lang);
  }

  private async loadLanguage(lang: string): Promise<void> {
    try {
      const translations = await import(`../../i18n/${lang}.json`);
      this.translations.set(translations.default);
    } catch (error) {
      console.error(`Error loading language ${lang}:`, error);
    }
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let value: any = this.translations();

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{{${param}}}`, String(params[param]));
      });
    }

    return value;
  }

  // Alias corto para usar en templates
  t(key: string, params?: { [key: string]: string | number }): string {
    return this.translate(key, params);
  }
}
