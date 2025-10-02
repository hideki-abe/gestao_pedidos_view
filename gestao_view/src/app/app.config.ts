import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'csrftoken',  
        headerName: 'X-CSRFToken',  
      })
    ),

    provideAnimations(), // Habilita o sistema de animações do Angular
    provideToastr({      // Configura o ngx-toastr
      timeOut: 4000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
  ]
};
