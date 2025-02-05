import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { register } from 'swiper/element/bundle';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { progressBarInterceptor } from './shared/interceptors/progress-bar.interceptor';

registerLocaleData(localeEsMx);

register();

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), 
    { provide: LOCALE_ID, useValue: 'es-MX' }, 
    provideAnimationsAsync(), 
    provideHttpClient(withInterceptors([progressBarInterceptor]))
  ]
};
