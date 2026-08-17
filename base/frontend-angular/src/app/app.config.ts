import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { API_BASE, API_BASE_PADRAO } from './nucleo/api';
import { rotas } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(rotas),
    provideHttpClient(),
    { provide: API_BASE, useValue: API_BASE_PADRAO }
  ]
};
