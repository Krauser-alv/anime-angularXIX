import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { register } from 'swiper/element';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import localeEn from '@angular/common/locales/en';
import { progressBarInterceptor } from './shared/interceptors/progress-bar.interceptor';

// Registrar ambos locales
registerLocaleData(localeEsMx, 'es-MX');
registerLocaleData(localeEn, 'en-US');

// Registrar Swiper con los módulos necesarios
register();

// Configurar los módulos globalmente
import Swiper from 'swiper';
Swiper.use([Autoplay, Navigation, Pagination]);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), 
    { provide: LOCALE_ID, useValue: 'es-MX' }, 
    provideAnimationsAsync(), 
    provideHttpClient(withInterceptors([progressBarInterceptor]))
  ]
};
